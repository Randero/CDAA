import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, 
  Mail, 
  Eye, 
  Trash2, 
  CheckCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Database } from "@/integrations/supabase/types";

type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch messages");
      console.error(error);
    } else {
      setMessages(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: true })
      .eq("id", id);

    if (error) {
      toast.error("Failed to mark as read");
    } else {
      fetchMessages();
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    const { error } = await supabase
      .from("contact_submissions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete message");
    } else {
      toast.success("Message deleted");
      fetchMessages();
    }
  };

  const openMessage = (message: ContactSubmission) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      markAsRead(message.id);
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Contact Messages</h1>
            <p className="text-muted-foreground mt-1">View and manage contact form submissions</p>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Mail className="w-4 h-4 mr-2" />
              {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Messages Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                All Messages ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No messages yet
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead>Status</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow 
                          key={message.id} 
                          className={`border-border/50 cursor-pointer hover:bg-secondary/50 ${
                            !message.is_read ? "bg-primary/5" : ""
                          }`}
                          onClick={() => openMessage(message)}
                        >
                          <TableCell>
                            {message.is_read ? (
                              <Badge variant="outline" className="bg-muted text-muted-foreground">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Read
                              </Badge>
                            ) : (
                              <Badge className="bg-primary/10 text-primary border-primary/20">
                                <Clock className="w-3 h-3 mr-1" />
                                New
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className={`font-medium ${!message.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                                {message.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{message.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className={`truncate max-w-[200px] ${!message.is_read ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {message.subject || "No subject"}
                            </p>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openMessage(message)}
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteMessage(message.id)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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

        {/* Message Detail Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Message from {selectedMessage?.name}
              </DialogTitle>
              <DialogDescription>
                Received on {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{selectedMessage?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subject</p>
                  <p className="text-foreground font-medium">{selectedMessage?.subject || "No subject"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Message</p>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">{selectedMessage?.message}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                >
                  Close
                </Button>
                <Button
                  className="bg-gradient-to-r from-primary to-cyan"
                  onClick={() => {
                    window.location.href = `mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject || "Your message"}`;
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Reply via Email
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
