import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { request_id } = await req.json();
    if (!request_id) {
      return new Response(JSON.stringify({ error: "request_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the transcript request
    const { data: request, error: reqError } = await supabase
      .from("transcript_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (reqError || !request) {
      return new Response(JSON.stringify({ error: "Request not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Allow access if admin or the student themselves
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin && user.id !== request.student_id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get student profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", request.student_id)
      .single();

    // Get student email from auth
    const { data: { user: studentUser } } = await supabase.auth.admin.getUserById(request.student_id);

    // Get enrollments with courses
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`*, course:courses(*)`)
      .eq("user_id", request.student_id);

    // Get quiz attempts
    const { data: quizAttempts } = await supabase
      .from("quiz_attempts")
      .select(`*, quiz:quizzes(title, course_id)`)
      .eq("student_id", request.student_id)
      .not("completed_at", "is", null);

    // Get certificates
    const { data: certificates } = await supabase
      .from("certificates")
      .select("*")
      .eq("user_id", request.student_id)
      .is("revoked_at", null);

    // Get academy settings
    const { data: settings } = await supabase
      .from("platform_settings")
      .select("key, value");

    const academyName = settings?.find((s: any) => s.key === "academy_name")?.value || "Cyber Defend Academy Africa";
    const academyShort = settings?.find((s: any) => s.key === "academy_short")?.value || "CDAA";
    const logoUrl = "https://jasebalftkngpbcnonxr.supabase.co/storage/v1/object/public/academy-assets/logo.png";

    const studentName = profile?.full_name || "Student";
    const studentEmail = studentUser?.email || "N/A";
    const transcriptId = `TX-${new Date().getFullYear()}-${request.id.slice(0, 8).toUpperCase()}`;
    const issueDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const enrollmentDate = profile?.created_at
      ? new Date(profile.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : "N/A";

    const totalCourses = enrollments?.length || 0;
    const completedCourses = enrollments?.filter((e: any) => e.completed_at).length || 0;
    const avgProgress = totalCourses > 0
      ? Math.round((enrollments || []).reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / totalCourses)
      : 0;

    const courseResults = (enrollments || []).map((enrollment: any, idx: number) => {
      const course = enrollment.course;
      const courseQuizzes = (quizAttempts || []).filter(
        (qa: any) => qa.quiz?.course_id === course?.id
      );
      const bestScore = courseQuizzes.length > 0
        ? Math.max(...courseQuizzes.map((qa: any) => qa.score || 0))
        : null;

      let skillLevel = "Beginner";
      let skillPoints = 1;
      if (bestScore !== null) {
        if (bestScore >= 90) { skillLevel = "Expert"; skillPoints = 5; }
        else if (bestScore >= 80) { skillLevel = "Advanced"; skillPoints = 4; }
        else if (bestScore >= 70) { skillLevel = "Proficient"; skillPoints = 3; }
        else if (bestScore >= 60) { skillLevel = "Intermediate"; skillPoints = 2; }
      }

      const hasCert = certificates?.some((c: any) => c.course_id === course?.id);

      return {
        sn: idx + 1,
        code: `CS-${(course?.slug || "000").slice(0, 4).toUpperCase()}`,
        title: course?.title || "Unknown Course",
        level: course?.level || "beginner",
        score: bestScore !== null ? Math.round(bestScore) : null,
        skillLevel,
        skillPoints,
        progress: enrollment.progress || 0,
        completed: !!enrollment.completed_at,
        completedAt: enrollment.completed_at,
        hasCert,
        duration: course?.duration || "N/A",
        category: course?.category || "N/A",
      };
    });

    // Calculate SPA (Skill Point Average)
    const totalSkillPoints = courseResults.reduce((sum: number, c: any) => sum + c.skillPoints, 0);
    const spa = totalCourses > 0 ? (totalSkillPoints / totalCourses).toFixed(2) : "0.00";

    let grade = "C";
    let gradeLabel = "Pass";
    const spaNum = parseFloat(spa);
    if (spaNum >= 4.5) { grade = "A+"; gradeLabel = "First Class with Distinction"; }
    else if (spaNum >= 4.0) { grade = "A"; gradeLabel = "First Class"; }
    else if (spaNum >= 3.5) { grade = "B+"; gradeLabel = "Second Division (Upper)"; }
    else if (spaNum >= 3.0) { grade = "B"; gradeLabel = "Second Division (Lower)"; }
    else if (spaNum >= 2.5) { grade = "C+"; gradeLabel = "Third Division"; }
    else if (spaNum >= 2.0) { grade = "C"; gradeLabel = "Pass"; }

    const recommendation = spaNum >= 3.5
      ? "Proficient. Suitable for certification and immediate workplace integration."
      : spaNum >= 2.5
      ? "Competent. Recommended for further training to strengthen key skills."
      : "Developing. Additional coursework recommended before certification.";

    const html = generateTranscriptHTML({
      academyName: typeof academyName === "string" ? academyName : "Cyber Defend Academy Africa",
      academyShort: typeof academyShort === "string" ? academyShort : "CDAA",
      logoUrl,
      studentName,
      studentEmail,
      country: profile?.country || "N/A",
      enrollmentDate,
      transcriptId,
      issueDate,
      totalCourses,
      completedCourses,
      avgProgress,
      courseResults,
      certificates: certificates || [],
      profileAvatar: profile?.avatar_url,
      spa,
      grade,
      gradeLabel,
      recommendation,
    });

    return new Response(JSON.stringify({ success: true, html, transcript_id: transcriptId, student_name: studentName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating transcript:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateTranscriptHTML(data: {
  academyName: string;
  academyShort: string;
  logoUrl: string;
  studentName: string;
  studentEmail: string;
  country: string;
  enrollmentDate: string;
  transcriptId: string;
  issueDate: string;
  totalCourses: number;
  completedCourses: number;
  avgProgress: number;
  courseResults: any[];
  certificates: any[];
  profileAvatar?: string | null;
  spa: string;
  grade: string;
  gradeLabel: string;
  recommendation: string;
}) {
  const courseRows = data.courseResults.map((c: any) => `
    <tr>
      <td style="padding:10px 14px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">${c.sn}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
        <div style="font-size:13px;font-weight:600;color:#0f172a;">${c.title}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${c.code} • ${c.category}</div>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
        <span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:${
          c.level === "advanced" ? "#fef2f2;color:#dc2626" :
          c.level === "intermediate" ? "#fffbeb;color:#d97706" :
          "#f0fdf4;color:#16a34a"
        };">${c.level}</span>
      </td>
      <td style="padding:10px 14px;font-size:13px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;">${c.score !== null ? c.score + "%" : "—"}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;">
        <span style="padding:3px 10px;border-radius:12px;font-size:11px;font-weight:600;background:${
          c.skillLevel === "Expert" ? "#dcfce7;color:#16a34a" :
          c.skillLevel === "Advanced" ? "#dbeafe;color:#2563eb" :
          c.skillLevel === "Proficient" ? "#e0f2fe;color:#0284c7" :
          c.skillLevel === "Intermediate" ? "#fef3c7;color:#d97706" :
          "#fee2e2;color:#dc2626"
        };">${c.skillLevel}</span>
      </td>
      <td style="padding:10px 14px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;text-align:center;">${c.skillPoints}</td>
      <td style="padding:10px 14px;font-size:13px;border-bottom:1px solid #e2e8f0;color:${c.completed ? "#16a34a" : "#d97706"};font-weight:600;">${c.completed ? "✓ Completed" : c.progress + "%"}</td>
    </tr>`).join("");

  const certRows = data.certificates.length > 0 ? data.certificates.map((cert: any, i: number) => `
    <tr>
      <td style="padding:8px 14px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">${i + 1}</td>
      <td style="padding:8px 14px;font-size:13px;font-weight:600;color:#0f172a;border-bottom:1px solid #e2e8f0;">${cert.course_name}</td>
      <td style="padding:8px 14px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">${cert.verification_id}</td>
      <td style="padding:8px 14px;font-size:13px;color:#475569;border-bottom:1px solid #e2e8f0;">${new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
    </tr>`).join("") : `<tr><td colspan="4" style="padding:16px;text-align:center;color:#94a3b8;font-size:13px;">No certificates issued yet</td></tr>`;

  // Key strengths based on results
  const strengths: string[] = [];
  const expertCount = data.courseResults.filter((c: any) => c.skillLevel === "Expert" || c.skillLevel === "Advanced").length;
  if (expertCount > 0) strengths.push("Strong technical proficiency in specialized domains");
  if (data.completedCourses > 0) strengths.push("Demonstrated commitment to course completion");
  if (data.certificates.length > 0) strengths.push("Achieved certified competency levels");
  if (data.avgProgress >= 70) strengths.push("Consistent skill application across training modules");
  if (strengths.length === 0) strengths.push("Developing foundation in cybersecurity disciplines");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Training Transcript — ${data.studentName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#fff;color:#0f172a;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  .page{max-width:920px;margin:0 auto;padding:0;}
  @media print{.page{max-width:100%;}}
</style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#0c1929 0%,#1e3a5f 50%,#0c4a6e 100%);color:#fff;padding:36px 44px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px;">
        <div style="width:64px;height:64px;border-radius:12px;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center;">
          <img src="${data.logoUrl}" style="width:60px;height:60px;object-fit:contain;" alt="Academy Logo" />
        </div>
        <div>
          <h1 style="font-size:18px;font-weight:800;letter-spacing:0.5px;line-height:1.3;">${data.academyName.toUpperCase()}</h1>
          <p style="font-size:11px;opacity:0.7;letter-spacing:1px;margin-top:2px;">DIRECTORATE OF STUDENTS EVALUATION DIVISION</p>
        </div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:12px;padding:16px 24px;">
        <h2 style="font-size:20px;font-weight:800;letter-spacing:1.5px;">OFFICIAL TRANSCRIPT</h2>
        <p style="font-size:11px;opacity:0.7;margin-top:6px;">ID: ${data.transcriptId}</p>
        <p style="font-size:11px;opacity:0.7;">Issued: ${data.issueDate}</p>
      </div>
    </div>
  </div>

  <!-- STUDENT INFO -->
  <div style="padding:28px 44px;display:flex;gap:28px;align-items:center;border-bottom:3px solid #06b6d4;background:#f8fafc;">
    <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#1e3a5f,#06b6d4);display:flex;align-items:center;justify-content:center;overflow:hidden;border:3px solid #06b6d4;flex-shrink:0;">
      ${data.profileAvatar
        ? `<img src="${data.profileAvatar}" style="width:100%;height:100%;object-fit:cover;" />`
        : `<span style="font-size:28px;font-weight:800;color:#fff;">${data.studentName.charAt(0)}</span>`
      }
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px 36px;flex:1;">
      <div><span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Full Name</span><p style="font-size:14px;font-weight:700;color:#0f172a;">${data.studentName}</p></div>
      <div><span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Email</span><p style="font-size:13px;color:#475569;">${data.studentEmail}</p></div>
      <div><span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Country</span><p style="font-size:13px;color:#475569;">${data.country}</p></div>
      <div><span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Department</span><p style="font-size:13px;color:#475569;">Cybersecurity & Digital Forensics</p></div>
      <div><span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Enrollment Date</span><p style="font-size:13px;color:#475569;">${data.enrollmentDate}</p></div>
      <div><span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;">Certificates Earned</span><p style="font-size:13px;color:#475569;">${data.certificates.length}</p></div>
    </div>
  </div>

  <!-- EVALUATION SUMMARY -->
  <div style="padding:28px 44px;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:12px 20px;border-radius:8px;font-size:16px;font-weight:800;letter-spacing:0.5px;margin-bottom:20px;">
      ASSESSORS TEAM EVALUATION
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;">
      <h3 style="font-size:15px;font-weight:700;margin-bottom:12px;color:#0f172a;">Training Evaluation Summary</h3>
      <p style="font-size:13px;color:#475569;line-height:1.8;">${data.recommendation}</p>
      <h4 style="font-size:13px;font-weight:700;margin-top:16px;margin-bottom:8px;color:#0f172a;">Key Strengths:</h4>
      <ul style="list-style:none;padding:0;">
        ${strengths.map(s => `<li style="font-size:13px;color:#475569;padding:3px 0;">• ${s}</li>`).join("")}
      </ul>
    </div>
  </div>

  <!-- SKILLS SUMMARY -->
  <div style="padding:0 44px 28px;">
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:0.5px;">Skill Point Average</div>
        <div style="font-size:32px;font-weight:800;color:#0f172a;margin:6px 0;">${data.spa}</div>
        <div style="font-size:11px;color:#94a3b8;">out of 5.00</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:0.5px;">Courses Completed</div>
        <div style="font-size:32px;font-weight:800;color:#0f172a;margin:6px 0;">${data.completedCourses}/${data.totalCourses}</div>
        <div style="font-size:11px;color:#94a3b8;">units completed</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:0.5px;">Training Grade</div>
        <div style="font-size:32px;font-weight:800;color:#0f172a;margin:6px 0;">${data.grade}</div>
        <div style="font-size:11px;color:#94a3b8;">${data.gradeLabel}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;">
        <div style="font-size:10px;font-weight:700;color:#0ea5e9;text-transform:uppercase;letter-spacing:0.5px;">Average Progress</div>
        <div style="font-size:32px;font-weight:800;color:#0f172a;margin:6px 0;">${data.avgProgress}%</div>
        <div style="height:4px;background:#e2e8f0;border-radius:2px;margin-top:6px;"><div style="height:4px;background:#06b6d4;border-radius:2px;width:${data.avgProgress}%;"></div></div>
      </div>
    </div>
  </div>

  <!-- COURSE BREAKDOWN TABLE -->
  <div style="padding:0 44px 28px;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:12px 20px;border-radius:8px;font-size:16px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
      COURSE PERFORMANCE BREAKDOWN
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#0f172a;">
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;letter-spacing:0.5px;">#</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;letter-spacing:0.5px;">COURSE</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;letter-spacing:0.5px;">LEVEL</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;letter-spacing:0.5px;">SCORE</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;letter-spacing:0.5px;">SKILL</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:center;font-weight:700;letter-spacing:0.5px;">SP</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;letter-spacing:0.5px;">STATUS</th>
        </tr>
      </thead>
      <tbody>
        ${courseRows || '<tr><td colspan="7" style="padding:24px;text-align:center;color:#94a3b8;font-size:13px;">No courses enrolled</td></tr>'}
      </tbody>
    </table>
  </div>

  <!-- CERTIFICATES -->
  <div style="padding:0 44px 28px;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:12px 20px;border-radius:8px;font-size:16px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
      CERTIFICATES ISSUED
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#0f172a;">
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;">#</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;">COURSE</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;">VERIFICATION ID</th>
          <th style="padding:10px 14px;font-size:11px;color:#fff;text-align:left;font-weight:700;">ISSUED DATE</th>
        </tr>
      </thead>
      <tbody>${certRows}</tbody>
    </table>
  </div>

  <!-- OVERALL PERFORMANCE -->
  <div style="padding:0 44px 28px;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#2563eb);color:#fff;padding:12px 20px;border-radius:8px;font-size:16px;font-weight:800;letter-spacing:0.5px;margin-bottom:16px;">
      OVERALL PERFORMANCE
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;text-align:center;">
        <div style="background:#0f172a;color:#fff;padding:10px;font-size:11px;font-weight:700;letter-spacing:0.5px;">SKILL POINT AVERAGE (SPA)</div>
        <div style="padding:20px;">
          <div style="font-size:40px;font-weight:800;color:#0f172a;">${data.spa}</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Cumulative Average</div>
        </div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#0f172a;color:#fff;padding:10px;font-size:11px;font-weight:700;letter-spacing:0.5px;text-align:center;">SKILL UNITS SUMMARY</div>
        <div style="padding:16px 20px;font-size:13px;color:#475569;line-height:2;">
          <div>Total Skill Units: <strong style="color:#0f172a;">${data.totalCourses}</strong></div>
          <div>Units Completed: <strong style="color:#0f172a;">${data.completedCourses}</strong></div>
          <div>In Progress: <strong style="color:#0f172a;">${data.totalCourses - data.completedCourses}</strong></div>
        </div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;text-align:center;">
        <div style="background:#0f172a;color:#fff;padding:10px;font-size:11px;font-weight:700;letter-spacing:0.5px;">TRAINING GRADE</div>
        <div style="padding:20px;">
          <div style="font-size:40px;font-weight:800;color:#0f172a;">${data.grade}</div>
          <div style="display:inline-block;padding:4px 14px;background:#2563eb;color:#fff;border-radius:20px;font-size:11px;font-weight:700;margin-top:8px;">${data.gradeLabel}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- FOOTER / SIGNATURES -->
  <div style="padding:28px 44px;border-top:2px dashed #cbd5e1;display:flex;justify-content:space-around;align-items:flex-end;text-align:center;">
    <div>
      <div style="width:160px;border-top:1px solid #0f172a;margin:0 auto 6px;"></div>
      <div style="font-size:13px;font-weight:700;color:#0f172a;">Registrar</div>
      <div style="font-size:11px;color:#64748b;">Academic Records</div>
    </div>
    <div>
      <div style="width:160px;border-top:1px solid #0f172a;margin:0 auto 6px;"></div>
      <div style="font-size:13px;font-weight:700;color:#0f172a;">Director of Evaluation</div>
      <div style="font-size:11px;color:#64748b;">Assessment Division</div>
    </div>
    <div>
      <p style="font-size:12px;font-weight:700;color:#0f172a;">Date Issued</p>
      <p style="font-size:13px;color:#475569;">${data.issueDate}</p>
      <p style="font-size:10px;color:#94a3b8;margin-top:4px;">Official Transcript • ${data.academyShort}</p>
    </div>
  </div>

  <!-- WATERMARK -->
  <div style="text-align:center;padding:16px;background:#f8fafc;border-top:1px solid #e2e8f0;">
    <p style="font-size:10px;color:#94a3b8;">This is an official transcript generated by ${data.academyName}. Transcript ID: ${data.transcriptId}</p>
    <p style="font-size:10px;color:#94a3b8;">Verify authenticity at the academy's official portal. Unauthorized alteration of this document is prohibited.</p>
  </div>

</div>
</body>
</html>`;
}
