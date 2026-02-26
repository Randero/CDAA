import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trophy,
  Target,
  Clock,
  RotateCcw,
} from "lucide-react";

const StudentQuizResults = () => {
  const { id: quizId, attemptId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["quiz-results", attemptId],
    queryFn: async () => {
      // Fetch attempt with quiz info
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .select(`
          *,
          quizzes(
            title,
            passing_score,
            show_correct_answers,
            max_attempts,
            quiz_questions(
              id,
              question_text,
              question_type,
              points,
              sort_order,
              explanation,
              quiz_answers(
                id,
                answer_text,
                is_correct,
                sort_order
              )
            )
          )
        `)
        .eq("id", attemptId)
        .single();

      if (attemptError) throw attemptError;

      // Fetch responses
      const { data: responses, error: responsesError } = await supabase
        .from("quiz_responses")
        .select("*")
        .eq("attempt_id", attemptId);

      if (responsesError) throw responsesError;

      return {
        attempt,
        responses,
      };
    },
  });

  // Check if can retake
  const { data: attemptCount } = useQuery({
    queryKey: ["quiz-attempt-count", quizId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count } = await supabase
        .from("quiz_attempts")
        .select("*", { count: "exact", head: true })
        .eq("quiz_id", quizId)
        .eq("student_id", user.id)
        .not("completed_at", "is", null);

      return count || 0;
    },
  });

  if (isLoading || !data) {
    return (
      <DashboardLayout type="student">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { attempt, responses } = data;
  const quiz = attempt.quizzes;
  const questions = quiz.quiz_questions.sort((a: any, b: any) => a.sort_order - b.sort_order);
  const canRetake = (attemptCount || 0) < quiz.max_attempts;

  const formatTime = (seconds: number | null) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getResponseForQuestion = (questionId: string) => {
    return responses.find((r: any) => r.question_id === questionId);
  };

  return (
    <DashboardLayout type="student">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Results Summary */}
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className={`inline-flex p-4 rounded-full ${
                attempt.passed ? "bg-green-500/20" : "bg-destructive/20"
              }`}>
                {attempt.passed ? (
                  <Trophy className="h-12 w-12 text-green-400" />
                ) : (
                  <XCircle className="h-12 w-12 text-destructive" />
                )}
              </div>

              <div>
                <h1 className="text-2xl font-bold text-foreground">{quiz.title}</h1>
                <Badge
                  variant={attempt.passed ? "default" : "destructive"}
                  className="mt-2 text-lg px-4 py-1"
                >
                  {attempt.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>

              <div className="text-5xl font-bold text-foreground">
                {attempt.score?.toFixed(1)}%
              </div>

              <Progress
                value={attempt.score || 0}
                className="h-3 max-w-md mx-auto"
              />

              <div className="grid grid-cols-3 gap-4 pt-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-sm">Passing</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{quiz.passing_score}%</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Points</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {attempt.earned_points}/{attempt.total_points}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">Time</span>
                  </div>
                  <p className="text-lg font-semibold text-foreground">
                    {formatTime(attempt.time_spent)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        {quiz.show_correct_answers && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Question Review</h2>

            {questions.map((question: any, index: number) => {
              const response = getResponseForQuestion(question.id);
              const isCorrect = response?.is_correct;
              const selectedAnswer = question.quiz_answers.find(
                (a: any) => a.id === response?.selected_answer_id
              );
              const correctAnswer = question.quiz_answers.find((a: any) => a.is_correct);

              return (
                <Card key={question.id} className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="text-muted-foreground">Q{index + 1}.</span>
                        {question.question_text}
                      </CardTitle>
                      {response && (
                        <Badge variant={isCorrect ? "default" : "destructive"}>
                          {isCorrect ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Correct
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorrect
                            </>
                          )}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {question.question_type === "short_answer" ? (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Your answer:</p>
                        <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                          {response?.text_response || "No answer provided"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {question.quiz_answers
                          .sort((a: any, b: any) => a.sort_order - b.sort_order)
                          .map((answer: any) => {
                            const isSelected = answer.id === response?.selected_answer_id;
                            const isCorrectAnswer = answer.is_correct;

                            return (
                              <div
                                key={answer.id}
                                className={`p-3 rounded-lg border flex items-center gap-3 ${
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-500/10"
                                    : isSelected
                                    ? "border-destructive bg-destructive/10"
                                    : "border-border"
                                }`}
                              >
                                {isCorrectAnswer ? (
                                  <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                                ) : isSelected ? (
                                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                ) : (
                                  <div className="h-5 w-5" />
                                )}
                                <span className={isCorrectAnswer ? "text-green-400" : ""}>
                                  {answer.answer_text}
                                </span>
                                {isSelected && !isCorrectAnswer && (
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    Your answer
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {question.explanation && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Explanation:</span> {question.explanation}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => navigate("/student/quizzes")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quizzes
          </Button>

          {canRetake && !attempt.passed && (
            <Button onClick={() => navigate(`/student/quizzes/${quizId}/take`)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizResults;
