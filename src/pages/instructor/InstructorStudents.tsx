import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, BookOpen, CheckCircle2, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function InstructorStudents() {
  const { user } = useUserRole();

  const { data: courses } = useQuery({
    queryKey: ["instructor-courses-ids", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["instructor-students", courses?.map(c => c.id)],
    queryFn: async () => {
      if (!courses?.length) return [];
      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          course:courses(title, slug)
        `)
        .in("course_id", courses.map(c => c.id))
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for the users
      const userIds = [...new Set(data?.map(e => e.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      return data?.map(enrollment => ({
        ...enrollment,
        profile: profiles?.find(p => p.user_id === enrollment.user_id),
      })) || [];
    },
    enabled: !!courses?.length,
  });

  const totalStudents = new Set(enrollments?.map(e => e.user_id)).size;
  const completedEnrollments = enrollments?.filter(e => e.completed_at).length || 0;
  const avgProgress = enrollments?.length 
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / enrollments.length)
    : 0;

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">
            View students enrolled in your courses
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{completedEnrollments}</p>
                  <p className="text-sm text-muted-foreground">Completions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-cyan/10">
                  <Clock className="h-6 w-6 text-cyan" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{avgProgress}%</p>
                  <p className="text-sm text-muted-foreground">Avg Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Enrolled Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : enrollments?.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Students Yet</h3>
                <p className="text-muted-foreground">
                  When students enroll in your courses, they'll appear here.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments?.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={enrollment.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {enrollment.profile?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">
                              {enrollment.profile?.full_name || "Unknown User"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {enrollment.profile?.country || ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{enrollment.course?.title}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${enrollment.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(enrollment.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        {enrollment.completed_at ? (
                          <Badge className="bg-success text-success-foreground">Completed</Badge>
                        ) : enrollment.progress && enrollment.progress > 0 ? (
                          <Badge variant="secondary">In Progress</Badge>
                        ) : (
                          <Badge variant="outline">Not Started</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
