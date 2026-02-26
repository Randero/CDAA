import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  Star,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function InstructorAnalytics() {
  const { user } = useUserRole();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["instructor-analytics-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user.id)
        .eq("status", "approved");

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["instructor-analytics-enrollments", courses?.map(c => c.id)],
    queryFn: async () => {
      if (!courses?.length) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select("*")
        .in("course_id", courses.map(c => c.id));

      if (error) throw error;
      return data || [];
    },
    enabled: !!courses?.length,
  });

  const isLoading = coursesLoading || enrollmentsLoading;

  const totalCourses = courses?.length || 0;
  const totalStudents = enrollments?.length || 0;
  const completedStudents = enrollments?.filter(e => e.completed_at).length || 0;
  const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;
  const totalRevenue = courses?.reduce((acc, c) => acc + ((c.students_count || 0) * (c.price || 0)), 0) || 0;
  const avgRating = courses?.length
    ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1)
    : "0.0";
  const totalViews = courses?.reduce((acc, c) => acc + (c.students_count || 0), 0) || 0;

  const stats = [
    {
      title: "Total Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Published courses",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-cyan",
      bgColor: "bg-cyan/10",
      description: "Enrolled across all courses",
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-success",
      bgColor: "bg-success/10",
      description: "Students who completed",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-accent",
      bgColor: "bg-accent/10",
      description: "Estimated earnings",
    },
    {
      title: "Average Rating",
      value: avgRating,
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      description: "Across all courses",
    },
    {
      title: "Total Enrollments",
      value: totalViews,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Course views",
    },
  ];

  // Per-course analytics
  const courseAnalytics = courses?.map(course => {
    const courseEnrollments = enrollments?.filter(e => e.course_id === course.id) || [];
    const completions = courseEnrollments.filter(e => e.completed_at).length;
    const rate = courseEnrollments.length > 0 
      ? Math.round((completions / courseEnrollments.length) * 100) 
      : 0;
    
    return {
      ...course,
      enrollmentCount: courseEnrollments.length,
      completionCount: completions,
      completionRate: rate,
      revenue: (course.students_count || 0) * (course.price || 0),
    };
  }).sort((a, b) => b.enrollmentCount - a.enrollmentCount);

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your course performance and student engagement
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => (
                <Card key={stat.title} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Course Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {courseAnalytics?.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No Data Yet</h3>
                    <p className="text-muted-foreground">
                      Publish courses to see analytics data here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courseAnalytics?.map((course) => (
                      <div
                        key={course.id}
                        className="p-4 rounded-lg bg-secondary/50 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">{course.title}</h4>
                          <span className="text-sm text-muted-foreground">
                            ${course.revenue.toLocaleString()} revenue
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Enrollments</p>
                            <p className="font-semibold text-foreground">{course.enrollmentCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completions</p>
                            <p className="font-semibold text-foreground">{course.completionCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Completion Rate</p>
                            <p className="font-semibold text-foreground">{course.completionRate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rating</p>
                            <p className="font-semibold text-foreground flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              {course.rating?.toFixed(1) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-cyan rounded-full"
                            style={{ width: `${course.completionRate}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
