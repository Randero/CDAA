import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { sendQuizPassedEmail } from "@/lib/notificationService";
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Send,
  AlertTriangle,
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
} from "@/components/ui/alert-dialog";

interface Question {
  id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  points: number;
  sort_order: number;
  quiz_answers: {
    id: string;
    answer_text: string;
    is_correct: boolean;
    sort_order: number;
  }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  time_limit: number | null;
  passing_score: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
  course_id: string;
  quiz_questions: Question[];
}

const StudentQuizTake = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Fetch quiz with questions
  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz-take", quizId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_questions(
            id,
            question_text,
            question_type,
            points,
            sort_order,
            quiz_answers(
              id,
              answer_text,
              is_correct,
              sort_order
            )
          )
        `)
        .eq("id", quizId)
        .eq("is_published", true)
        .single();

      if (error) throw error;

      // Sort questions and answers
      if (data.quiz_questions) {
        data.quiz_questions.sort((a: Question, b: Question) => a.sort_order - b.sort_order);
        data.quiz_questions.forEach((q: Question) => {
          if (q.quiz_answers) {
            q.quiz_answers.sort((a, b) => a.sort_order - b.sort_order);
          }
        });

        // Shuffle if enabled
        if (data.shuffle_questions) {
          data.quiz_questions = data.quiz_questions.sort(() => Math.random() - 0.5);
        }
      }

      return data as Quiz;
    },
  });

  // Create or get existing attempt
  useEffect(() => {
    const initializeAttempt = async () => {
      if (!quiz) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for existing in-progress attempt
      const { data: existingAttempt } = await supabase
        .from("quiz_attempts")
        .select("*")
        .eq("quiz_id", quiz.id)
        .eq("student_id", user.id)
        .is("completed_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingAttempt) {
        setAttemptId(existingAttempt.id);

        // Load existing responses
        const { data: responses } = await supabase
          .from("quiz_responses")
          .select("question_id, selected_answer_id, text_response")
          .eq("attempt_id", existingAttempt.id);

        if (responses) {
          const loadedAnswers: Record<string, string> = {};
          responses.forEach((r) => {
            loadedAnswers[r.question_id] = r.selected_answer_id || r.text_response || "";
          });
          setAnswers(loadedAnswers);
        }

        // Calculate remaining time
        if (quiz.time_limit) {
          const startTime = new Date(existingAttempt.started_at).getTime();
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          const remaining = quiz.time_limit * 60 - elapsed;
          setTimeRemaining(remaining > 0 ? remaining : 0);
        }
      } else {
        // Get attempt count
        const { count } = await supabase
          .from("quiz_attempts")
          .select("*", { count: "exact", head: true })
          .eq("quiz_id", quiz.id)
          .eq("student_id", user.id);

        // Create new attempt
        const { data: newAttempt, error } = await supabase
          .from("quiz_attempts")
          .insert({
            quiz_id: quiz.id,
            student_id: user.id,
            attempt_number: (count || 0) + 1,
          })
          .select("id")
          .single();

        if (error) {
          toast({ title: "Error starting quiz", description: error.message, variant: "destructive" });
          navigate("/student/quizzes");
          return;
        }

        setAttemptId(newAttempt.id);

        if (quiz.time_limit) {
          setTimeRemaining(quiz.time_limit * 60);
        }
      }
    };

    initializeAttempt();
  }, [quiz, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Auto-submit when time runs out
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Save answer
  const saveAnswer = async (questionId: string, answer: string) => {
    if (!attemptId) return;

    const question = quiz?.quiz_questions.find((q) => q.id === questionId);
    if (!question) return;

    const isMultipleChoice = question.question_type !== "short_answer";

    // Upsert response
    const { error } = await supabase.from("quiz_responses").upsert(
      {
        attempt_id: attemptId,
        question_id: questionId,
        selected_answer_id: isMultipleChoice ? answer : null,
        text_response: !isMultipleChoice ? answer : null,
      },
      { onConflict: "attempt_id,question_id" }
    );

    if (error) console.error("Error saving answer:", error);
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    saveAnswer(questionId, answer);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!attemptId || !quiz) throw new Error("No active attempt");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate score
      let totalPoints = 0;
      let earnedPoints = 0;

      for (const question of quiz.quiz_questions) {
        totalPoints += question.points;
        const userAnswer = answers[question.id];

        if (question.question_type === "short_answer") {
          // Short answers need manual grading, skip for now
          continue;
        }

        if (userAnswer) {
          const correctAnswer = question.quiz_answers.find((a) => a.is_correct);
          const isCorrect = correctAnswer?.id === userAnswer;

          if (isCorrect) {
            earnedPoints += question.points;
          }

          // Update response with correctness
          await supabase
            .from("quiz_responses")
            .update({
              is_correct: isCorrect,
              points_earned: isCorrect ? question.points : 0,
            })
            .eq("attempt_id", attemptId)
            .eq("question_id", question.id);
        }
      }

      const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = score >= quiz.passing_score;

      // Update attempt
      const { error } = await supabase
        .from("quiz_attempts")
        .update({
          score,
          total_points: totalPoints,
          earned_points: earnedPoints,
          passed,
          completed_at: new Date().toISOString(),
          time_spent: quiz.time_limit ? (quiz.time_limit * 60 - (timeRemaining || 0)) : null,
        })
        .eq("id", attemptId);

      if (error) throw error;

      // Get course name for email notification
      const { data: courseData } = await supabase
        .from("courses")
        .select("title")
        .eq("id", quiz.course_id)
        .single();

      return { score, passed, earnedPoints, totalPoints, user, courseName: courseData?.title || "Course" };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["student-quiz-attempts"] });
      queryClient.invalidateQueries({ queryKey: ["student-quizzes"] });

      // Send email notification if quiz was passed
      if (result.passed && quiz) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", result.user.id)
          .single();

        sendQuizPassedEmail({
          email: result.user.email || "",
          name: profile?.full_name || "Student",
          quizName: quiz.title,
          courseName: result.courseName,
          score: result.score,
        });
      }

      navigate(`/student/quizzes/${quizId}/results/${attemptId}`);
    },
    onError: (error: Error) => {
      toast({ title: "Error submitting quiz", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    setShowSubmitDialog(false);
    submitMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !quiz) {
    return (
      <DashboardLayout type="student">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const questions = quiz.quiz_questions;
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter((id) => answers[id]).length;
  const progress = (answeredCount / questions.length) * 100;

  return (
    <DashboardLayout type="student">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>

          {timeRemaining !== null && (
            <Badge
              variant={timeRemaining < 60 ? "destructive" : "secondary"}
              className="text-lg px-4 py-2"
            >
              <Clock className="h-4 w-4 mr-2" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{answeredCount} of {questions.length} answered</span>
            <span>{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion.question_text}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentQuestion.points} point{currentQuestion.points !== 1 ? "s" : ""}
            </p>
          </CardHeader>
          <CardContent>
            {currentQuestion.question_type === "short_answer" ? (
              <Textarea
                value={answers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
              />
            ) : (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              >
                <div className="space-y-3">
                  {currentQuestion.quiz_answers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        answers[currentQuestion.id] === answer.id
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleAnswerChange(currentQuestion.id, answer.id)}
                    >
                      <RadioGroupItem value={answer.id} id={answer.id} />
                      <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                        {answer.answer_text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestionIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[questions[index].id]
                    ? "bg-green-500/20 text-green-400"
                    : "bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex((i) => i + 1)}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setShowSubmitDialog(true)}>
              <Send className="h-4 w-4 mr-2" />
              Submit Quiz
            </Button>
          )}
        </div>

        {/* Submit Dialog */}
        <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  You have answered {answeredCount} of {questions.length} questions.
                </p>
                {answeredCount < questions.length && (
                  <p className="text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Some questions are unanswered!
                  </p>
                )}
                <p>Are you sure you want to submit?</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>
                Submit Quiz
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizTake;
