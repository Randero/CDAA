import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Database } from "@/integrations/supabase/types";

type CourseCategory = Database["public"]["Enums"]["course_category"];
type CourseLevel = Database["public"]["Enums"]["course_level"];

const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  short_description: z.string().max(200, "Short description must be under 200 characters").optional(),
  category: z.enum(["penetration-testing", "network-security", "incident-response", "cloud-security", "security-fundamentals", "malware-analysis"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  price: z.number().min(0, "Price must be positive"),
  original_price: z.number().min(0).optional(),
  instructor_name: z.string().min(2, "Instructor name is required"),
  instructor_title: z.string().optional(),
  instructor_avatar: z.string().url().optional().or(z.literal("")),
  thumbnail: z.string().url().optional().or(z.literal("")),
  duration: z.string().optional(),
  lessons_count: z.number().min(0).optional(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

type CourseFormData = z.infer<typeof courseSchema>;

export default function AdminCourseEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    category: "security-fundamentals",
    level: "beginner",
    price: 0,
    original_price: undefined,
    instructor_name: "",
    instructor_title: "",
    instructor_avatar: "",
    thumbnail: "",
    duration: "",
    lessons_count: 0,
    is_published: false,
    is_featured: false,
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchCourse(id);
    }
  }, [id, isEditing]);

  const fetchCourse = async (courseId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) {
      toast.error("Failed to fetch course");
      navigate("/admin/courses");
    } else if (data) {
      setFormData({
        title: data.title,
        slug: data.slug,
        description: data.description,
        short_description: data.short_description || "",
        category: data.category,
        level: data.level,
        price: Number(data.price),
        original_price: data.original_price ? Number(data.original_price) : undefined,
        instructor_name: data.instructor_name,
        instructor_title: data.instructor_title || "",
        instructor_avatar: data.instructor_avatar || "",
        thumbnail: data.thumbnail || "",
        duration: data.duration || "",
        lessons_count: data.lessons_count || 0,
        is_published: data.is_published || false,
        is_featured: data.is_featured || false,
      });
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: isEditing ? prev.slug : generateSlug(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = courseSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && id) {
        const { error } = await supabase
          .from("courses")
          .update({
            title: formData.title,
            slug: formData.slug,
            description: formData.description,
            short_description: formData.short_description || null,
            category: formData.category,
            level: formData.level,
            price: formData.price,
            original_price: formData.original_price || null,
            instructor_name: formData.instructor_name,
            instructor_title: formData.instructor_title || null,
            instructor_avatar: formData.instructor_avatar || null,
            thumbnail: formData.thumbnail || null,
            duration: formData.duration || null,
            lessons_count: formData.lessons_count || 0,
            is_published: formData.is_published,
            is_featured: formData.is_featured,
          })
          .eq("id", id);

        if (error) throw error;
        toast.success("Course updated successfully");
      } else {
        const { error } = await supabase
          .from("courses")
          .insert([{
            title: formData.title,
            slug: formData.slug,
            description: formData.description,
            short_description: formData.short_description || null,
            category: formData.category,
            level: formData.level,
            price: formData.price,
            original_price: formData.original_price || null,
            instructor_name: formData.instructor_name,
            instructor_title: formData.instructor_title || null,
            instructor_avatar: formData.instructor_avatar || null,
            thumbnail: formData.thumbnail || null,
            duration: formData.duration || null,
            lessons_count: formData.lessons_count || 0,
            is_published: formData.is_published,
            is_featured: formData.is_featured,
          }]);

        if (error) throw error;
        toast.success("Course created successfully");
      }
      navigate("/admin/courses");
    } catch (error: any) {
      console.error("Error saving course:", error);
      toast.error(error.message || "Failed to save course");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/admin/courses")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {isEditing ? "Edit Course" : "Create Course"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isEditing ? "Update course details" : "Add a new course to the catalog"}
              </p>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={saving}
            className="bg-gradient-to-r from-primary to-cyan"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Save Course</>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., Advanced Penetration Testing"
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="e.g., advanced-penetration-testing"
                    className={errors.slug ? "border-destructive" : ""}
                  />
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description</Label>
                  <Input
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, short_description: e.target.value }))}
                    placeholder="Brief course overview (max 200 chars)"
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed course description..."
                    rows={6}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnail">Thumbnail URL</Label>
                  <Input
                    id="thumbnail"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="instructor_name">Instructor Name *</Label>
                    <Input
                      id="instructor_name"
                      value={formData.instructor_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructor_name: e.target.value }))}
                      placeholder="Abubakar"
                      className={errors.instructor_name ? "border-destructive" : ""}
                    />
                    {errors.instructor_name && <p className="text-sm text-destructive">{errors.instructor_name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor_title">Instructor Title</Label>
                    <Input
                      id="instructor_title"
                      value={formData.instructor_title}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructor_title: e.target.value }))}
                      placeholder="Senior Security Analyst"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor_avatar">Instructor Avatar URL</Label>
                  <Input
                    id="instructor_avatar"
                    value={formData.instructor_avatar}
                    onChange={(e) => setFormData(prev => ({ ...prev, instructor_avatar: e.target.value }))}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: CourseCategory) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="security-fundamentals">Security Fundamentals</SelectItem>
                      <SelectItem value="penetration-testing">Penetration Testing</SelectItem>
                      <SelectItem value="network-security">Network Security</SelectItem>
                      <SelectItem value="cloud-security">Cloud Security</SelectItem>
                      <SelectItem value="incident-response">Incident Response</SelectItem>
                      <SelectItem value="malware-analysis">Malware Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value: CourseLevel) => setFormData(prev => ({ ...prev, level: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 20 hours"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lessons_count">Number of Lessons</Label>
                  <Input
                    id="lessons_count"
                    type="number"
                    min="0"
                    value={formData.lessons_count || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, lessons_count: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="99.99"
                    className={errors.price ? "border-destructive" : ""}
                  />
                  {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="original_price">Original Price (for discount display)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.original_price || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseFloat(e.target.value) || undefined }))}
                    placeholder="149.99"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_published">Published</Label>
                    <p className="text-sm text-muted-foreground">Make course visible to users</p>
                  </div>
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="is_featured">Featured</Label>
                    <p className="text-sm text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
