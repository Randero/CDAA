import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  type: "course-completed" | "quiz-passed" | "certificate-earned";
  email: string;
  name: string;
  courseName?: string;
  quizName?: string;
  score?: number;
  certificateId?: string;
  dashboardUrl?: string;
}

// Email template styles - matching the auth email theme
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0a0a0f; }
  .container { max-width: 600px; margin: 0 auto; background-color: #12121a; border-radius: 12px; overflow: hidden; border: 1px solid #1e1e2e; }
  .header { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); padding: 30px 40px; text-align: center; }
  .header-quiz { background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%); }
  .header-certificate { background: linear-gradient(135deg, #f59e0b 0%, #10b981 100%); }
  .logo { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
  .content { padding: 40px; }
  .icon { font-size: 64px; text-align: center; margin-bottom: 16px; }
  h1 { color: #ffffff; font-size: 28px; font-weight: bold; margin: 0 0 24px 0; text-align: center; }
  p { color: #e0e0e0; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0; }
  .muted { color: #888888; font-size: 14px; text-align: center; }
  .btn-container { text-align: center; margin: 32px 0; }
  .btn { display: inline-block; background-color: #06b6d4; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.4); }
  .btn-success { background-color: #10b981; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); }
  .btn-gold { background-color: #f59e0b; color: #000000; box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4); }
  .highlight-box { background-color: #1e1e2e; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #2e2e3e; text-align: center; }
  .highlight-title { color: #06b6d4; font-size: 14px; font-weight: bold; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px; }
  .highlight-value { color: #ffffff; font-size: 24px; font-weight: bold; margin: 0; }
  .score-badge { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 50px; color: #ffffff; font-size: 32px; font-weight: bold; padding: 16px 32px; margin: 16px 0; }
  .achievement-box { background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%); border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid rgba(245, 158, 11, 0.3); text-align: center; }
  .certificate-id { color: #f59e0b; font-size: 12px; font-family: monospace; margin: 8px 0 0 0; }
  .stats { display: flex; justify-content: center; gap: 24px; margin: 24px 0; }
  .stat-item { text-align: center; }
  .stat-value { color: #06b6d4; font-size: 24px; font-weight: bold; margin: 0; }
  .stat-label { color: #888888; font-size: 12px; margin: 4px 0 0 0; }
  hr { border: none; border-top: 1px solid #1e1e2e; margin: 0; }
  .footer { padding: 24px 40px; text-align: center; }
  .footer-text { color: #888888; font-size: 14px; margin: 0 0 12px 0; }
  .footer-links { color: #666666; font-size: 12px; margin: 0 0 12px 0; }
  .footer-links a { color: #06b6d4; text-decoration: none; }
  .copyright { color: #555555; font-size: 11px; margin: 0; }
`;

function getCourseCompletedEmail(name: string, courseName: string, dashboardUrl: string): string {
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
          <div class="icon">🎓</div>
          <h1>Course Completed!</h1>
          <p>Congratulations, <strong>${name}</strong>!</p>
          <p>You have successfully completed the course:</p>
          <div class="highlight-box">
            <p class="highlight-title">Course</p>
            <p class="highlight-value">${courseName}</p>
          </div>
          <p>This is a fantastic achievement! Your dedication to learning cybersecurity skills is truly commendable. Keep up the great work!</p>
          <div class="btn-container">
            <a href="${dashboardUrl}" class="btn btn-success">View Your Progress</a>
          </div>
          <p class="muted">Continue your learning journey by enrolling in more courses or checking your earned certificates.</p>
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

function getQuizPassedEmail(name: string, quizName: string, score: number, courseName: string, dashboardUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header header-quiz">
          <h2 class="logo">🛡️ Cyber Defend Africa</h2>
        </div>
        <div class="content">
          <div class="icon">🏆</div>
          <h1>Quiz Passed!</h1>
          <p>Outstanding work, <strong>${name}</strong>!</p>
          <p>You have successfully passed the quiz:</p>
          <div class="highlight-box">
            <p class="highlight-title">Quiz</p>
            <p class="highlight-value">${quizName}</p>
            <p class="muted" style="margin-top: 8px;">From: ${courseName}</p>
          </div>
          <div style="text-align: center;">
            <p class="muted" style="margin-bottom: 8px;">Your Score</p>
            <div class="score-badge">${score.toFixed(0)}%</div>
          </div>
          <p>Your knowledge of cybersecurity concepts is growing stronger! Keep testing yourself to reinforce your learning.</p>
          <div class="btn-container">
            <a href="${dashboardUrl}" class="btn">View All Quizzes</a>
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

function getCertificateEarnedEmail(name: string, courseName: string, certificateId: string, dashboardUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><style>${baseStyles}</style></head>
    <body>
      <div class="container">
        <div class="header header-certificate">
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
            <a href="${dashboardUrl}" class="btn btn-gold">View Your Certificate</a>
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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      type, 
      email, 
      name, 
      courseName, 
      quizName, 
      score, 
      certificateId, 
      dashboardUrl 
    }: NotificationEmailRequest = await req.json();

    console.log(`Sending ${type} notification email to ${email}`);

    let html: string;
    let subject: string;
    const baseUrl = dashboardUrl || "https://cyberdefendafrica.com";

    switch (type) {
      case "course-completed":
        subject = `🎓 Course Completed: ${courseName} - Cyber Defend Africa`;
        html = getCourseCompletedEmail(name, courseName || "Course", `${baseUrl}/student/courses`);
        break;

      case "quiz-passed":
        subject = `🏆 Quiz Passed: ${quizName} - Cyber Defend Africa`;
        html = getQuizPassedEmail(name, quizName || "Quiz", score || 0, courseName || "Course", `${baseUrl}/student/quizzes`);
        break;

      case "certificate-earned":
        subject = `🏅 Certificate Earned: ${courseName} - Cyber Defend Africa`;
        html = getCertificateEarnedEmail(name, courseName || "Course", certificateId || "N/A", `${baseUrl}/student/certificates`);
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emailResponse = await resend.emails.send({
      from: "Cyber Defend Africa <onboarding@resend.dev>",
      to: [email],
      subject,
      html,
    });

    console.log("Notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending notification email:", error);
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
