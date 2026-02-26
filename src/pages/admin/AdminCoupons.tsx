import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Plus, Ticket, Trash2, Copy, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
}

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    max_uses: "",
    valid_until: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const handleSubmit = async () => {
    if (!formData.code) {
      toast.error("Coupon code is required");
      return;
    }

    setSaving(true);
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        description: formData.description || null,
        discount_type: formData.discount_type,
        discount_value: formData.discount_type === "full" ? 100 : formData.discount_value,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until || null,
        is_active: formData.is_active,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from("coupons")
          .update(couponData)
          .eq("id", editingCoupon.id);
        if (error) throw error;
        toast.success("Coupon updated successfully");
      } else {
        const { error } = await supabase.from("coupons").insert(couponData);
        if (error) throw error;
        toast.success("Coupon created successfully");
      }

      setDialogOpen(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error: any) {
      console.error("Error saving coupon:", error);
      toast.error(error.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: 0,
      max_uses: "",
      valid_until: "",
      is_active: true,
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_uses: coupon.max_uses?.toString() || "",
      valid_until: coupon.valid_until ? coupon.valid_until.split("T")[0] : "",
      is_active: coupon.is_active,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      const { error } = await supabase
        .from("coupons")
        .update({ is_active: !coupon.is_active })
        .eq("id", coupon.id);
      if (error) throw error;
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to update coupon");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Coupon code copied!");
  };

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === "full") return "100% OFF (FREE)";
    if (coupon.discount_type === "percentage") return `${coupon.discount_value}% OFF`;
    return `₦${coupon.discount_value.toLocaleString()} OFF`;
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
            <h1 className="text-3xl font-display font-bold text-foreground">Coupons</h1>
            <p className="text-muted-foreground mt-1">Manage discount codes and promotions</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingCoupon(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Coupon
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create New Coupon"}</DialogTitle>
                <DialogDescription>
                  {editingCoupon ? "Update coupon details" : "Create a discount code for your students"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Coupon Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="e.g., SUMMER2024"
                      className="uppercase"
                    />
                    <Button type="button" variant="outline" onClick={generateCode}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Summer promotion discount"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(v) => setFormData({ ...formData, discount_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage Off</SelectItem>
                      <SelectItem value="fixed">Fixed Amount Off</SelectItem>
                      <SelectItem value="full">100% Off (Free)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.discount_type !== "full" && (
                  <div className="space-y-2">
                    <Label>
                      {formData.discount_type === "percentage" ? "Discount Percentage" : "Discount Amount (₦)"}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max={formData.discount_type === "percentage" ? 100 : undefined}
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Max Uses (Optional)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                    placeholder="Unlimited if empty"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Valid Until (Optional)</Label>
                  <Input
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Active</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                  />
                </div>

                <Button className="w-full" onClick={handleSubmit} disabled={saving}>
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Active Coupons
              </CardTitle>
              <CardDescription>{coupons.length} total coupons</CardDescription>
            </CardHeader>
            <CardContent>
              {coupons.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No coupons created yet. Create your first coupon to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyCode(coupon.code)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          {coupon.description && (
                            <p className="text-xs text-muted-foreground mt-1">{coupon.description}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={coupon.discount_type === "full" ? "default" : "secondary"}>
                            {getDiscountDisplay(coupon)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {coupon.current_uses} / {coupon.max_uses || "∞"}
                        </TableCell>
                        <TableCell>
                          {coupon.valid_until
                            ? format(new Date(coupon.valid_until), "MMM d, yyyy")
                            : "No expiry"}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={coupon.is_active}
                            onCheckedChange={() => toggleActive(coupon)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(coupon)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(coupon.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
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
