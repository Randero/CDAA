import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FileText, Plus, ArrowLeft, Trash2, File, Image, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstructorResources() {
  const { user } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [fileType, setFileType] = useState("");

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

  const { data: resources, isLoading } = useQuery({
    queryKey: ["instructor-resources", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("resources")
        .select("*, courses(title)")
        .eq("instructor_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("resources").insert({
        title,
        description,
        course_id: courseId || null,
        instructor_id: user?.id,
        file_url: fileUrl,
        file_type: fileType,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-resources"] });
      toast({ title: "Success", description: "Resource added successfully!" });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add resource", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("resources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-resources"] });
      toast({ title: "Success", description: "Resource deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCourseId("");
    setFileUrl("");
    setFileType("");
  };

  const getFileIcon = (type: string) => {
    if (type?.includes("image")) return <Image className="h-8 w-8 text-primary" />;
    if (type?.includes("video")) return <Video className="h-8 w-8 text-primary" />;
    if (type?.includes("pdf")) return <FileText className="h-8 w-8 text-destructive" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Learning Resources</h1>
            <p className="text-muted-foreground">Upload and manage course materials</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Resource</DialogTitle>
                <DialogDescription>Upload a new learning material for students</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    placeholder="Resource title"
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
                    placeholder="Brief description of this resource..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>File URL</Label>
                  <Input
                    placeholder="https://..."
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                  />
                </div>
                <div>
                  <Label>File Type</Label>
                  <Select value={fileType} onValueChange={setFileType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select file type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="application/pdf">PDF Document</SelectItem>
                      <SelectItem value="video/mp4">Video</SelectItem>
                      <SelectItem value="image/png">Image</SelectItem>
                      <SelectItem value="application/zip">ZIP Archive</SelectItem>
                      <SelectItem value="text/plain">Text File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={() => createMutation.mutate()} 
                  disabled={createMutation.isPending || !title || !fileUrl} 
                  className="w-full"
                >
                  {createMutation.isPending ? "Adding..." : "Add Resource"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : resources?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No resources uploaded yet</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Resource
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources?.map((resource: any) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {getFileIcon(resource.file_type)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{resource.title}</CardTitle>
                      <CardDescription className="truncate">{resource.courses?.title || "General"}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>
                  )}
                  <p className="text-sm text-muted-foreground mb-4">
                    Added on {format(new Date(resource.created_at), "MMM dd, yyyy")}
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                        View
                      </a>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="icon"
                      onClick={() => deleteMutation.mutate(resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
