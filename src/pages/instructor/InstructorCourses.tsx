import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Users,
  Star,
  PlusCircle,
  MoreVertical,
  Edit,
  Eye,
  Trash2,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";

export default function InstructorCourses() {
  const { user } = useUserRole();
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["instructor-courses-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("instructor_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const submitForReviewMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from("courses")
        .update({ status: "submitted", submitted_at: new Date().toISOString() })
        .eq("id", courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses-full"] });
      toast.success("Course submitted for review");
    },
    onError: () => {
      toast.error("Failed to submit course");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses-full"] });
      toast.success("Course deleted");
    },
    onError: () => {
      toast.error("Failed to delete course");
    },
  });

  const getStatusConfig = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType; label: string }> = {
      approved: { variant: "default", icon: CheckCircle2, label: "Published" },
      submitted: { variant: "secondary", icon: Clock, label: "Pending Review" },
      draft: { variant: "outline", icon: FileText, label: "Draft" },
      rejected: { variant: "destructive", icon: AlertCircle, label: "Rejected" },
    };
    return config[status] || config.draft;
  };

  const draftCourses = courses?.filter(c => c.status === "draft") || [];
  const pendingCourses = courses?.filter(c => c.status === "submitted") || [];
  const publishedCourses = courses?.filter(c => c.status === "approved") || [];
  const rejectedCourses = courses?.filter(c => c.status === "rejected") || [];

  const CourseCard = ({ course }: { course: any }) => {
    const statusConfig = getStatusConfig(course.status);
    
    return (
      <Card className="bg-card border-border overflow-hidden">
        <div className="aspect-video relative">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant={statusConfig.variant} className="gap-1">
              <statusConfig.icon className="h-3 w-3" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
        <CardContent className="p-5 space-y-4">
          <div>
            <Badge variant="outline" className="mb-2 text-xs">
              {course.category?.replace(/-/g, " ")}
            </Badge>
            <h3 className="font-semibold text-foreground line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {course.short_description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.students_count || 0} students
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {course.rating?.toFixed(1) || "0.0"}
            </span>
          </div>

          {course.status === "rejected" && course.rejection_reason && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-xs text-destructive font-medium">Rejection Reason:</p>
              <p className="text-xs text-destructive/80">{course.rejection_reason}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link to={`/instructor/courses/${course.id}/edit`} className="flex-1">
              <Button className="w-full" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {course.status === "approved" && (
                  <DropdownMenuItem asChild>
                    <Link to={`/courses/${course.slug}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Live
                    </Link>
                  </DropdownMenuItem>
                )}
                {(course.status === "draft" || course.status === "rejected") && (
                  <DropdownMenuItem
                    onClick={() => submitForReviewMutation.mutate(course.id)}
                    disabled={submitForReviewMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit for Review
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => deleteMutation.mutate(course.id)}
                  className="text-destructive"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message, showCreate = true }: { message: string; showCreate?: boolean }) => (
    <div className="text-center py-12">
      <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{message}</h3>
      {showCreate && (
        <Link to="/instructor/courses/new">
          <Button className="mt-4">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">My Courses</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your courses
            </p>
          </div>
          <Link to="/instructor/courses/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({courses?.length || 0})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedCourses.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingCourses.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({draftCourses.length})</TabsTrigger>
            {rejectedCourses.length > 0 && (
              <TabsTrigger value="rejected">Rejected ({rejectedCourses.length})</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[380px]" />
                ))}
              </div>
            ) : courses?.length === 0 ? (
              <EmptyState message="No courses yet" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses?.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            {publishedCourses.length === 0 ? (
              <EmptyState message="No published courses" showCreate={false} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publishedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            {pendingCourses.length === 0 ? (
              <EmptyState message="No pending courses" showCreate={false} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            {draftCourses.length === 0 ? (
              <EmptyState message="No draft courses" />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {draftCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedCourses.length === 0 ? (
              <EmptyState message="No rejected courses" showCreate={false} />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rejectedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
