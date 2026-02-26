import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Tag, CheckCircle2, CreditCard, Banknote, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: string;
  title: string;
  price: number;
  original_price?: number;
}

interface PaymentSettings {
  gateway: string;
  publicKey: string;
  testMode: boolean;
  currency: string;
  customInstructions: string;
}

interface EnrollmentPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  onSuccess: () => void;
}

export function EnrollmentPaymentModal({ open, onOpenChange, course, onSuccess }: EnrollmentPaymentModalProps) {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
  } | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [user, setUser] = useState<any>(null);

  const originalPrice = course.price;
  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "full"
      ? originalPrice
      : appliedCoupon.discount_type === "percentage"
      ? (originalPrice * appliedCoupon.discount_value) / 100
      : Math.min(appliedCoupon.discount_value, originalPrice)
    : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  useEffect(() => {
    if (open) {
      fetchPaymentSettings();
      fetchUser();
    }
  }, [open]);

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPaymentSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .eq("key", "payment_settings")
        .single();

      if (data && !error) {
        setPaymentSettings(data.value as unknown as PaymentSettings);
      } else {
        setPaymentSettings({
          gateway: "none",
          publicKey: "",
          testMode: true,
          currency: "NGN",
          customInstructions: "",
        });
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const { data: coupon, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !coupon) {
        toast.error("Invalid or expired coupon code");
        return;
      }

      // Check if coupon has reached max uses
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      // Check if coupon is still valid
      if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }

      setAppliedCoupon({
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      });
      toast.success("Coupon applied successfully!");
    } catch (error) {
      toast.error("Failed to apply coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleFreeEnrollment = async () => {
    if (!user) {
      toast.error("Please sign in to enroll");
      return;
    }

    setProcessing(true);
    try {
      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: user.id,
        course_id: course.id,
        amount: 0,
        original_amount: originalPrice,
        discount_amount: discountAmount,
        coupon_id: appliedCoupon?.id || null,
        payment_status: "completed",
        payment_gateway: "free",
      });

      if (paymentError) throw paymentError;

      // Update coupon usage if used
      if (appliedCoupon) {
        await supabase.from("coupon_usages").insert({
          coupon_id: appliedCoupon.id,
          user_id: user.id,
          course_id: course.id,
          discount_applied: discountAmount,
        });

        // Increment current_uses manually
        const { data: couponData } = await supabase
          .from("coupons")
          .select("current_uses")
          .eq("id", appliedCoupon.id)
          .single();

        if (couponData) {
          await supabase
            .from("coupons")
            .update({ current_uses: (couponData.current_uses || 0) + 1 })
            .eq("id", appliedCoupon.id);
        }
      }

      // Create enrollment
      const { error: enrollError } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: course.id,
        progress: 0,
      });

      if (enrollError) throw enrollError;

      onSuccess();
    } catch (error: any) {
      console.error("Enrollment error:", error);
      toast.error(error.message || "Failed to complete enrollment");
    } finally {
      setProcessing(false);
    }
  };

  const handleManualPayment = async () => {
    if (!user) {
      toast.error("Please sign in to enroll");
      return;
    }

    setProcessing(true);
    try {
      // Create pending payment record
      const { error } = await supabase.from("payments").insert({
        user_id: user.id,
        course_id: course.id,
        amount: finalPrice,
        original_amount: originalPrice,
        discount_amount: discountAmount,
        coupon_id: appliedCoupon?.id || null,
        payment_status: "pending",
        payment_gateway: "manual",
      });

      if (error) throw error;

      toast.success("Payment request submitted! Please complete the bank transfer and wait for admin approval.");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit payment request");
    } finally {
      setProcessing(false);
    }
  };

  const currencySymbol = paymentSettings?.currency === "NGN" ? "₦" : 
                         paymentSettings?.currency === "USD" ? "$" :
                         paymentSettings?.currency === "GHS" ? "₵" :
                         paymentSettings?.currency || "₦";

  if (loadingSettings) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in Course</DialogTitle>
          <DialogDescription>{course.title}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Price Summary */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Course Price</span>
                <span>{currencySymbol}{originalPrice.toLocaleString()}</span>
              </div>
              
              <AnimatePresence>
                {appliedCoupon && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between text-sm text-green-600"
                  >
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Discount ({appliedCoupon.code})
                    </span>
                    <span>-{currencySymbol}{discountAmount.toLocaleString()}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className={finalPrice === 0 ? "text-green-600" : ""}>
                  {finalPrice === 0 ? "FREE" : `${currencySymbol}${finalPrice.toLocaleString()}`}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Coupon Input */}
          <div className="space-y-2">
            <Label>Have a coupon code?</Label>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">{appliedCoupon.code}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={removeCoupon}>
                  Remove
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className="uppercase"
                />
                <Button variant="outline" onClick={applyCoupon} disabled={applyingCoupon}>
                  {applyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </Button>
              </div>
            )}
          </div>

          {/* Payment Options */}
          {finalPrice === 0 ? (
            <Button className="w-full" size="lg" onClick={handleFreeEnrollment} disabled={processing}>
              {processing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Enroll Now (Free)
            </Button>
          ) : paymentSettings?.gateway === "none" ? (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-600">Payment Not Configured</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    The administrator has not configured a payment method yet. Please contact support.
                  </p>
                </div>
              </div>
            </div>
          ) : paymentSettings?.gateway === "manual" ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Banknote className="w-4 h-4" />
                  <span className="font-medium">Bank Transfer Instructions</span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {paymentSettings.customInstructions || "Please contact the administrator for payment instructions."}
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handleManualPayment} disabled={processing}>
                {processing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Banknote className="w-4 h-4 mr-2" />
                )}
                I've Made the Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button className="w-full" size="lg" disabled>
                <CreditCard className="w-4 h-4 mr-2" />
                Pay with {paymentSettings?.gateway ? paymentSettings.gateway.charAt(0).toUpperCase() + paymentSettings.gateway.slice(1) : "Card"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Payment gateway integration pending. Contact admin.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
