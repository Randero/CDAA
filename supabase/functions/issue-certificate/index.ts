import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface IssueCertificateRequest {
  user_id: string;
  course_id: string;
  student_name: string;
  course_name: string;
  send_email: boolean;
  dashboard_url?: string;
}

// Email template styles
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0a0a0f; }
  .container { max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 12px; overflow: hidden; border: 1px solid #1e1e2e; }
  .header { background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%); padding: 30px 40px; text-align: center; }
  .logo { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .content { padding: 40px; }
  .icon { font-size: 64px; text-align: center; margin-bottom: 16px; }
  h1 { color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 24px 0; text-align: center; }
  p { color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; }
  .muted { color: #888888; font-size: 14px; text-align: center; }
  .btn-container { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; background-color: #f59e0b; border-radius: 8px; color: #000000; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4); }
  .achievement-box { background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(245, 158, 11, 0.3); text-align: center; }
  .certificate-id { color: #f59e0b; font-size: 12px; font-family: monospace; margin: 8px 0 0 0; }
  hr { border: none; border-top: 1px solid #1e1e2e; margin: 0; }
  .footer { padding: 24px 40px; text-align: center; }
  .footer-text { color: #888888; font-size: 14px; margin: 0 0 12px 0; }
  .footer-links { color: #666666; font-size: 12px; margin: 0 0 12px 0; }
  .footer-links a { color: #06b6d4; text-decoration: none; }
  .copyright { color: #555555; font-size: 11px; margin: 0; }
`;

function getCertificateEarnedEmail(name: string, courseName: string, certificateId: string, dashboardUrl: string): string {
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
          <div class="icon">🏅</div>
          <h1>Certificate Earned!</h1>
          <p>Congratulations, <strong>${name}</strong>!</p>
          <p>You have earned a certificate of completion for:</p>
          <div class="achievement-box">
            <p style="color: #f59e0b; font-size: 14px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Certificate of Completion</p>
            <p style="color: #ffffff; font-size: 24px; font-weight: bold; margin: 0;">${courseName}</p>
            <p class="certificate-id">Verification ID: ${certificateId}</p>
          </div>
          <p>This certificate validates your expertise and can be shared on your professional profiles. Your dedication to cybersecurity excellence has been recognized!</p>
          <div class="btn-container">
            <a href="${dashboardUrl}/student/certificates" class="btn">View Your Certificate</a>
          </div>
          <p class="muted">You can download and share your certificate from your dashboard at any time.</p>
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { 
      user_id, 
      course_id, 
      student_name, 
      course_name, 
      send_email,
      dashboard_url 
    }: IssueCertificateRequest = await req.json();

    console.log(`Issuing certificate for ${student_name} - ${course_name}`);

    // Generate verification ID
    const verificationId = `CDA-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Insert certificate
    const { data: certificate, error: insertError } = await supabaseAdmin
      .from("certificates")
      .insert({
        user_id,
        course_id,
        student_name,
        course_name,
        verification_id: verificationId,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Send email if requested
    if (send_email) {
      // Get user email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
      
      if (!userError && userData?.user?.email) {
        const html = getCertificateEarnedEmail(
          student_name, 
          course_name, 
          verificationId, 
          dashboard_url || "https://cyberdefendafrica.com"
        );

        const emailResponse = await resend.emails.send({
          from: "Cyber Defend Africa <onboarding@resend.dev>",
          to: [userData.user.email],
          subject: `🏅 Certificate Earned: ${course_name} - Cyber Defend Africa`,
          html,
        });

        console.log("Certificate email sent:", emailResponse);
      }
    }

    return new Response(JSON.stringify({ success: true, certificate }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error issuing certificate:", error);
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
