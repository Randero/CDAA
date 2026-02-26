import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: "verification" | "password-reset" | "welcome";
  email: string;
  name?: string;
  token?: string;
  redirectUrl?: string;
}

// Email template styles
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0a0a0f; }
  .container { max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 12px; overflow: hidden; border: 1px solid #1e1e2e; }
  .header { background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%); padding: 30px 40px; text-align: center; }
  .header-reset { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); }
  .header-welcome { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); }
  .logo { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .content { padding: 40px; }
  .icon { font-size: 48px; text-align: center; margin-bottom: 16px; }
  h1 { color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 24px 0; text-align: center; }
  p { color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; }
  .muted { color: #888888; font-size: 14px; text-align: center; }
  .btn-container { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; background-color: #06b6d4; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4); }
  .btn-reset { background-color: #f59e0b; color: #000000; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4); }
  .btn-welcome { background-color: #10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); }
  .code { display: block; background-color: #1e1e2e; border-radius: 8px; color: #06b6d4; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 16px auto; padding: 16px 24px; text-align: center; border: 1px solid #2e2e3e; }
  .warning-box { background-color: #1e1e2e; border-radius: 8px; padding: 16px; margin: 24px 0; border: 1px solid #2e2e3e; text-align: center; color: #f59e0b; font-size: 14px; }
  .features { background-color: #1e1e2e; border-radius: 8px; padding: 20px 24px; margin: 24px 0; border: 1px solid #2e2e3e; }
  .feature-item { color: #e0e0e0; font-size: 14px; line-height: 1.8; margin: 0; }
  .tip-box { background-color: rgba(6, 182, 212, 0.1); border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid rgba(6, 182, 212, 0.3); }
  .tip-title { color: #06b6d4; font-size: 14px; font-weight: bold; margin: 0 0 8px 0; }
  .tip-text { color: #a0a0a0; font-size: 14px; line-height: 1.6; margin: 0; }
  hr { border: none; border-top: 1px solid #1e1e2e; margin: 0; }
  .footer { padding: 24px 40px; text-align: center; }
  .footer-text { color: #888888; font-size: 14px; margin: 0 0 12px 0; }
  .footer-links { color: #666666; font-size: 12px; margin: 0 0 12px 0; }
  .footer-links a { color: #06b6d4; text-decoration: none; }
  .copyright { color: #555555; font-size: 11px; margin: 0; }
`;

function getVerificationEmail(name: string, verificationLink: string, token?: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header">
          <h2 class="logo">🛡️ Cyber Defend Africa</h2>
        </div>
        <div class="content">
          <h1>Verify Your Email Address</h1>
          <p>Hi ${name},</p>
          <p>Welcome to <strong>Cyber Defend Africa Academy</strong>! You're just one step away from starting your cybersecurity journey. Please verify your email address to activate your account.</p>
          <div class="btn-container">
            <a href="${verificationLink}" class="btn">Verify Email Address</a>
          </div>
          ${token ? `
            <p class="muted">Or copy and paste this verification code:</p>
            <code class="code">${token}</code>
          ` : ''}
          <p class="muted">This link will expire in 24 hours. If you didn't create an account with us, you can safely ignore this email.</p>
        </div>
        <hr>
        <div class="footer">
          <p class="footer-text"><strong>Cyber Defend Africa Academy</strong><br>Your gateway to cybersecurity excellence</p>
          <p class="footer-links">
            <a href="https://cyberdefendafrica.com">Website</a> • 
            <a href="https://cyberdefendafrica.com/courses">Courses</a> • 
            <a href="https://cyberdefendafrica.com/contact">Support</a>
          </p>
          <p class="copyright">© ${new Date().getFullYear()} Cyber Defend Africa. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPasswordResetEmail(name: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header header-reset">
          <h2 class="logo">🛡️ Cyber Defend Africa</h2>
        </div>
        <div class="content">
          <div class="icon">🔐</div>
          <h1>Reset Your Password</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset the password for your <strong>Cyber Defend Africa Academy</strong> account. Click the button below to create a new password.</p>
          <div class="btn-container">
            <a href="${resetLink}" class="btn btn-reset">Reset Password</a>
          </div>
          <div class="warning-box">
            ⚠️ If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
          </div>
          <p class="muted">This link will expire in 1 hour for security reasons.</p>
        </div>
        <hr>
        <div class="footer">
          <p class="footer-text"><strong>Cyber Defend Africa Academy</strong><br>Your gateway to cybersecurity excellence</p>
          <p class="footer-links">
            <a href="https://cyberdefendafrica.com">Website</a> • 
            <a href="https://cyberdefendafrica.com/contact">Support</a>
          </p>
          <p class="copyright">© ${new Date().getFullYear()} Cyber Defend Africa. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getWelcomeEmail(name: string, dashboardLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header header-welcome">
          <h2 class="logo">🛡️ Cyber Defend Africa</h2>
        </div>
        <div class="content">
          <div class="icon">🎉</div>
          <h1>Welcome to the Academy!</h1>
          <p>Hi ${name},</p>
          <p>Congratulations! Your email has been verified and your <strong>Cyber Defend Africa Academy</strong> account is now fully activated. You're ready to start your journey into the world of cybersecurity.</p>
          <div class="features">
            <p class="feature-item">✅ Access to world-class cybersecurity courses</p>
            <p class="feature-item">✅ Learn from industry expert instructors</p>
            <p class="feature-item">✅ Earn certificates upon completion</p>
            <p class="feature-item">✅ Join a community of cyber defenders</p>
          </div>
          <div class="btn-container">
            <a href="${dashboardLink}" class="btn btn-welcome">Go to Dashboard</a>
          </div>
          <div class="tip-box">
            <p class="tip-title">💡 Getting Started Tip</p>
            <p class="tip-text">Browse our course catalog and enroll in your first course. We recommend starting with the fundamentals if you're new to cybersecurity!</p>
          </div>
        </div>
        <hr>
        <div class="footer">
          <p class="footer-text"><strong>Cyber Defend Africa Academy</strong><br>Your gateway to cybersecurity excellence</p>
          <p class="footer-links">
            <a href="https://cyberdefendafrica.com">Website</a> • 
            <a href="https://cyberdefendafrica.com/courses">Courses</a> • 
            <a href="https://cyberdefendafrica.com/contact">Support</a>
          </p>
          <p class="copyright">© ${new Date().getFullYear()} Cyber Defend Africa. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, token, redirectUrl }: EmailRequest = await req.json();

    // Check platform settings to see if this email type is enabled
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (type === "verification") {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "enable_email_confirmation")
        .single();
      if (data && data.value === "false") {
        console.log("Email confirmation is disabled via platform settings");
        return new Response(JSON.stringify({ success: false, error: "Email confirmation is disabled" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    if (type === "password-reset") {
      const { data } = await supabase
        .from("platform_settings")
        .select("value")
        .eq("key", "enable_password_reset")
        .single();
      if (data && data.value === "false") {
        console.log("Password reset is disabled via platform settings");
        return new Response(JSON.stringify({ success: false, error: "Password reset is disabled" }), {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    console.log(`Sending ${type} email to ${email}`);

    let html: string;
    let subject: string;

    switch (type) {
      case "verification":
        subject = "Verify your email - Cyber Defend Africa Academy";
        html = getVerificationEmail(name || "Student", redirectUrl || "#", token);
        break;

      case "password-reset":
        subject = "Reset your password - Cyber Defend Africa Academy";
        html = getPasswordResetEmail(name || "Student", redirectUrl || "#");
        break;

      case "welcome":
        subject = "Welcome to Cyber Defend Africa Academy!";
        html = getWelcomeEmail(name || "Student", redirectUrl || "#");
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Cyber Defend Africa <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
