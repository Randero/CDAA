import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  AlertCircle,
  Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { format } from "date-fns";

export default function StudentTranscripts() {
  const { user } = useUserRole();
  const queryClient = useQueryClient();
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [reason, setReason] = useState("");

  const { data: requests, isLoading } = useQuery({
    queryKey: ["transcript-requests", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("transcript_requests")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const submitRequest = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase.from("transcript_requests").insert({
        student_id: user.id,
        reason: reason.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transcript-requests"] });
      toast.success("Transcript request submitted successfully!");
      setShowRequestDialog(false);
      setReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to submit request");
    },
  });

  const hasPendingRequest = requests?.some((r) => r.status === "pending");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTranscript = async (requestId: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-transcript", {
        body: { request_id: requestId },
      });
      if (error) throw error;
      if (data?.html) {
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(data.html);
          win.document.close();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate transcript");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" /> Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
            <CheckCircle className="h-3 w-3 mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <XCircle className="h-3 w-3 mr-1" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownload = async (transcriptUrl: string) => {
    if (transcriptUrl) {
      window.open(transcriptUrl, "_blank");
    }
  };

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Transcripts</h1>
            <p className="text-muted-foreground mt-1">
              Request and download your official training transcripts.
            </p>
          </div>
          <Button
            onClick={() => setShowRequestDialog(true)}
            disabled={hasPendingRequest}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Request Transcript
          </Button>
        </div>

        {hasPendingRequest && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="flex items-center gap-3 py-4">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-500">
                You already have a pending transcript request. Please wait for it to be reviewed.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : requests?.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No transcript requests</h3>
              <p className="text-muted-foreground text-center max-w-md">
                You haven't requested any transcripts yet. Click the button above to request your official training transcript.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests?.map((request) => (
              <Card key={request.id} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">Transcript Request</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested on {format(new Date(request.created_at), "MMM dd, yyyy 'at' h:mm a")}
                        </p>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Reason:</span> {request.reason}
                          </p>
                        )}
                        {request.admin_notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                          </p>
                        )}
                        {request.reviewed_at && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Reviewed on {format(new Date(request.reviewed_at), "MMM dd, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                    {request.status === "approved" && (
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateTranscript(request.id)}
                          disabled={isGenerating}
                          className="gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          {isGenerating ? "Generating..." : "View & Print"}
                        </Button>
                        {request.transcript_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(request.transcript_url!)}
                            className="gap-2"
                          >
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Request Transcript
            </DialogTitle>
            <DialogDescription>
              Submit a request for your official training transcript. An administrator will review your request and generate the transcript.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Reason (optional)</label>
              <Textarea
                placeholder="e.g., Required for employment verification, further studies..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => submitRequest.mutate()}
              disabled={submitRequest.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {submitRequest.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
