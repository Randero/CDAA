import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { QuestionEditor } from "@/components/quiz/QuestionEditor";

interface QuizFormData {
  title: string;
  description: string;
  course_id: string;
  time_limit: number | null;
  passing_score: number;
  max_attempts: number;
  shuffle_questions: boolean;
  show_correct_answers: boolean;
}

interface Question {
  id?: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  points: number;
  sort_order: number;
  explanation: string;
  answers: Answer[];
}

interface Answer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
}

const InstructorQuizEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<QuizFormData>({
    title: "",
    description: "",
    course_id: "",
    time_limit: null,
    passing_score: 70,
    max_attempts: 3,
    shuffle_questions: false,
    show_correct_answers: true,
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch instructor's courses
  const { data: courses } = useQuery({
    queryKey: ["instructor-courses-for-quiz"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id)
        .order("title");

      if (error) throw error;
      return data;
    },
  });

  // Fetch existing quiz if editing
  const { data: existingQuiz, isLoading: loadingQuiz } = useQuery({
    queryKey: ["quiz", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("quizzes")
        .select(`
          *,
          quiz_questions(
            *,
            quiz_answers(*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingQuiz) {
      setFormData({
        title: existingQuiz.title,
        description: existingQuiz.description || "",
        course_id: existingQuiz.course_id,
        time_limit: existingQuiz.time_limit,
        passing_score: existingQuiz.passing_score,
        max_attempts: existingQuiz.max_attempts,
        shuffle_questions: existingQuiz.shuffle_questions,
        show_correct_answers: existingQuiz.show_correct_answers,
      });

      if (existingQuiz.quiz_questions) {
        const loadedQuestions = existingQuiz.quiz_questions
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((q: any) => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            points: q.points,
            sort_order: q.sort_order,
            explanation: q.explanation || "",
            answers: (q.quiz_answers || [])
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((a: any) => ({
                id: a.id,
                answer_text: a.answer_text,
                is_correct: a.is_correct,
                sort_order: a.sort_order,
              })),
          }));
        setQuestions(loadedQuestions);
      }
    }
  }, [existingQuiz]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Validate
      if (!formData.title.trim()) throw new Error("Quiz title is required");
      if (!formData.course_id) throw new Error("Please select a course");

      let quizId = id;

      if (isEditing) {
        const { error } = await supabase
          .from("quizzes")
          .update({
            title: formData.title,
            description: formData.description || null,
            course_id: formData.course_id,
            time_limit: formData.time_limit,
            passing_score: formData.passing_score,
            max_attempts: formData.max_attempts,
            shuffle_questions: formData.shuffle_questions,
            show_correct_answers: formData.show_correct_answers,
          })
          .eq("id", id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("quizzes")
          .insert({
            title: formData.title,
            description: formData.description || null,
            course_id: formData.course_id,
            instructor_id: user.id,
            time_limit: formData.time_limit,
            passing_score: formData.passing_score,
            max_attempts: formData.max_attempts,
            shuffle_questions: formData.shuffle_questions,
            show_correct_answers: formData.show_correct_answers,
          })
          .select("id")
          .single();

        if (error) throw error;
        quizId = data.id;
      }

      // Handle questions
      if (isEditing) {
        // Delete removed questions
        const existingQuestionIds = existingQuiz?.quiz_questions?.map((q: any) => q.id) || [];
        const currentQuestionIds = questions.filter(q => q.id).map(q => q.id);
        const deletedQuestionIds = existingQuestionIds.filter((id: string) => !currentQuestionIds.includes(id));

        if (deletedQuestionIds.length > 0) {
          await supabase.from("quiz_questions").delete().in("id", deletedQuestionIds);
        }
      }

      // Upsert questions and answers
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let questionId = q.id;

        if (q.id) {
          // Update existing question
          const { error } = await supabase
            .from("quiz_questions")
            .update({
              question_text: q.question_text,
              question_type: q.question_type,
              points: q.points,
              sort_order: i,
              explanation: q.explanation || null,
            })
            .eq("id", q.id);

          if (error) throw error;
        } else {
          // Insert new question
          const { data, error } = await supabase
            .from("quiz_questions")
            .insert({
              quiz_id: quizId,
              question_text: q.question_text,
              question_type: q.question_type,
              points: q.points,
              sort_order: i,
              explanation: q.explanation || null,
            })
            .select("id")
            .single();

          if (error) throw error;
          questionId = data.id;
        }

        // Handle answers for multiple choice and true/false
        if (q.question_type !== "short_answer" && questionId) {
          // Delete existing answers for this question if updating
          if (q.id) {
            await supabase.from("quiz_answers").delete().eq("question_id", q.id);
          }

          // Insert new answers
          if (q.answers.length > 0) {
            const answersToInsert = q.answers.map((a, idx) => ({
              question_id: questionId,
              answer_text: a.answer_text,
              is_correct: a.is_correct,
              sort_order: idx,
            }));

            const { error } = await supabase.from("quiz_answers").insert(answersToInsert);
            if (error) throw error;
          }
        }
      }

      return quizId;
    },
    onSuccess: (quizId) => {
      queryClient.invalidateQueries({ queryKey: ["instructor-quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["quiz", quizId] });
      toast({ title: isEditing ? "Quiz updated!" : "Quiz created!" });
      navigate("/instructor/quizzes");
    },
    onError: (error: Error) => {
      toast({ title: "Error saving quiz", description: error.message, variant: "destructive" });
    },
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "multiple_choice",
        points: 1,
        sort_order: questions.length,
        explanation: "",
        answers: [
          { answer_text: "", is_correct: true, sort_order: 0 },
          { answer_text: "", is_correct: false, sort_order: 1 },
        ],
      },
    ]);
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (loadingQuiz) {
    return (
      <DashboardLayout type="instructor">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/instructor/quizzes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isEditing ? "Edit Quiz" : "Create Quiz"}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? "Update your quiz details and questions" : "Create a new quiz for your course"}
            </p>
          </div>
        </div>

        {/* Quiz Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Quiz Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter quiz title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={(value) => setFormData({ ...formData, course_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses?.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional quiz description"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  min={0}
                  value={formData.time_limit || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      time_limit: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  placeholder="No limit"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passing_score">Passing Score (%)</Label>
                <Input
                  id="passing_score"
                  type="number"
                  min={0}
                  max={100}
                  value={formData.passing_score}
                  onChange={(e) =>
                    setFormData({ ...formData, passing_score: parseInt(e.target.value) || 70 })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_attempts">Max Attempts</Label>
                <Input
                  id="max_attempts"
                  type="number"
                  min={1}
                  value={formData.max_attempts}
                  onChange={(e) =>
                    setFormData({ ...formData, max_attempts: parseInt(e.target.value) || 3 })
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="shuffle"
                  checked={formData.shuffle_questions}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, shuffle_questions: checked })
                  }
                />
                <Label htmlFor="shuffle">Shuffle questions</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="show_answers"
                  checked={formData.show_correct_answers}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, show_correct_answers: checked })
                  }
                />
                <Label htmlFor="show_answers">Show correct answers after submission</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Questions ({questions.length})
            </h2>
            <Button onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          {questions.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No questions yet. Add your first question!</p>
                <Button onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={index}
                  index={index}
                  question={question}
                  onUpdate={(updated) => updateQuestion(index, updated)}
                  onRemove={() => removeQuestion(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline" onClick={() => navigate("/instructor/quizzes")}>
            Cancel
          </Button>
          <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : isEditing ? "Update Quiz" : "Create Quiz"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorQuizEditor;
