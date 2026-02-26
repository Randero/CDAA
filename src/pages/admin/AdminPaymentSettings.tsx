import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CreditCard, Settings, Key, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface PaymentSettings {
  gateway: string;
  publicKey: string;
  secretKey: string;
  webhookUrl: string;
  testMode: boolean;
  currency: string;
  customInstructions: string;
}

const paymentGateways = [
  { id: "paystack", name: "Paystack", description: "Popular in Nigeria & Ghana" },
  { id: "remita", name: "Remita", description: "Nigerian payment platform" },
  { id: "flutterwave", name: "Flutterwave", description: "Pan-African payments" },
  { id: "manual", name: "Manual/Bank Transfer", description: "Manual payment verification" },
  { id: "none", name: "Not Configured", description: "Payments disabled" },
];

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState<PaymentSettings>({
    gateway: "none",
    publicKey: "",
    secretKey: "",
    webhookUrl: "",
    testMode: true,
    currency: "NGN",
    customInstructions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("key", "payment_settings")
        .single();

      if (data && !error) {
        setSettings(data.value as unknown as PaymentSettings);
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // First check if the setting exists
      const { data: existing } = await supabase
        .from("platform_settings")
        .select("id")
        .eq("key", "payment_settings")
        .single();

      let error;
      if (existing) {
        const result = await supabase
          .from("platform_settings")
          .update({
            value: settings as any,
            updated_at: new Date().toISOString(),
          })
          .eq("key", "payment_settings");
        error = result.error;
      } else {
        const result = await supabase
          .from("platform_settings")
          .insert({
            key: "payment_settings",
            value: settings as any,
          });
        error = result.error;
      }

      if (error) throw error;
      toast.success("Payment settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Payment Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your payment gateway integration</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Gateway
                </CardTitle>
                <CardDescription>Select and configure your preferred payment provider</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Provider</Label>
                  <Select value={settings.gateway} onValueChange={(v) => setSettings({ ...settings, gateway: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gateway" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentGateways.map((gw) => (
                        <SelectItem key={gw.id} value={gw.id}>
                          <div className="flex flex-col">
                            <span>{gw.name}</span>
                            <span className="text-xs text-muted-foreground">{gw.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <Label>Test Mode</Label>
                    <p className="text-sm text-muted-foreground">Use sandbox/test credentials</p>
                  </div>
                  <Switch
                    checked={settings.testMode}
                    onCheckedChange={(v) => setSettings({ ...settings, testMode: v })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={settings.currency} onValueChange={(v) => setSettings({ ...settings, currency: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                      <SelectItem value="GHS">Ghanaian Cedi (₵)</SelectItem>
                      <SelectItem value="KES">Kenyan Shilling (KSh)</SelectItem>
                      <SelectItem value="ZAR">South African Rand (R)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {settings.gateway !== "none" && settings.gateway !== "manual" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Credentials
                  </CardTitle>
                  <CardDescription>Enter your {paymentGateways.find(g => g.id === settings.gateway)?.name} API keys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Public Key</Label>
                    <Input
                      type="text"
                      placeholder="pk_test_xxx or pk_live_xxx"
                      value={settings.publicKey}
                      onChange={(e) => setSettings({ ...settings, publicKey: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      placeholder="sk_test_xxx or sk_live_xxx"
                      value={settings.secretKey}
                      onChange={(e) => setSettings({ ...settings, secretKey: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">This key is stored securely and never exposed to clients</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {settings.gateway === "manual" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Manual Payment Instructions
                  </CardTitle>
                  <CardDescription>Instructions shown to students for bank transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Bank: First Bank Nigeria&#10;Account Name: Cyber Academy&#10;Account Number: 1234567890&#10;&#10;Send proof of payment to payments@example.com"
                    value={settings.customInstructions}
                    onChange={(e) => setSettings({ ...settings, customInstructions: e.target.value })}
                    rows={6}
                  />
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>For payment verification callbacks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <Label className="text-sm">Your Webhook URL</Label>
                  <p className="text-sm font-mono mt-1 text-muted-foreground">
                    {window.location.origin}/api/payment-webhook
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Configure this URL in your payment provider's dashboard to receive payment notifications
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}
