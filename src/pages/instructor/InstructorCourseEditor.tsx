import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Send, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type CourseCategory = Database["public"]["Enums"]["course_category"];
type CourseLevel = Database["public"]["Enums"]["course_level"];

const categoryOptions: { value: CourseCategory; label: string }[] = [
  { value: "penetration-testing", label: "Penetration Testing" },
  { value: "network-security", label: "Network Security" },
  { value: "incident-response", label: "Incident Response" },
  { value: "cloud-security", label: "Cloud Security" },
  { value: "security-fundamentals", label: "Security Fundamentals" },
  { value: "malware-analysis", label: "Malware Analysis" },
];

const levelOptions: { value: CourseLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function InstructorCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUserRole();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    category: "security-fundamentals" as CourseCategory,
    level: "beginner" as CourseLevel,
    duration: "",
    lessons_count: 0,
    price: 0,
    original_price: 0,
    thumbnail: "",
    total_points: 100,
  });

  const { isLoading: courseLoading } = useQuery({
    queryKey: ["instructor-course-edit", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      
      setFormData({
        title: data.title || "",
        slug: data.slug || "",
        description: data.description || "",
        short_description: data.short_description || "",
        category: data.category as CourseCategory,
        level: data.level as CourseLevel,
        duration: data.duration || "",
        lessons_count: data.lessons_count || 0,
        price: data.price || 0,
        original_price: data.original_price || 0,
        thumbnail: data.thumbnail || "",
        total_points: data.total_points || 100,
      });
      
      return data;
    },
    enabled: !!id,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: isEditing ? formData.slug : generateSlug(title),
    });
  };

  const saveMutation = useMutation({
    mutationFn: async (submitForReview: boolean) => {
      if (!user?.id) throw new Error("Not authenticated");

      const status: Database["public"]["Enums"]["course_status"] = submitForReview ? "submitted" : "draft";

      const courseData = {
        ...formData,
        instructor_id: user.id,
        instructor_name: profile?.full_name || "Unknown Instructor",
        status,
        submitted_at: submitForReview ? new Date().toISOString() : null,
      };

      if (isEditing) {
        const { error } = await supabase
          .from("courses")
          .update(courseData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("courses")
          .insert([courseData]);

        if (error) throw error;
      }
    },
    onSuccess: (_, submitForReview) => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      toast.success(submitForReview ? "Course submitted for review" : "Course saved as draft");
      navigate("/instructor/courses");
    },
    onError: (error) => {
      toast.error("Failed to save course");
      console.error(error);
    },
  });

  const handleSubmit = (submitForReview: boolean) => {
    if (!formData.title || !formData.slug || !formData.description || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }
    saveMutation.mutate(submitForReview);
  };

  if (courseLoading) {
    return (
      <DashboardLayout type="instructor">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/instructor/courses")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">
              {isEditing ? "Edit Course" : "Create New Course"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? "Update your course details" : "Fill in the details to create a new course"}
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Course Details</CardTitle>
            <CardDescription>Basic information about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g., Introduction to Ethical Hacking"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="intro-to-ethical-hacking"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Short Description</Label>
              <Textarea
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="A brief summary of your course (displayed in cards)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of what students will learn"
                rows={6}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as CourseCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => setFormData({ ...formData, level: value as CourseLevel })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 10 hours"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessons_count">Number of Lessons</Label>
                <Input
                  id="lessons_count"
                  type="number"
                  value={formData.lessons_count}
                  onChange={(e) => setFormData({ ...formData, lessons_count: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price ($)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                  placeholder="For showing discounts"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_points">Total Course Points</Label>
                <Input
                  id="total_points"
                  type="number"
                  value={formData.total_points}
                  onChange={(e) => setFormData({ ...formData, total_points: parseInt(e.target.value) || 100 })}
                  placeholder="Total points for course grade"
                />
                <p className="text-xs text-muted-foreground">
                  Used to calculate student progress based on assignment scores
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save as Draft
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Submit for Review
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
