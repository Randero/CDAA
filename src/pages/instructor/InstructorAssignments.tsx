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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText, Plus, ArrowLeft, Users, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstructorAssignments() {
  const { user } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  
  // Create form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [weight, setWeight] = useState("10");
  
  // Grade form state
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");

  const { data: courses } = useQuery({
    queryKey: ["instructor-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("courses")
        .select("id, title")
        .eq("instructor_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["instructor-assignments", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("assignments")
        .select("*, courses(title)")
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: submissions } = useQuery({
    queryKey: ["instructor-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignment_submissions")
        .select("*, assignments(title, max_score, instructor_id), profiles:student_id(full_name)")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data?.filter((s: any) => s.assignments?.instructor_id === user?.id);
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assignments").insert({
        title,
        description,
        course_id: courseId || null,
        instructor_id: user?.id,
        due_date: dueDate || null,
        max_score: parseInt(maxScore),
        weight: parseInt(weight),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-assignments"] });
      toast({ title: "Success", description: "Assignment created successfully!" });
      setCreateDialogOpen(false);
      resetCreateForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create assignment", variant: "destructive" });
    },
  });

  const gradeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("assignment_submissions")
        .update({
          score: parseInt(score),
          feedback,
          graded_at: new Date().toISOString(),
          graded_by: user?.id,
        })
        .eq("id", selectedSubmission.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-submissions"] });
      toast({ title: "Success", description: "Assignment graded successfully!" });
      setGradeDialogOpen(false);
      setSelectedSubmission(null);
      setScore("");
      setFeedback("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to grade assignment", variant: "destructive" });
    },
  });

  const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setCourseId("");
    setDueDate("");
    setMaxScore("100");
    setWeight("10");
  };

  const pendingSubmissions = submissions?.filter((s: any) => s.score === null);
  const gradedSubmissions = submissions?.filter((s: any) => s.score !== null);

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground">Create and grade student assignments</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
                <DialogDescription>Create a new assignment for your students</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Assignment title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Course (optional)</Label>
                  <Select value={courseId} onValueChange={setCourseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course: any) => (
                        <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Assignment description and instructions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Due Date</Label>
                    <Input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Max Score</Label>
                    <Input
                      type="number"
                      value={maxScore}
                      onChange={(e) => setMaxScore(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Weight (Points)</Label>
                    <Input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Assignment weight for course grade"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => createMutation.mutate()} 
                  disabled={createMutation.isPending || !title} 
                  className="w-full"
                >
                  {createMutation.isPending ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="assignments" className="w-full">
          <TabsList>
            <TabsTrigger value="assignments">
              My Assignments ({assignments?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Grades ({pendingSubmissions?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="graded">
              Graded ({gradedSubmissions?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-4 mt-6">
            {assignments?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No assignments created yet</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Assignment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              assignments?.map((assignment: any) => (
                <Card key={assignment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{assignment.title}</CardTitle>
                        <CardDescription>{assignment.courses?.title || "General"}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          Max: {assignment.max_score} pts
                        </Badge>
                        <Badge variant="secondary">
                          Weight: {assignment.weight || 10} pts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{assignment.description}</p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Created: {format(new Date(assignment.created_at), "MMM dd, yyyy")}</span>
                      {assignment.due_date && (
                        <span>Due: {format(new Date(assignment.due_date), "MMM dd, yyyy")}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingSubmissions?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No submissions awaiting grades</p>
                </CardContent>
              </Card>
            ) : (
              pendingSubmissions?.map((submission: any) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{submission.assignments?.title}</CardTitle>
                        <CardDescription>
                          Submitted by {submission.profiles?.full_name || "Unknown Student"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Submitted on {format(new Date(submission.submitted_at), "MMM dd, yyyy 'at' HH:mm")}
                    </p>
                    {submission.submission_text && (
                      <div className="bg-muted p-4 rounded-lg mb-4">
                        <p className="text-sm whitespace-pre-wrap">{submission.submission_text}</p>
                      </div>
                    )}
                    {submission.submission_url && (
                      <a 
                        href={submission.submission_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm mb-4 block"
                      >
                        View Submission Link
                      </a>
                    )}
                    <Dialog open={gradeDialogOpen && selectedSubmission?.id === submission.id} onOpenChange={(open) => {
                      setGradeDialogOpen(open);
                      if (open) setSelectedSubmission(submission);
                    }}>
                      <DialogTrigger asChild>
                        <Button>Grade Submission</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Grade Assignment</DialogTitle>
                          <DialogDescription>
                            {submission.assignments?.title} - {submission.profiles?.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Score (out of {submission.assignments?.max_score})</Label>
                            <Input
                              type="number"
                              placeholder="Enter score"
                              value={score}
                              onChange={(e) => setScore(e.target.value)}
                              max={submission.assignments?.max_score}
                            />
                          </div>
                          <div>
                            <Label>Feedback</Label>
                            <Textarea
                              placeholder="Provide feedback for the student..."
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              rows={4}
                            />
                          </div>
                          <Button 
                            onClick={() => gradeMutation.mutate()} 
                            disabled={gradeMutation.isPending || !score} 
                            className="w-full"
                          >
                            {gradeMutation.isPending ? "Saving..." : "Submit Grade"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4 mt-6">
            {gradedSubmissions?.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No graded submissions yet</p>
                </CardContent>
              </Card>
            ) : (
              gradedSubmissions?.map((submission: any) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{submission.assignments?.title}</CardTitle>
                        <CardDescription>
                          {submission.profiles?.full_name || "Unknown Student"}
                        </CardDescription>
                      </div>
                      <Badge variant="default">
                        {submission.score}/{submission.assignments?.max_score}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Graded on {submission.graded_at ? format(new Date(submission.graded_at), "MMM dd, yyyy") : "N/A"}
                    </p>
                    {submission.feedback && (
                      <p className="text-sm mt-2">Feedback: {submission.feedback}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
