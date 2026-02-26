import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText, Upload, Clock, CheckCircle, AlertCircle, ArrowLeft, Target, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CountdownTimer } from "@/components/ui/CountdownTimer";

export default function StudentAssignments() {
  const { user } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["student-assignments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, courses(title, total_points)")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: submissions } = useQuery({
    queryKey: ["student-submissions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("student_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async ({ assignmentId, text, url }: { assignmentId: string; text: string; url: string }) => {
      const { error } = await supabase.from("assignment_submissions").insert({
        assignment_id: assignmentId,
        student_id: user?.id,
        submission_text: text,
        submission_url: url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-submissions"] });
      toast({ title: "Success", description: "Assignment submitted successfully!" });
      setDialogOpen(false);
      setSubmissionText("");
      setSubmissionUrl("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit assignment", variant: "destructive" });
    },
  });

  const getSubmission = (assignmentId: string) => {
    return submissions?.find((s: any) => s.assignment_id === assignmentId);
  };

  const pendingAssignments = assignments?.filter((a: any) => {
    const submission = getSubmission(a.id);
    return !submission;
  });

  const submittedAssignments = assignments?.filter((a: any) => {
    const submission = getSubmission(a.id);
    return submission && !submission.score;
  });

  const gradedAssignments = assignments?.filter((a: any) => {
    const submission = getSubmission(a.id);
    return submission?.score !== undefined && submission?.score !== null;
  });

  const handleSubmit = () => {
    if (!selectedAssignment) return;
    submitMutation.mutate({
      assignmentId: selectedAssignment.id,
      text: submissionText,
      url: submissionUrl,
    });
  };

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground">View and submit your assignments</p>
          </div>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingAssignments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted ({submittedAssignments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="graded">
              Graded ({gradedAssignments?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingAssignments?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending assignments</p>
                </CardContent>
              </Card>
            ) : (
              pendingAssignments?.map((assignment: any) => {
                const isOverdue = assignment.due_date && new Date(assignment.due_date) < new Date();
                return (
                  <Card key={assignment.id} className={isOverdue ? "border-destructive/50" : ""}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{assignment.title}</CardTitle>
                          <CardDescription>{assignment.courses?.title}</CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={isOverdue ? "destructive" : "secondary"}>
                            <Target className="h-3 w-3 mr-1" />
                            {assignment.weight || 10} pts weight
                          </Badge>
                          <Badge variant="outline">
                            Max: {assignment.max_score} pts
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">{assignment.description}</p>
                      
                      {/* Countdown Timer */}
                      {assignment.due_date && (
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <CountdownTimer targetDate={assignment.due_date} />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          Due: {assignment.due_date ? format(new Date(assignment.due_date), "MMM dd, yyyy 'at' HH:mm") : "No deadline"}
                        </span>
                        <Dialog open={dialogOpen && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (open) setSelectedAssignment(assignment);
                        }}>
                          <DialogTrigger asChild>
                            <Button disabled={isOverdue}>
                              <Upload className="h-4 w-4 mr-2" />
                              {isOverdue ? "Deadline Passed" : "Submit"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit Assignment</DialogTitle>
                              <DialogDescription>{assignment.title}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {assignment.due_date && (
                                <div className="p-3 rounded-lg bg-muted">
                                  <CountdownTimer targetDate={assignment.due_date} compact />
                                </div>
                              )}
                              <div>
                                <Label>Submission URL (optional)</Label>
                                <Input
                                  placeholder="https://..."
                                  value={submissionUrl}
                                  onChange={(e) => setSubmissionUrl(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Submission Text</Label>
                                <Textarea
                                  placeholder="Enter your submission..."
                                  value={submissionText}
                                  onChange={(e) => setSubmissionText(e.target.value)}
                                  rows={5}
                                />
                              </div>
                              <Button onClick={handleSubmit} disabled={submitMutation.isPending} className="w-full">
                                {submitMutation.isPending ? "Submitting..." : "Submit Assignment"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4 mt-6">
            {submittedAssignments?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No submitted assignments awaiting grading</p>
                </CardContent>
              </Card>
            ) : (
              submittedAssignments?.map((assignment: any) => {
                const submission = getSubmission(assignment.id);
                return (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{assignment.title}</CardTitle>
                          <CardDescription>{assignment.courses?.title}</CardDescription>
                        </div>
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Awaiting Grade
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Submitted on {format(new Date(submission.submitted_at), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4 mt-6">
            {gradedAssignments?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No graded assignments yet</p>
                </CardContent>
              </Card>
            ) : (
              gradedAssignments?.map((assignment: any) => {
                const submission = getSubmission(assignment.id);
                const percentage = (submission.score / assignment.max_score) * 100;
                return (
                  <Card key={assignment.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{assignment.title}</CardTitle>
                          <CardDescription>{assignment.courses?.title}</CardDescription>
                        </div>
                        <Badge variant={percentage >= 50 ? "default" : "destructive"}>
                          {submission.score}/{assignment.max_score} ({percentage.toFixed(0)}%)
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {submission.feedback && (
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                          <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
