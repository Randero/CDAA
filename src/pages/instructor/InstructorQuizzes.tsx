import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  FileQuestion,
  Edit,
  Trash2,
  Eye,
  Users,
  Clock,
  Target,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  time_limit: number | null;
  passing_score: number;
  max_attempts: number;
  is_published: boolean;
  created_at: string;
  courses: {
    title: string;
  };
  quiz_questions: { id: string }[];
  quiz_attempts: { id: string }[];
}

const InstructorQuizzes = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["instructor-quizzes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          courses!inner(title),
          quiz_questions(id),
          quiz_attempts(id)
        `)
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Quiz[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase.from("quizzes").delete().eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-quizzes"] });
      toast({ title: "Quiz deleted successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting quiz", description: error.message, variant: "destructive" });
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ quizId, isPublished }: { quizId: string; isPublished: boolean }) => {
      const { error } = await supabase
        .from("quizzes")
        .update({ is_published: isPublished })
        .eq("id", quizId);
      if (error) throw error;
    },
    onSuccess: (_, { isPublished }) => {
      queryClient.invalidateQueries({ queryKey: ["instructor-quizzes"] });
      toast({ title: isPublished ? "Quiz published" : "Quiz unpublished" });
    },
    onError: (error: Error) => {
      toast({ title: "Error updating quiz", description: error.message, variant: "destructive" });
    },
  });

  const publishedQuizzes = quizzes?.filter((q) => q.is_published) || [];
  const draftQuizzes = quizzes?.filter((q) => !q.is_published) || [];

  const QuizCard = ({ quiz }: { quiz: Quiz }) => (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg text-foreground">{quiz.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{quiz.courses.title}</p>
          </div>
          <Badge variant={quiz.is_published ? "default" : "secondary"}>
            {quiz.is_published ? "Published" : "Draft"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {quiz.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{quiz.description}</p>
        )}
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileQuestion className="h-4 w-4" />
            <span>{quiz.quiz_questions?.length || 0} questions</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{quiz.quiz_attempts?.length || 0} attempts</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{quiz.time_limit ? `${quiz.time_limit} min` : "No limit"}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Target className="h-4 w-4" />
            <span>{quiz.passing_score}% to pass</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/instructor/quizzes/${quiz.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          
          <Button
            size="sm"
            variant={quiz.is_published ? "secondary" : "default"}
            onClick={() => togglePublishMutation.mutate({ quizId: quiz.id, isPublished: !quiz.is_published })}
            disabled={quiz.quiz_questions?.length === 0}
          >
            {quiz.is_published ? (
              <>
                <XCircle className="h-4 w-4 mr-1" />
                Unpublish
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-1" />
                Publish
              </>
            )}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="destructive">
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Quiz?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the quiz and all associated questions, answers, and student attempts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate(quiz.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">{message}</p>
      <Button className="mt-4" onClick={() => navigate("/instructor/quizzes/new")}>
        <Plus className="h-4 w-4 mr-2" />
        Create Quiz
      </Button>
    </div>
  );

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
            <p className="text-muted-foreground">Create and manage quizzes for your courses</p>
          </div>
          <Button onClick={() => navigate("/instructor/quizzes/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Create Quiz
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({quizzes?.length || 0})</TabsTrigger>
            <TabsTrigger value="published">Published ({publishedQuizzes.length})</TabsTrigger>
            <TabsTrigger value="draft">Drafts ({draftQuizzes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-card animate-pulse h-48" />
                ))}
              </div>
            ) : quizzes?.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {quizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <EmptyState message="No quizzes yet. Create your first quiz!" />
            )}
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            {publishedQuizzes.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {publishedQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <EmptyState message="No published quizzes yet." />
            )}
          </TabsContent>

          <TabsContent value="draft" className="mt-6">
            {draftQuizzes.length ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {draftQuizzes.map((quiz) => (
                  <QuizCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            ) : (
              <EmptyState message="No draft quizzes." />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default InstructorQuizzes;
