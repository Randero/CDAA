import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquareWarning, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Complaint {
  id: string;
  student_id: string;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  responded_by: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  student_name?: string;
  student_email?: string;
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState("");
  const [responding, setResponding] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch complaints");
      console.error(error);
    } else {
      // Fetch student profiles for each complaint
      const complaintsWithStudents = await Promise.all(
        (data || []).map(async (complaint) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", complaint.student_id)
            .single();
          
          return {
            ...complaint,
            student_name: profile?.full_name || "Unknown Student",
          };
        })
      );
      setComplaints(complaintsWithStudents);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleRespond = async () => {
    if (!selectedComplaint || !response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    setResponding(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("complaints")
      .update({
        response: response.trim(),
        status: "resolved",
        responded_by: user?.id,
        responded_at: new Date().toISOString(),
      })
      .eq("id", selectedComplaint.id);

    if (error) {
      toast.error("Failed to submit response");
      console.error(error);
    } else {
      toast.success("Response submitted successfully");
      setSelectedComplaint(null);
      setResponse("");
      fetchComplaints();
    }
    setResponding(false);
  };

  const updateStatus = async (complaintId: string, status: string) => {
    const { error } = await supabase
      .from("complaints")
      .update({ status })
      .eq("id", complaintId);

    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Status updated to ${status}`);
      fetchComplaints();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
      pending: { 
        color: "bg-amber-500/10 text-amber-500 border-amber-500/20", 
        icon: <Clock className="w-3 h-3" /> 
      },
      "in-progress": { 
        color: "bg-blue-500/10 text-blue-500 border-blue-500/20", 
        icon: <AlertCircle className="w-3 h-3" /> 
      },
      resolved: { 
        color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", 
        icon: <CheckCircle className="w-3 h-3" /> 
      },
      rejected: { 
        color: "bg-red-500/10 text-red-500 border-red-500/20", 
        icon: <XCircle className="w-3 h-3" /> 
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        <span className="capitalize">{status}</span>
      </Badge>
    );
  };

  const pendingCount = complaints.filter(c => c.status === "pending").length;
  const inProgressCount = complaints.filter(c => c.status === "in-progress").length;
  const resolvedCount = complaints.filter(c => c.status === "resolved").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Complaints</h1>
          <p className="text-muted-foreground mt-1">Manage student complaints and issues</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <AlertCircle className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inProgressCount}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{resolvedCount}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareWarning className="w-5 h-5 text-primary" />
                All Complaints ({complaints.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No complaints found</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead>Date</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint) => (
                        <TableRow key={complaint.id} className="border-border/50">
                          <TableCell className="text-muted-foreground">
                            {format(new Date(complaint.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium text-foreground">{complaint.student_name}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-foreground max-w-xs truncate">{complaint.subject}</p>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(complaint.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedComplaint(complaint);
                                  setResponse(complaint.response || "");
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              {complaint.status === "pending" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateStatus(complaint.id, "in-progress")}
                                >
                                  Mark In Progress
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Complaint Detail Dialog */}
        <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complaint Details</DialogTitle>
            </DialogHeader>
            
            {selectedComplaint && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Student</p>
                    <p className="font-medium">{selectedComplaint.student_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedComplaint.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="font-medium">{selectedComplaint.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Message</p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-foreground whitespace-pre-wrap">{selectedComplaint.message}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Status</p>
                  {getStatusBadge(selectedComplaint.status)}
                </div>

                {selectedComplaint.status !== "resolved" && selectedComplaint.status !== "rejected" ? (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Your Response</p>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Enter your response to the student..."
                      rows={4}
                    />
                  </div>
                ) : selectedComplaint.response && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Response</p>
                    <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20">
                      <p className="text-foreground whitespace-pre-wrap">{selectedComplaint.response}</p>
                      {selectedComplaint.responded_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on {format(new Date(selectedComplaint.responded_at), "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
                Close
              </Button>
              {selectedComplaint && selectedComplaint.status !== "resolved" && selectedComplaint.status !== "rejected" && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      updateStatus(selectedComplaint.id, "rejected");
                      setSelectedComplaint(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button onClick={handleRespond} disabled={responding || !response.trim()}>
                    {responding ? "Submitting..." : "Submit Response"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
