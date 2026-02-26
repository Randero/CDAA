import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  PlayCircle,
  ArrowRight,
  GraduationCap,
  Trophy,
  Target,
  FileText,
  Bell,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { CourseProgressCard } from "@/components/dashboard/CourseProgressCard";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

function RecentNotifications({ userId }: { userId?: string }) {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["recent-notifications", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter((n) => !n.is_read).length || 0;

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!notifications?.length) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Recent Notifications
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-1">{unreadCount} new</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                !notif.is_read ? "bg-primary/5 border border-primary/10" : "bg-secondary/50"
              }`}
            >
              <Bell className={`h-4 w-4 mt-0.5 shrink-0 ${
                notif.type === "success" ? "text-emerald-500" :
                notif.type === "warning" ? "text-amber-500" :
                "text-primary"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{notif.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
              </div>
              {!notif.is_read && <span className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function StudentDashboard() {
  const { user } = useUserRole();

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["student-enrollments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          course:courses(*)
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery({
    queryKey: ["student-certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch assignments for enrolled courses
  const { data: assignments } = useQuery({
    queryKey: ["student-course-assignments", user?.id],
    queryFn: async () => {
      if (!user?.id || !enrollments?.length) return [];
      const courseIds = enrollments.map((e) => e.course_id).filter(Boolean);
      if (courseIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from("assignments")
        .select("*")
        .in("course_id", courseIds)
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!enrollments?.length,
  });

  // Fetch submissions
  const { data: submissions } = useQuery({
    queryKey: ["student-all-submissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("student_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Get upcoming assignments with deadlines
  const upcomingAssignments = assignments
    ?.filter((a) => {
      const hasDeadline = a.due_date && new Date(a.due_date) > new Date();
      const notSubmitted = !submissions?.find((s) => s.assignment_id === a.id);
      return hasDeadline && notSubmitted;
    })
    .slice(0, 3) || [];

  const inProgressCourses = enrollments?.filter((e) => !e.completed_at) || [];
  const completedCourses = enrollments?.filter((e) => e.completed_at) || [];
  const totalProgress = enrollments?.length
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  const stats = [
    {
      title: "Enrolled Courses",
      value: enrollments?.length || 0,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "In Progress",
      value: inProgressCourses.length,
      icon: Clock,
      color: "text-cyan",
      bgColor: "bg-cyan/10",
    },
    {
      title: "Completed",
      value: completedCourses.length,
      icon: Trophy,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Certificates",
      value: certificates?.length || 0,
      icon: Award,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <DashboardLayout type="student">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your learning progress and continue your cybersecurity journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Overall Progress */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Overall Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Average completion</span>
                <span className="font-medium text-foreground">{totalProgress}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Course Progress Analytics */}
        {inProgressCourses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Course Progress & Analytics
              </h2>
              <Link to="/student/courses">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressCourses.slice(0, 3).map((enrollment) => {
                const courseAssignments = assignments?.filter(
                  (a) => a.course_id === enrollment.course_id
                ) || [];
                const courseSubmissions = submissions?.filter((s) =>
                  courseAssignments.some((a) => a.id === s.assignment_id)
                ) || [];

                return (
                  <CourseProgressCard
                    key={enrollment.id}
                    courseName={enrollment.course?.title || "Unknown Course"}
                    totalPoints={enrollment.course?.total_points || 100}
                    assignments={courseAssignments}
                    submissions={courseSubmissions}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {upcomingAssignments.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Upcoming Deadlines
              </CardTitle>
              <Link to="/student/assignments">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{assignment.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Weight: {assignment.weight || 10} pts | Max: {assignment.max_score} pts
                        </p>
                      </div>
                    </div>
                    <CountdownTimer targetDate={assignment.due_date} compact />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Notifications */}
        <RecentNotifications userId={user?.id} />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Continue Learning */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-cyan" />
                Continue Learning
              </CardTitle>
              <Link to="/student/courses">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {enrollmentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : inProgressCourses.length === 0 ? (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No courses in progress</p>
                  <Link to="/courses">
                    <Button variant="outline" className="mt-4">
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inProgressCourses.slice(0, 3).map((enrollment) => (
                    <div
                      key={enrollment.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {enrollment.course?.thumbnail ? (
                          <img
                            src={enrollment.course.thumbnail}
                            alt={enrollment.course.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {enrollment.course?.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress value={enrollment.progress || 0} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                      </div>
                      <Link to={`/courses/${enrollment.course?.slug}`}>
                        <Button size="sm" variant="outline">
                          Continue
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Certificates */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                Recent Certificates
              </CardTitle>
              <Link to="/student/certificates">
                <Button variant="ghost" size="sm">
                  View All <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {certificatesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : certificates?.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No certificates yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Complete courses to earn certificates
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates?.slice(0, 3).map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                    >
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Award className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {cert.course_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Issued on {new Date(cert.issued_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        #{cert.verification_id.slice(0, 8)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
