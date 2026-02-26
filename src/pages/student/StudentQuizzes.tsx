import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileQuestion,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  course_id: string;
  time_limit: number | null;
  passing_score: number;
  max_attempts: number;
  courses: {
    title: string;
  };
  quiz_questions: { id: string }[];
}

interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number | null;
  passed: boolean | null;
  attempt_number: number;
  completed_at: string | null;
}

const StudentQuizzes = () => {
  const navigate = useNavigate();

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["student-quizzes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get enrolled courses
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);

      if (!enrollments?.length) return [];

      const courseIds = enrollments.map((e) => e.course_id);

      // Get published quizzes for enrolled courses
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          courses!inner(title),
          quiz_questions(id)
        `)
        .in("course_id", courseIds)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Quiz[];
    },
  });

  const { data: attempts } = useQuery({
    queryKey: ["student-quiz-attempts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as QuizAttempt[];
    },
  });

  const getQuizAttempts = (quizId: string) => {
    return attempts?.filter((a) => a.quiz_id === quizId) || [];
  };

  const getBestScore = (quizId: string) => {
    const quizAttempts = getQuizAttempts(quizId);
    const completedAttempts = quizAttempts.filter((a) => a.completed_at && a.score !== null);
    if (!completedAttempts.length) return null;
    return Math.max(...completedAttempts.map((a) => a.score || 0));
  };

  const canRetake = (quiz: Quiz) => {
    const quizAttempts = getQuizAttempts(quiz.id);
    const completedCount = quizAttempts.filter((a) => a.completed_at).length;
    return completedCount < quiz.max_attempts;
  };

  const hasInProgressAttempt = (quizId: string) => {
    const quizAttempts = getQuizAttempts(quizId);
    return quizAttempts.some((a) => !a.completed_at);
  };

  const QuizCard = ({ quiz }: { quiz: Quiz }) => {
    const quizAttempts = getQuizAttempts(quiz.id);
    const bestScore = getBestScore(quiz.id);
    const completedCount = quizAttempts.filter((a) => a.completed_at).length;
    const inProgress = hasInProgressAttempt(quiz.id);
    const passed = quizAttempts.some((a) => a.passed);

    return (
      <Card className="bg-card border-border hover:border-primary/50 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg text-foreground">{quiz.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{quiz.courses.title}</p>
            </div>
            {passed && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle className="h-3 w-3 mr-1" />
                Passed
              </Badge>
            )}
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
              <Clock className="h-4 w-4" />
              <span>{quiz.time_limit ? `${quiz.time_limit} min` : "No limit"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>{quiz.passing_score}% to pass</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <RotateCcw className="h-4 w-4" />
              <span>
                {completedCount}/{quiz.max_attempts} attempts
              </span>
            </div>
          </div>

          {bestScore !== null && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Best Score</span>
                <span className={bestScore >= quiz.passing_score ? "text-green-400" : "text-destructive"}>
                  {bestScore.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={bestScore}
                className="h-2"
              />
            </div>
          )}

          <div className="pt-2">
            {inProgress ? (
              <Button className="w-full" onClick={() => navigate(`/student/quizzes/${quiz.id}`)}>
                <Play className="h-4 w-4 mr-2" />
                Continue Quiz
              </Button>
            ) : canRetake(quiz) ? (
              <Button className="w-full" onClick={() => navigate(`/student/quizzes/${quiz.id}`)}>
                <Play className="h-4 w-4 mr-2" />
                {completedCount === 0 ? "Start Quiz" : "Retake Quiz"}
              </Button>
            ) : (
              <Button className="w-full" variant="secondary" disabled>
                <XCircle className="h-4 w-4 mr-2" />
                Max Attempts Reached
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quizzes</h1>
          <p className="text-muted-foreground">Test your knowledge with course quizzes</p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card animate-pulse h-64" />
            ))}
          </div>
        ) : quizzes?.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No quizzes available yet. Enroll in courses to access their quizzes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizzes;
