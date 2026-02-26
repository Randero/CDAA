import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe,
  Database,
  Mail
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Configure your application settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic application configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input id="siteName" defaultValue="Cyber Defend Africa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input id="siteDescription" defaultValue="Premier Cybersecurity Training Academy" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" type="email" defaultValue="info@cyberdefendafrica.com" />
                </div>
                <Button className="w-full bg-gradient-to-r from-primary to-cyan">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">New enrollments</p>
                    <p className="text-sm text-muted-foreground">Get notified when someone enrolls</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Contact messages</p>
                    <p className="text-sm text-muted-foreground">Get notified for new contact submissions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Weekly reports</p>
                    <p className="text-sm text-muted-foreground">Receive weekly analytics reports</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Security
                </CardTitle>
                <CardDescription>Security and access control settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                  </div>
                  <Switch />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Session timeout</p>
                    <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator className="bg-border" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Login alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  System Information
                </CardTitle>
                <CardDescription>Technical details about your system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version</span>
                  <span className="text-foreground font-medium">1.0.0</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database</span>
                  <span className="text-foreground font-medium">PostgreSQL</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Storage</span>
                  <span className="text-foreground font-medium">Supabase Storage</span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Environment</span>
                  <span className="text-foreground font-medium">Production</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
