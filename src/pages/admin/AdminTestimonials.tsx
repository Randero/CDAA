import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { 
  Star, 
  Eye, 
  EyeOff, 
  Trash2,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Database } from "@/integrations/supabase/types";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch testimonials");
      console.error(error);
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const toggleFeatured = async (testimonial: Testimonial) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_featured: !testimonial.is_featured })
      .eq("id", testimonial.id);

    if (error) {
      toast.error("Failed to update testimonial");
    } else {
      toast.success(testimonial.is_featured ? "Removed from featured" : "Added to featured");
      fetchTestimonials();
    }
  };

  const deleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete testimonial");
    } else {
      toast.success("Testimonial deleted");
      fetchTestimonials();
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const renderStars = (rating: number | null) => {
    const stars = rating || 5;
    return (
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < stars ? "text-amber-500 fill-amber-500" : "text-muted"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Testimonials</h1>
          <p className="text-muted-foreground mt-1">Manage student testimonials and reviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{testimonials.length}</p>
                <p className="text-sm text-muted-foreground">Total Testimonials</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {testimonials.filter(t => t.is_featured).length}
                </p>
                <p className="text-sm text-muted-foreground">Featured</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonials Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                All Testimonials
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading testimonials...</div>
              ) : testimonials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No testimonials yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead>Author</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Content</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonials.map((testimonial) => (
                        <TableRow key={testimonial.id} className="border-border/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={testimonial.avatar || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(testimonial.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-foreground">{testimonial.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {testimonial.role}{testimonial.company ? ` at ${testimonial.company}` : ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-foreground">{testimonial.course_title || "—"}</span>
                          </TableCell>
                          <TableCell>{renderStars(testimonial.rating)}</TableCell>
                          <TableCell>
                            <p className="text-muted-foreground truncate max-w-[250px]">
                              {testimonial.content}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={testimonial.is_featured 
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                                : "bg-muted text-muted-foreground"
                              }
                            >
                              {testimonial.is_featured ? "Featured" : "Hidden"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleFeatured(testimonial)}
                                title={testimonial.is_featured ? "Remove from featured" : "Add to featured"}
                              >
                                {testimonial.is_featured ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteTestimonial(testimonial.id)}
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
      </div>
    </AdminLayout>
  );
}
