import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Route, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface LearningPath {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  level: string | null;
  thumbnail: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export default function AdminLearningPaths() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LearningPath | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", slug: "", description: "", level: "beginner", thumbnail: "", is_active: true 
  });

  const fetchPaths = async () => {
    const { data, error } = await supabase
      .from("learning_paths")
      .select("*")
      .order("sort_order");
    if (error) toast.error("Failed to fetch learning paths");
    else setPaths(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPaths(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSubmit = async () => {
    if (!formData.name) return toast.error("Name is required");
    
    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      description: formData.description || null,
      level: formData.level,
      thumbnail: formData.thumbnail || null,
      is_active: formData.is_active,
    };

    if (editing) {
      const { error } = await supabase.from("learning_paths").update(payload).eq("id", editing.id);
      if (error) return toast.error("Failed to update");
      toast.success("Learning path updated");
    } else {
      const { error } = await supabase.from("learning_paths").insert([payload]);
      if (error) return toast.error("Failed to create");
      toast.success("Learning path created");
    }
    
    setDialogOpen(false);
    setEditing(null);
    setFormData({ name: "", slug: "", description: "", level: "beginner", thumbnail: "", is_active: true });
    fetchPaths();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this learning path?")) return;
    const { error } = await supabase.from("learning_paths").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchPaths(); }
  };

  const openEdit = (path: LearningPath) => {
    setEditing(path);
    setFormData({ 
      name: path.name, 
      slug: path.slug, 
      description: path.description || "", 
      level: path.level || "beginner",
      thumbnail: path.thumbnail || "", 
      is_active: path.is_active 
    });
    setDialogOpen(true);
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-500",
    intermediate: "bg-amber-500/10 text-amber-500",
    advanced: "bg-red-500/10 text-red-500",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Learning Paths</h1>
            <p className="text-muted-foreground mt-1">Define structured learning journeys</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-cyan">
                <Plus className="w-4 h-4 mr-2" />Add Learning Path
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Edit" : "Create"} Learning Path</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail URL</Label>
                  <Input value={formData.thumbnail} onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch checked={formData.is_active} onCheckedChange={(c) => setFormData({ ...formData, is_active: c })} />
                </div>
                <Button onClick={handleSubmit} className="w-full bg-gradient-to-r from-primary to-cyan">
                  {editing ? "Update" : "Create"} Learning Path
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5 text-primary" />
                All Learning Paths ({paths.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : paths.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No learning paths yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paths.map((path) => (
                      <TableRow key={path.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <GraduationCap className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{path.name}</p>
                              <p className="text-xs text-muted-foreground">{path.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={levelColors[path.level || "beginner"]}>
                            {path.level || "beginner"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={path.is_active ? "bg-emerald-500/10 text-emerald-500" : ""}>
                            {path.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(path)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(path.id)}><Trash2 className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
