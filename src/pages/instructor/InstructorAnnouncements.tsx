import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Megaphone, Plus, ArrowLeft, Pin, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstructorAnnouncements() {
  const { user } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isPinned, setIsPinned] = useState(false);

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

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["instructor-announcements", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("announcements")
        .select("*, courses(title)")
        .eq("instructor_id", user.id)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("announcements").insert({
        title,
        content,
        course_id: courseId || null,
        instructor_id: user?.id,
        is_pinned: isPinned,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-announcements"] });
      toast({ title: "Success", description: "Announcement posted successfully!" });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to post announcement", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-announcements"] });
      toast({ title: "Success", description: "Announcement deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete announcement", variant: "destructive" });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { error } = await supabase
        .from("announcements")
        .update({ is_pinned: pinned })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-announcements"] });
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setCourseId("");
    setIsPinned(false);
  };

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground">Post updates and news for your students</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Announcement</DialogTitle>
                <DialogDescription>Share news or updates with your students</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Announcement title"
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
                  <Label>Content</Label>
                  <Textarea
                    placeholder="Write your announcement..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={5}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isPinned}
                    onCheckedChange={setIsPinned}
                  />
                  <Label>Pin this announcement</Label>
                </div>
                <Button 
                  onClick={() => createMutation.mutate()} 
                  disabled={createMutation.isPending || !title || !content} 
                  className="w-full"
                >
                  {createMutation.isPending ? "Posting..." : "Post Announcement"}
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
        ) : announcements?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No announcements posted yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements?.map((announcement: any) => (
              <Card key={announcement.id} className={announcement.is_pinned ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${announcement.is_pinned ? "bg-primary/10" : "bg-muted"}`}>
                        {announcement.is_pinned ? (
                          <Pin className="h-5 w-5 text-primary" />
                        ) : (
                          <Megaphone className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {announcement.title}
                          {announcement.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                        </CardTitle>
                        <CardDescription>
                          {announcement.courses?.title || "General"} • {format(new Date(announcement.created_at), "MMM dd, yyyy 'at' HH:mm")}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => togglePinMutation.mutate({ 
                          id: announcement.id, 
                          pinned: !announcement.is_pinned 
                        })}
                      >
                        <Pin className={`h-4 w-4 ${announcement.is_pinned ? "text-primary" : ""}`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteMutation.mutate(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
