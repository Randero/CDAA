import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  BookOpen,
  Users,
  Star,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["courses"]["Row"];

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch courses");
      console.error(error);
    } else {
      setCourses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const approveCourse = async (course: Course) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from("courses")
      .update({ 
        status: "approved",
        is_published: true,
        approved_at: new Date().toISOString(),
        approved_by: user?.id
      })
      .eq("id", course.id);

    if (error) {
      toast.error("Failed to approve course");
      console.error(error);
    } else {
      toast.success("Course approved and published!");
      // Log audit event
      await supabase.rpc("log_audit_event", {
        p_action: "COURSE_APPROVED",
        p_entity_type: "course",
        p_entity_id: course.id,
        p_details: { course_title: course.title }
      });
      fetchCourses();
    }
  };

  const rejectCourse = async () => {
    if (!selectedCourse || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    const { error } = await supabase
      .from("courses")
      .update({ 
        status: "rejected",
        rejection_reason: rejectionReason.trim()
      })
      .eq("id", selectedCourse.id);

    if (error) {
      toast.error("Failed to reject course");
      console.error(error);
    } else {
      toast.success("Course rejected");
      // Log audit event
      await supabase.rpc("log_audit_event", {
        p_action: "COURSE_REJECTED",
        p_entity_type: "course",
        p_entity_id: selectedCourse.id,
        p_details: { 
          course_title: selectedCourse.title,
          reason: rejectionReason.trim()
        }
      });
      setRejectDialogOpen(false);
      setSelectedCourse(null);
      setRejectionReason("");
      fetchCourses();
    }
  };

  const togglePublish = async (course: Course) => {
    const { error } = await supabase
      .from("courses")
      .update({ is_published: !course.is_published })
      .eq("id", course.id);

    if (error) {
      toast.error("Failed to update course");
    } else {
      toast.success(course.is_published ? "Course unpublished" : "Course published");
      fetchCourses();
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete course");
    } else {
      toast.success("Course deleted");
      fetchCourses();
    }
  };

  const getFilteredCourses = () => {
    let filtered = courses;
    
    // Filter by tab
    if (activeTab === "pending") {
      filtered = courses.filter(c => c.status === "submitted");
    } else if (activeTab === "approved") {
      filtered = courses.filter(c => c.status === "approved");
    } else if (activeTab === "rejected") {
      filtered = courses.filter(c => c.status === "rejected");
    } else if (activeTab === "draft") {
      filtered = courses.filter(c => c.status === "draft");
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredCourses = getFilteredCourses();
  const pendingCount = courses.filter(c => c.status === "submitted").length;

  const levelColors: Record<string, string> = {
    beginner: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    intermediate: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    advanced: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    submitted: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-500 border-red-500/20",
    archived: "bg-muted text-muted-foreground",
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1">Manage your course catalog</p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90" asChild>
            <Link to="/admin/courses/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Link>
          </Button>
        </div>

        {/* Pending Approval Alert */}
        {pendingCount > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/10">
            <CardContent className="p-4 flex items-center gap-4">
              <Clock className="w-6 h-6 text-amber-500" />
              <div>
                <p className="font-medium text-foreground">
                  {pendingCount} course{pendingCount > 1 ? "s" : ""} awaiting approval
                </p>
                <p className="text-sm text-muted-foreground">
                  Review submitted courses from instructors
                </p>
              </div>
              <Button 
                variant="outline" 
                className="ml-auto border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                onClick={() => setActiveTab("pending")}
              >
                Review Now
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Courses Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({courses.length})</TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              Pending ({pendingCount})
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    {activeTab === "pending" ? "Courses Awaiting Approval" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Courses`} ({filteredCourses.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading courses...</div>
                  ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">No courses found</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead>Course</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCourses.map((course) => (
                            <TableRow key={course.id} className="border-border/50">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {course.thumbnail && (
                                    <img 
                                      src={course.thumbnail} 
                                      alt={course.title}
                                      className="w-12 h-12 rounded-lg object-cover"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium text-foreground">{course.title}</p>
                                    <p className="text-xs text-muted-foreground">{course.instructor_name}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {course.category.replace("-", " ")}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className={levelColors[course.level]}>
                                  {course.level}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-foreground">
                                  ${Number(course.price).toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  {course.students_count}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className={statusColors[course.status || "draft"]}
                                >
                                  {course.status === "submitted" ? "Pending" : course.status || "Draft"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-end gap-2">
                                  {/* Approval Actions for Pending Courses */}
                                  {course.status === "submitted" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-emerald-500 border-emerald-500/50 hover:bg-emerald-500/10"
                                        onClick={() => approveCourse(course)}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Approve
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                                        onClick={() => {
                                          setSelectedCourse(course);
                                          setRejectDialogOpen(true);
                                        }}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  
                                  {/* Standard Actions */}
                                  {course.status === "approved" && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => togglePublish(course)}
                                      title={course.is_published ? "Unpublish" : "Publish"}
                                    >
                                      {course.is_published ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  )}
                                  <Button variant="ghost" size="icon" title="Edit" asChild>
                                    <Link to={`/admin/courses/${course.id}/edit`}>
                                      <Edit className="w-4 h-4" />
                                    </Link>
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => deleteCourse(course.id)}
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
          </TabsContent>
        </Tabs>

        {/* Reject Course Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                You are about to reject: <span className="font-medium text-foreground">{selectedCourse?.title}</span>
              </p>
              <div>
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={rejectCourse}
                disabled={!rejectionReason.trim()}
              >
                Reject Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}