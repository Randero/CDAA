import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function InstructorDashboard() {
  const { user } = useUserRole();

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

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: enrollmentStats } = useQuery({
    queryKey: ["instructor-enrollment-stats", courses?.map(c => c.id)],
    queryFn: async () => {
      if (!courses?.length) return { total: 0, completed: 0 };
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, completed_at")
        .in("course_id", courses.map(c => c.id));

      if (error) throw error;
      
      return {
        total: data?.length || 0,
        completed: data?.filter(e => e.completed_at).length || 0,
      };
    },
    enabled: !!courses?.length,
  });

  const publishedCourses = courses?.filter(c => c.status === "approved") || [];
  const pendingCourses = courses?.filter(c => c.status === "submitted") || [];
  const draftCourses = courses?.filter(c => c.status === "draft") || [];
  const totalStudents = enrollmentStats?.total || 0;
  const totalRevenue = courses?.reduce((acc, c) => acc + ((c.students_count || 0) * (c.price || 0)), 0) || 0;
  const avgRating = courses?.length 
    ? courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length 
    : 0;

  const stats = [
    {
      title: "Total Courses",
      value: courses?.length || 0,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-cyan",
      bgColor: "bg-cyan/10",
    },
    {
      title: "Avg. Rating",
      value: avgRating.toFixed(1),
      icon: Star,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Est. Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
      approved: { variant: "default", icon: CheckCircle2 },
      submitted: { variant: "secondary", icon: Clock },
      draft: { variant: "outline", icon: FileText },
      rejected: { variant: "destructive", icon: AlertCircle },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className="gap-1">
        <config.icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back, {profile?.full_name?.split(" ")[0] || "Instructor"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your courses and track student progress.
            </p>
          </div>
          <Link to="/instructor/courses/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
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

        {/* Quick Stats */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Published</p>
                  <p className="text-2xl font-bold text-success">{publishedCourses.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-success/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-accent">{pendingCourses.length}</p>
                </div>
                <Clock className="h-8 w-8 text-accent/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                  <p className="text-2xl font-bold text-muted-foreground">{draftCourses.length}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Courses */}
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              My Courses
            </CardTitle>
            <Link to="/instructor/courses">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : courses?.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No courses yet</p>
                <Link to="/instructor/courses/new">
                  <Button className="mt-4">Create Your First Course</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {courses?.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
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
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.students_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {course.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(course.status || "draft")}
                    <Link to={`/instructor/courses/${course.id}/edit`}>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
