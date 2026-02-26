import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Clock,
  CheckCircle,
  XCircle,
  User,
  Eye,
  FileDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { toast } from "sonner";
import { format } from "date-fns";

interface TranscriptRequest {
  id: string;
  student_id: string;
  status: string;
  reason: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  transcript_url: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminTranscripts() {
  const { user } = useAdminCheck();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<TranscriptRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-transcript-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transcript_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch profiles for student names
  const studentIds = [...new Set(requests?.map((r) => r.student_id) || [])];
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-transcript", studentIds],
    queryFn: async () => {
      if (studentIds.length === 0) return [];
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", studentIds);
      if (error) throw error;
      return data || [];
    },
    enabled: studentIds.length > 0,
  });

  const getProfileName = (studentId: string) => {
    const profile = profiles?.find((p) => p.user_id === studentId);
    return profile?.full_name || "Unknown Student";
  };

  const handleAction = useMutation({
    mutationFn: async ({ id, action, notes }: { id: string; action: "approve" | "reject"; notes: string }) => {
      const updateData: any = {
        status: action === "approve" ? "approved" : "rejected",
        admin_notes: notes || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from("transcript_requests")
        .update(updateData)
        .eq("id", id);

      if (updateError) throw updateError;

      // Get student info for notification
      const request = requests?.find((r) => r.id === id);
      if (!request) return;

      // Create notification for student
      const notifTitle = action === "approve"
        ? "Transcript Request Approved ✅"
        : "Transcript Request Rejected";
      const notifMessage = action === "approve"
        ? "Your transcript request has been approved. You can now download your transcript from the Transcripts page."
        : `Your transcript request has been rejected. ${notes ? `Reason: ${notes}` : "Please contact admin for details."}`;

      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: request.student_id,
        title: notifTitle,
        message: notifMessage,
        type: action === "approve" ? "success" : "warning",
        link: "/student/transcripts",
      });

      if (notifError) console.error("Failed to send notification:", notifError);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-transcript-requests"] });
      toast.success(actionType === "approve" ? "Request approved and student notified!" : "Request rejected and student notified.");
      setSelectedRequest(null);
      setAdminNotes("");
      setActionType(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to process request");
    },
  });

  const openAction = (request: TranscriptRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes("");
  };

  const generateTranscript = async (requestId: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-transcript", {
        body: { request_id: requestId },
      });
      if (error) throw error;
      if (data?.html) {
        // Open in new window for printing/saving as PDF
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(data.html);
          win.document.close();
          toast.success("Transcript generated! Use Ctrl+P to save as PDF.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate transcript");
    } finally {
      setIsGenerating(false);
    }
  };

  const pendingRequests = requests?.filter((r) => r.status === "pending") || [];
  const approvedRequests = requests?.filter((r) => r.status === "approved") || [];
  const rejectedRequests = requests?.filter((r) => r.status === "rejected") || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderRequestCard = (request: TranscriptRequest, showActions = false) => (
    <Card key={request.id} className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-foreground">{getProfileName(request.student_id)}</h3>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Requested on {format(new Date(request.created_at), "MMM dd, yyyy 'at' h:mm a")}
              </p>
              {request.reason && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Reason:</span> {request.reason}
                </p>
              )}
              {request.admin_notes && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap justify-end">
            {showActions && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                  onClick={() => openAction(request, "approve")}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => openAction(request, "reject")}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
              </>
            )}
            {request.status === "approved" && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => generateTranscript(request.id)}
                disabled={isGenerating}
              >
                <FileDown className="h-4 w-4" />
                {isGenerating ? "Generating..." : "Generate Transcript"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Transcript Requests</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage student transcript requests.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {isLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
            ) : pendingRequests.length === 0 ? (
              <Card className="bg-card"><CardContent className="flex flex-col items-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent></Card>
            ) : pendingRequests.map((r) => renderRequestCard(r, true))}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-4">
            {approvedRequests.length === 0 ? (
              <Card className="bg-card"><CardContent className="flex flex-col items-center py-12">
                <p className="text-muted-foreground">No approved requests</p>
              </CardContent></Card>
            ) : approvedRequests.map((r) => renderRequestCard(r))}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-4">
            {rejectedRequests.length === 0 ? (
              <Card className="bg-card"><CardContent className="flex flex-col items-center py-12">
                <p className="text-muted-foreground">No rejected requests</p>
              </CardContent></Card>
            ) : rejectedRequests.map((r) => renderRequestCard(r))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-4">
            {requests?.map((r) => renderRequestCard(r, r.status === "pending"))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve/Reject Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => { setSelectedRequest(null); setActionType(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "approve" ? (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive" />
              )}
              {actionType === "approve" ? "Approve Transcript Request" : "Reject Transcript Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Approve this request and the student will be notified. You can generate and upload the transcript later."
                : "Reject this request with an optional reason. The student will be notified."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Student</p>
              <p className="text-foreground">{selectedRequest ? getProfileName(selectedRequest.student_id) : ""}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">
                Admin Notes {actionType === "reject" ? "(reason for rejection)" : "(optional)"}
              </label>
              <Textarea
                placeholder={actionType === "reject" ? "Please provide a reason..." : "Optional notes..."}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedRequest(null); setActionType(null); }}>
              Cancel
            </Button>
            <Button
              variant={actionType === "approve" ? "default" : "destructive"}
              onClick={() => {
                if (selectedRequest && actionType) {
                  handleAction.mutate({
                    id: selectedRequest.id,
                    action: actionType,
                    notes: adminNotes,
                  });
                }
              }}
              disabled={handleAction.isPending}
            >
              {handleAction.isPending ? "Processing..." : actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
