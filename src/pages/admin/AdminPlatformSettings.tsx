import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, Loader2, Globe, Mail, Search, ToggleLeft, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PlatformSettings {
  academy_name: string;
  tagline: string;
  contact_email: string;
  maintenance_mode: boolean;
  seo_title: string;
  seo_description: string;
  show_featured_courses: boolean;
  show_stats: boolean;
  enable_email_confirmation: boolean;
  enable_password_reset: boolean;
}

export default function AdminPlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    academy_name: "",
    tagline: "",
    contact_email: "",
    maintenance_mode: false,
    seo_title: "",
    seo_description: "",
    show_featured_courses: true,
    show_stats: true,
    enable_email_confirmation: true,
    enable_password_reset: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from("platform_settings").select("*");
    if (!error && data) {
      const settingsMap: any = {};
      data.forEach(row => {
        try {
          settingsMap[row.key] = JSON.parse(row.value as string);
        } catch {
          settingsMap[row.key] = row.value;
        }
      });
      setSettings(prev => ({ ...prev, ...settingsMap }));
    }
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const saveSetting = async (key: string, value: any) => {
    const { error } = await supabase
      .from("platform_settings")
      .upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    return !error;
  };

  const handleSave = async () => {
    setSaving(true);
    const promises = Object.entries(settings).map(([key, value]) => saveSetting(key, value));
    const results = await Promise.all(promises);
    
    if (results.every(r => r)) {
      toast.success("Settings saved successfully");
    } else {
      toast.error("Some settings failed to save");
    }
    setSaving(false);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Platform Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your academy settings</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-primary to-cyan">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic academy information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Academy Name</Label>
                  <Input 
                    value={settings.academy_name} 
                    onChange={(e) => setSettings({ ...settings, academy_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input 
                    value={settings.tagline} 
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Contact Settings
                </CardTitle>
                <CardDescription>Contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input 
                    type="email"
                    value={settings.contact_email} 
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  SEO Settings
                </CardTitle>
                <CardDescription>Search engine optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>SEO Title</Label>
                  <Input 
                    value={settings.seo_title} 
                    onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                    placeholder="Under 60 characters"
                    maxLength={60}
                  />
                </div>
                <div className="space-y-2">
                  <Label>SEO Description</Label>
                  <Textarea 
                    value={settings.seo_description} 
                    onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                    placeholder="Under 160 characters"
                    maxLength={160}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ToggleLeft className="w-5 h-5 text-primary" />
                  Feature Toggles
                </CardTitle>
                <CardDescription>Control platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Disable public access temporarily</p>
                  </div>
                  <Switch 
                    checked={settings.maintenance_mode} 
                    onCheckedChange={(c) => setSettings({ ...settings, maintenance_mode: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Featured Courses</Label>
                    <p className="text-sm text-muted-foreground">Display on homepage</p>
                  </div>
                  <Switch 
                    checked={settings.show_featured_courses} 
                    onCheckedChange={(c) => setSettings({ ...settings, show_featured_courses: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Statistics</Label>
                    <p className="text-sm text-muted-foreground">Display stats on homepage</p>
                  </div>
                  <Switch 
                    checked={settings.show_stats} 
                    onCheckedChange={(c) => setSettings({ ...settings, show_stats: c })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Email Authentication
                </CardTitle>
                <CardDescription>Control authentication email features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      Email Confirmation
                    </Label>
                    <p className="text-sm text-muted-foreground">Send verification emails to new users upon signup</p>
                  </div>
                  <Switch 
                    checked={settings.enable_email_confirmation} 
                    onCheckedChange={(c) => setSettings({ ...settings, enable_email_confirmation: c })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-muted-foreground" />
                      Password Reset
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow users to reset their password via email</p>
                  </div>
                  <Switch 
                    checked={settings.enable_password_reset} 
                    onCheckedChange={(c) => setSettings({ ...settings, enable_password_reset: c })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
