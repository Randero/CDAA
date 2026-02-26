import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, GripVertical, Check } from "lucide-react";

interface Answer {
  id?: string;
  answer_text: string;
  is_correct: boolean;
  sort_order: number;
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

interface QuestionEditorProps {
  index: number;
  question: Question;
  onUpdate: (question: Question) => void;
  onRemove: () => void;
}

export const QuestionEditor = ({ index, question, onUpdate, onRemove }: QuestionEditorProps) => {
  const handleTypeChange = (type: "multiple_choice" | "true_false" | "short_answer") => {
    let answers: Answer[] = [];

    if (type === "true_false") {
      answers = [
        { answer_text: "True", is_correct: true, sort_order: 0 },
        { answer_text: "False", is_correct: false, sort_order: 1 },
      ];
    } else if (type === "multiple_choice") {
      answers = [
        { answer_text: "", is_correct: true, sort_order: 0 },
        { answer_text: "", is_correct: false, sort_order: 1 },
      ];
    }

    onUpdate({ ...question, question_type: type, answers });
  };

  const handleAnswerChange = (answerIndex: number, field: string, value: any) => {
    const newAnswers = [...question.answers];
    newAnswers[answerIndex] = { ...newAnswers[answerIndex], [field]: value };
    onUpdate({ ...question, answers: newAnswers });
  };

  const setCorrectAnswer = (answerIndex: number) => {
    const newAnswers = question.answers.map((a, i) => ({
      ...a,
      is_correct: i === answerIndex,
    }));
    onUpdate({ ...question, answers: newAnswers });
  };

  const addAnswer = () => {
    onUpdate({
      ...question,
      answers: [
        ...question.answers,
        { answer_text: "", is_correct: false, sort_order: question.answers.length },
      ],
    });
  };

  const removeAnswer = (answerIndex: number) => {
    if (question.answers.length <= 2) return;
    const newAnswers = question.answers.filter((_, i) => i !== answerIndex);
    // Ensure at least one answer is correct
    if (!newAnswers.some((a) => a.is_correct) && newAnswers.length > 0) {
      newAnswers[0].is_correct = true;
    }
    onUpdate({ ...question, answers: newAnswers });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
            <CardTitle className="text-base">Question {index + 1}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-2">
            <Label>Question Text *</Label>
            <Textarea
              value={question.question_text}
              onChange={(e) => onUpdate({ ...question, question_text: e.target.value })}
              placeholder="Enter your question"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select value={question.question_type} onValueChange={(v: any) => handleTypeChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                <SelectItem value="true_false">True / False</SelectItem>
                <SelectItem value="short_answer">Short Answer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              min={1}
              value={question.points}
              onChange={(e) => onUpdate({ ...question, points: parseInt(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Explanation (shown after answering)</Label>
            <Input
              value={question.explanation}
              onChange={(e) => onUpdate({ ...question, explanation: e.target.value })}
              placeholder="Optional explanation"
            />
          </div>
        </div>

        {/* Answers section - only for multiple choice and true/false */}
        {question.question_type !== "short_answer" && (
          <div className="space-y-3 pt-2">
            <Label>Answers (select the correct one)</Label>

            {question.answers.map((answer, answerIndex) => (
              <div key={answerIndex} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCorrectAnswer(answerIndex)}
                  className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    answer.is_correct
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground hover:border-primary"
                  }`}
                >
                  {answer.is_correct && <Check className="h-4 w-4" />}
                </button>

                <Input
                  value={answer.answer_text}
                  onChange={(e) => handleAnswerChange(answerIndex, "answer_text", e.target.value)}
                  placeholder={`Answer ${answerIndex + 1}`}
                  className="flex-1"
                  disabled={question.question_type === "true_false"}
                />

                {question.question_type === "multiple_choice" && question.answers.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAnswer(answerIndex)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}

            {question.question_type === "multiple_choice" && question.answers.length < 6 && (
              <Button variant="outline" size="sm" onClick={addAnswer}>
                <Plus className="h-4 w-4 mr-1" />
                Add Answer
              </Button>
            )}
          </div>
        )}

        {question.question_type === "short_answer" && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground">
              Students will provide a text response. You'll need to manually grade these answers.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
