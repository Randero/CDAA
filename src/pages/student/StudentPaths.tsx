import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, BookOpen, ArrowRight, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function StudentPaths() {
  const { data: learningPaths, isLoading } = useQuery({
    queryKey: ["learning-paths"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("learning_paths")
        .select(`
          *,
          learning_path_courses(
            sort_order,
            course:courses(*)
          )
        `)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Learning Paths</h1>
          <p className="text-muted-foreground mt-1">
            Follow structured paths to master cybersecurity skills
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : learningPaths?.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Learning Paths Available
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Learning paths will be available soon. In the meantime, browse our courses.
              </p>
              <Link to="/courses">
                <Button className="mt-6">Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {learningPaths?.map((path) => (
              <Card key={path.id} className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="aspect-video relative">
                  {path.thumbnail ? (
                    <img
                      src={path.thumbnail}
                      alt={path.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-cyan/20 flex items-center justify-center">
                      <GraduationCap className="h-16 w-16 text-primary" />
                    </div>
                  )}
                  {path.level && (
                    <Badge className="absolute top-3 left-3">{path.level}</Badge>
                  )}
                </div>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                      {path.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {path.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {path.learning_path_courses?.length || 0} courses
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Your Progress</span>
                      <span className="font-medium text-foreground">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>

                  <Button className="w-full">
                    Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
