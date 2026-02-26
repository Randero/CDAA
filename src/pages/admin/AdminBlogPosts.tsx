import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Pin, AlertTriangle, FileText } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  is_pinned: boolean;
  is_alert: boolean;
  published_at: string | null;
  created_at: string;
}

export default function AdminBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, status, is_pinned, is_alert, published_at, created_at")
      .order("created_at", { ascending: false });
    if (error) toast.error("Failed to fetch posts");
    else setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const toggleStatus = async (post: BlogPost, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === "published" && !post.published_at) {
      updates.published_at = new Date().toISOString();
    }
    
    const { error } = await supabase.from("blog_posts").update(updates).eq("id", post.id);
    if (error) toast.error("Failed to update");
    else { toast.success(`Post ${newStatus}`); fetchPosts(); }
  };

  const togglePin = async (post: BlogPost) => {
    const { error } = await supabase.from("blog_posts").update({ is_pinned: !post.is_pinned }).eq("id", post.id);
    if (error) toast.error("Failed to update");
    else { toast.success(post.is_pinned ? "Unpinned" : "Pinned"); fetchPosts(); }
  };

  const toggleAlert = async (post: BlogPost) => {
    const { error } = await supabase.from("blog_posts").update({ is_alert: !post.is_alert }).eq("id", post.id);
    if (error) toast.error("Failed to update");
    else { toast.success(post.is_alert ? "Alert removed" : "Marked as alert"); fetchPosts(); }
  };

  const deletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { toast.success("Deleted"); fetchPosts(); }
  };

  const filteredPosts = posts.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    pending: "bg-amber-500/10 text-amber-500",
    published: "bg-emerald-500/10 text-emerald-500",
    archived: "bg-red-500/10 text-red-500",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Blog & Announcements</h1>
            <p className="text-muted-foreground mt-1">Manage blog posts and security alerts</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-cyan" asChild>
            <Link to="/admin/blog/new">
              <Plus className="w-4 h-4 mr-2" />New Post
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Eye className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === "published").length}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Pin className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.is_pinned).length}</p>
                <p className="text-sm text-muted-foreground">Pinned</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.filter(p => p.is_alert).length}</p>
                <p className="text-sm text-muted-foreground">Alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                All Posts ({filteredPosts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : filteredPosts.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No posts found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{post.title}</p>
                            <p className="text-xs text-muted-foreground">{post.slug}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[post.status]}>
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {post.is_pinned && <Badge variant="outline" className="bg-amber-500/10 text-amber-500"><Pin className="w-3 h-3" /></Badge>}
                            {post.is_alert && <Badge variant="outline" className="bg-red-500/10 text-red-500"><AlertTriangle className="w-3 h-3" /></Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => togglePin(post)} title={post.is_pinned ? "Unpin" : "Pin"}>
                              <Pin className={`w-4 h-4 ${post.is_pinned ? "text-amber-500" : ""}`} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => toggleAlert(post)} title={post.is_alert ? "Remove Alert" : "Mark Alert"}>
                              <AlertTriangle className={`w-4 h-4 ${post.is_alert ? "text-red-500" : ""}`} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => toggleStatus(post, post.status === "published" ? "draft" : "published")}
                              title={post.status === "published" ? "Unpublish" : "Publish"}
                            >
                              {post.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/blog/${post.id}/edit`}><Edit className="w-4 h-4" /></Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deletePost(post.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
