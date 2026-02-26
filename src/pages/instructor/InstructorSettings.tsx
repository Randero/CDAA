import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Globe, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "sonner";
import { PasswordChangeCard } from "@/components/settings/PasswordChangeCard";

export default function InstructorSettings() {
  const { user } = useUserRole();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["instructor-profile-settings", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    country: "",
    avatar_url: "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-profile-settings"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
      console.error(error);
    },
  });

  const handleEdit = () => {
    setFormData({
      full_name: profile?.full_name || "",
      bio: profile?.bio || "",
      country: profile?.country || "",
      avatar_url: profile?.avatar_url || "",
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  return (
    <DashboardLayout type="instructor">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your instructor profile and preferences
          </p>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Instructor Profile</CardTitle>
            <CardDescription>
              This information will be visible to students on your courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={isEditing ? formData.avatar_url : profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {(profile?.full_name || user?.email)?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="flex-1 space-y-2">
                  <Label htmlFor="avatar_url">Profile Image URL</Label>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-muted-foreground">
                    Use a professional photo for your instructor profile
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Form Fields */}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {profile?.full_name || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {user?.email}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                {isEditing ? (
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Enter your country"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-foreground">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {profile?.country || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell students about your expertise and experience"
                    rows={5}
                  />
                ) : (
                  <p className="text-foreground">
                    {profile?.bio || "No bio set. Add a bio to help students know more about you."}
                  </p>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">
                    This will be displayed on your instructor profile and course pages
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} disabled={updateMutation.isPending}>
                    {updateMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit}>Edit Profile</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Password Change Section */}
        <PasswordChangeCard />
      </div>
    </DashboardLayout>
  );
}
