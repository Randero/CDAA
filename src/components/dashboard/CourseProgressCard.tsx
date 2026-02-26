import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, BookOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Assignment {
  id: string;
  title: string;
  weight: number;
  max_score: number;
}

interface Submission {
  assignment_id: string;
  score: number | null;
}

interface CourseProgressCardProps {
  courseName: string;
  totalPoints: number;
  assignments: Assignment[];
  submissions: Submission[];
  className?: string;
}

export function CourseProgressCard({
  courseName,
  totalPoints,
  assignments,
  submissions,
  className,
}: CourseProgressCardProps) {
  // Calculate earned points from graded assignments
  const calculateProgress = () => {
    let earnedPoints = 0;
    let totalAssignmentWeight = 0;
    let completedAssignments = 0;

    assignments.forEach((assignment) => {
      totalAssignmentWeight += assignment.weight;
      const submission = submissions.find((s) => s.assignment_id === assignment.id);
      
      if (submission?.score !== null && submission?.score !== undefined) {
        completedAssignments++;
        // Calculate weighted score: (score/max_score) * weight
        const percentageScore = submission.score / assignment.max_score;
        earnedPoints += percentageScore * assignment.weight;
      }
    });

    // Scale to total course points
    const scaledEarnedPoints = totalAssignmentWeight > 0 
      ? (earnedPoints / totalAssignmentWeight) * totalPoints 
      : 0;

    const progressPercentage = totalPoints > 0 
      ? (scaledEarnedPoints / totalPoints) * 100 
      : 0;

    return {
      earnedPoints: Math.round(scaledEarnedPoints * 10) / 10,
      progressPercentage: Math.round(progressPercentage * 10) / 10,
      completedAssignments,
      totalAssignments: assignments.length,
    };
  };

  const { earnedPoints, progressPercentage, completedAssignments, totalAssignments } = calculateProgress();

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A", color: "text-green-500" };
    if (percentage >= 80) return { grade: "B", color: "text-blue-500" };
    if (percentage >= 70) return { grade: "C", color: "text-yellow-500" };
    if (percentage >= 60) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-destructive" };
  };

  const gradeInfo = getGrade(progressPercentage);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold truncate">{courseName}</CardTitle>
          {totalAssignments > 0 && (
            <Badge variant="outline" className={cn("font-bold text-lg", gradeInfo.color)}>
              {gradeInfo.grade}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Course Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Trophy className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Points Earned</p>
              <p className="text-sm font-semibold">{earnedPoints} / {totalPoints}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm font-semibold">{completedAssignments} / {totalAssignments}</p>
            </div>
          </div>
        </div>

        {totalAssignments === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            No assignments yet
          </p>
        )}
      </CardContent>
    </Card>
  );
}
