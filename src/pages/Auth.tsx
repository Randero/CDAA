import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { motion } from "framer-motion";
import { CyberGrid } from "@/components/ui/CyberGrid";
import academyLogo from "@/assets/logo.png";

export default function Auth() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"signin" | "signup" | "forgot">("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [inlineError, setInlineError] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const checkRoleAndRedirect = async (userId: string) => {
    try {
      // Check roles in order of priority: admin, instructor, student
      const { data: isAdmin } = await supabase.rpc('has_role', { 
        _user_id: userId, 
        _role: 'admin' 
      });
      if (isAdmin) {
        navigate("/admin");
        return;
      }

      const { data: isInstructor } = await supabase.rpc('has_role', { 
        _user_id: userId, 
        _role: 'instructor' 
      });
      if (isInstructor) {
        navigate("/instructor");
        return;
      }

      const { data: isStudent } = await supabase.rpc('has_role', { 
        _user_id: userId, 
        _role: 'student' 
      });
      if (isStudent) {
        navigate("/student");
        return;
      }

      // Default fallback for 'user' or 'moderator' roles
      navigate("/student");
    } catch {
      navigate("/student");
    }
  };

  // Handle auth callback tokens in URL hash (email confirmation / password recovery)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const type = params.get('type');
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session from the URL tokens
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          
          if (error) {
            console.error('Error setting session from callback:', error);
            setInlineError('Email confirmation failed. Please try again.');
            toast.error('Email confirmation failed.');
            return;
          }

          if (type === 'recovery') {
            // Password recovery - show password change UI
            toast.success('Email verified! Please set your new password.');
            setTab('forgot');
            setResetEmailSent(false);
            setIsRecoveryMode(true);
          } else {
            // Email confirmation or sign-in
            toast.success('Email verified successfully! Welcome!');
            if (data.session?.user) {
              checkRoleAndRedirect(data.session.user.id);
            }
          }
        });
        return; // Don't set up normal auth listener until callback is processed
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTab('forgot');
        setIsRecoveryMode(true);
        toast.success('Please set your new password.');
        return;
      }
      if (session?.user) {
        setTimeout(() => checkRoleAndRedirect(session.user.id), 0);
      }
    });

    (async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        if (session?.user) {
          checkRoleAndRedirect(session.user.id);
        }
      } catch {
        setInlineError(
          "Authentication service is unavailable. Please refresh and try again.",
        );
        toast.error("Authentication service is unavailable.");
      }
    })();

    return () => subscription.unsubscribe();
  }, [navigate]);

  const emailSchema = z
    .string()
    .trim()
    .email("Enter a valid email address")
    .max(255, "Email is too long");

  const passwordSchema = z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password is too long");

  const phoneSchema = z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[0-9+\-().\s]+$/, "Enter a valid phone number");

  const signInSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
  });

  const signUpSchema = z
    .object({
      fullName: z
        .string()
        .trim()
        .min(1, "Full name is required")
        .max(100, "Full name is too long"),
      phone: phoneSchema,
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string(),
    })
    .superRefine(({ password, confirmPassword }, ctx) => {
      if (password !== confirmPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match",
        });
      }
    });

  const clearSensitiveFields = () => {
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    const parsed = signUpSchema.safeParse({
      fullName,
      phone,
      email,
      password,
      confirmPassword,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid sign up details";
      setInlineError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;

      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: parsed.data.fullName,
            phone: parsed.data.phone,
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase().includes("already")
          ? "This email is already registered. Please sign in instead."
          : error.message;
        setInlineError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Account created. Please verify your email, then sign in.");
      setTab("signin");
      clearSensitiveFields();
    } catch {
      const msg = "Sign up failed. Please try again.";
      setInlineError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid sign in details";
      setInlineError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (error) {
        const lower = error.message.toLowerCase();
        const msg = lower.includes("invalid login credentials")
          ? "Invalid email or password. Please try again."
          : lower.includes("email") && lower.includes("confirm")
            ? "Please verify your email first (check your inbox), then sign in."
            : error.message;
        setInlineError(msg);
        toast.error(msg);
        return;
      }

      toast.success("Welcome back!");
      // Redirect is handled by onAuthStateChange
    } catch {
      const msg = "Sign in failed. Please try again.";
      setInlineError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Enter a valid email";
      setInlineError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/auth`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        setInlineError(error.message);
        toast.error(error.message);
        return;
      }

      // Send custom branded email via edge function
      try {
        await supabase.functions.invoke('send-auth-email', {
          body: {
            type: 'password-reset',
            email: email,
            name: 'Student',
            redirectUrl: redirectUrl,
          },
        });
      } catch (emailError) {
        console.log('Custom email failed, using default Supabase email:', emailError);
      }

      setResetEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch {
      const msg = "Failed to send reset email. Please try again.";
      setInlineError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (newPassword.length < 6) {
      setInlineError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setInlineError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setInlineError(error.message);
        toast.error(error.message);
        return;
      }
      toast.success("Password updated successfully! Redirecting...");
      setIsRecoveryMode(false);
      setNewPassword("");
      setConfirmNewPassword("");
      // Session is already active, redirect
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        checkRoleAndRedirect(session.user.id);
      } else {
        setTab("signin");
      }
    } catch {
      setInlineError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="relative min-h-[80vh] flex items-center justify-center py-20 overflow-hidden">
        <CyberGrid />

        <motion.div
          className="relative z-10 w-full max-w-md px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <img
              src={academyLogo}
              alt="Cyber Defend Africa Academy"
              className="w-24 h-24 mx-auto mb-4 object-contain"
              loading="lazy"
            />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Cyber Defend Africa
            </h1>
            <p className="text-muted-foreground mt-2">
              Your gateway to cybersecurity excellence
            </p>
          </div>

          <Card className="glass-card gradient-border">
            {inlineError ? (
              <div className="px-6 pt-6">
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertDescription>{inlineError}</AlertDescription>
                </Alert>
              </div>
            ) : null}

            <Tabs
              value={tab}
              onValueChange={(v) => {
                setTab(v as "signin" | "signup" | "forgot");
                setInlineError(null);
                setResetEmailSent(false);
                clearSensitiveFields();
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-cyan-500 data-[state=active]:text-white">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Welcome back</CardTitle>
                  <CardDescription>
                    Sign in after you’ve verified your email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form noValidate onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Sign In
                    </Button>

                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setInlineError(null);
                      }}
                      className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot your password?
                    </button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="signup">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Create an account</CardTitle>
                  <CardDescription>
                    We’ll email you a verification link after signup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form noValidate onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Abubakar"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          placeholder="+234 800 000 0000"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Min. 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          minLength={6}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          placeholder="Re-enter password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Create Account
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              <TabsContent value="forgot">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">
                    {isRecoveryMode ? "Set New Password" : "Reset Password"}
                  </CardTitle>
                  <CardDescription>
                    {isRecoveryMode
                      ? "Enter your new password below"
                      : "Enter your email to receive a password reset link"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRecoveryMode ? (
                    <form noValidate onSubmit={handleUpdatePassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="new-password"
                            type="password"
                            placeholder="Min. 6 characters"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="pl-10"
                            minLength={6}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirm-new-password"
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Update Password
                      </Button>
                    </form>
                  ) : resetEmailSent ? (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-foreground font-medium">Check your inbox!</p>
                      <p className="text-muted-foreground text-sm">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setTab("signin");
                          setResetEmailSent(false);
                        }}
                        className="mt-4"
                      >
                        Back to Sign In
                      </Button>
                    </div>
                  ) : (
                    <form noValidate onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-primary to-cyan hover:from-primary/90 hover:to-cyan/90"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Send Reset Link
                      </Button>

                      <button
                        type="button"
                        onClick={() => setTab("signin")}
                        className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Back to Sign In
                      </button>
                    </form>
                  )}
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </section>
    </Layout>
  );
}

