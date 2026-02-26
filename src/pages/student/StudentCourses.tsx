import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, CheckCircle2, PlayCircle, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function StudentCourses() {
  const { user } = useUserRole();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["student-enrollments-full", user?.id],
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

  const inProgressCourses = enrollments?.filter((e) => !e.completed_at) || [];
  const completedCourses = enrollments?.filter((e) => e.completed_at) || [];

  const CourseCard = ({ enrollment }: { enrollment: any }) => (
    <Card className="bg-card border-border overflow-hidden hover:border-primary/50 transition-colors">
      <div className="aspect-video relative">
        {enrollment.course?.thumbnail ? (
          <img
            src={enrollment.course.thumbnail}
            alt={enrollment.course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        {enrollment.completed_at && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-success text-success-foreground">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-5 space-y-4">
        <div>
          <Badge variant="outline" className="mb-2 text-xs">
            {enrollment.course?.category?.replace(/-/g, " ")}
          </Badge>
          <h3 className="font-semibold text-foreground line-clamp-2">
            {enrollment.course?.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            by {enrollment.course?.instructor_name}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{enrollment.progress || 0}%</span>
          </div>
          <Progress value={enrollment.progress || 0} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {enrollment.course?.duration || "N/A"}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {enrollment.course?.lessons_count || 0} lessons
            </span>
          </div>
        </div>

        <Link to={`/student/learn/${enrollment.course?.slug}`} className="block">
          <Button className="w-full" variant={enrollment.completed_at ? "outline" : "default"}>
            {enrollment.completed_at ? (
              <>Review Course</>
            ) : (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue Learning
              </>
            )}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12">
      <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{message}</h3>
      <p className="text-muted-foreground mb-6">
        Start your cybersecurity learning journey today!
      </p>
      <Link to="/courses">
        <Button>Browse Courses</Button>
      </Link>
    </div>
  );

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your enrolled courses
          </p>
        </div>

        <Tabs defaultValue="in-progress" className="w-full">
          <TabsList>
            <TabsTrigger value="in-progress">
              In Progress ({inProgressCourses.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({enrollments?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[380px]" />
                ))}
              </div>
            ) : inProgressCourses.length === 0 ? (
              <EmptyState message="No courses in progress" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressCourses.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[380px]" />
                ))}
              </div>
            ) : completedCourses.length === 0 ? (
              <EmptyState message="No completed courses yet" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedCourses.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[380px]" />
                ))}
              </div>
            ) : enrollments?.length === 0 ? (
              <EmptyState message="No enrolled courses" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrollments?.map((enrollment) => (
                  <CourseCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
