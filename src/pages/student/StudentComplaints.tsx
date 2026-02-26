import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { MessageSquare, Plus, ArrowLeft, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentComplaints() {
  const { user } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const { data: complaints, isLoading } = useQuery({
    queryKey: ["student-complaints", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("complaints").insert({
        student_id: user?.id,
        subject,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-complaints"] });
      toast({ title: "Success", description: "Complaint submitted successfully!" });
      setDialogOpen(false);
      setSubject("");
      setMessage("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit complaint", variant: "destructive" });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "resolved":
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "in_progress":
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Complaints</h1>
            <p className="text-muted-foreground">Submit and track your complaints</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit a Complaint</DialogTitle>
                <DialogDescription>Describe your issue and we'll look into it</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Subject</Label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Provide details about your complaint..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                  />
                </div>
                <Button 
                  onClick={() => submitMutation.mutate()} 
                  disabled={submitMutation.isPending || !subject || !message} 
                  className="w-full"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Complaint"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : complaints?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No complaints submitted</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your First Complaint
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints?.map((complaint: any) => (
              <Card key={complaint.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{complaint.subject}</CardTitle>
                      <CardDescription>
                        Submitted on {format(new Date(complaint.created_at), "MMM dd, yyyy 'at' HH:mm")}
                      </CardDescription>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-1">Your Message:</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{complaint.message}</p>
                  </div>
                  {complaint.response && (
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm font-medium mb-1">Response:</p>
                      <p className="text-muted-foreground whitespace-pre-wrap">{complaint.response}</p>
                      {complaint.responded_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on {format(new Date(complaint.responded_at), "MMM dd, yyyy 'at' HH:mm")}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
