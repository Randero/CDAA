import { supabase } from "@/integrations/supabase/client";

interface CourseCompletedPayload {
  email: string;
  name: string;
  courseName: string;
}

interface QuizPassedPayload {
  email: string;
  name: string;
  quizName: string;
  courseName: string;
  score: number;
}

interface CertificateEarnedPayload {
  email: string;
  name: string;
  courseName: string;
  certificateId: string;
}

const getBaseUrl = () => {
  return window.location.origin;
};

export const sendCourseCompletedEmail = async (payload: CourseCompletedPayload) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification-email", {
      body: {
        type: "course-completed",
        email: payload.email,
        name: payload.name,
        courseName: payload.courseName,
        dashboardUrl: getBaseUrl(),
      },
    });

    if (error) {
      console.error("Error sending course completed email:", error);
      return { success: false, error };
    }

    console.log("Course completed email sent:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Failed to send course completed email:", err);
    return { success: false, error: err };
  }
};

export const sendQuizPassedEmail = async (payload: QuizPassedPayload) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification-email", {
      body: {
        type: "quiz-passed",
        email: payload.email,
        name: payload.name,
        quizName: payload.quizName,
        courseName: payload.courseName,
        score: payload.score,
        dashboardUrl: getBaseUrl(),
      },
    });

    if (error) {
      console.error("Error sending quiz passed email:", error);
      return { success: false, error };
    }

    console.log("Quiz passed email sent:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Failed to send quiz passed email:", err);
    return { success: false, error: err };
  }
};

export const sendCertificateEarnedEmail = async (payload: CertificateEarnedPayload) => {
  try {
    const { data, error } = await supabase.functions.invoke("send-notification-email", {
      body: {
        type: "certificate-earned",
        email: payload.email,
        name: payload.name,
        courseName: payload.courseName,
        certificateId: payload.certificateId,
        dashboardUrl: getBaseUrl(),
      },
    });

    if (error) {
      console.error("Error sending certificate earned email:", error);
      return { success: false, error };
    }

    console.log("Certificate earned email sent:", data);
    return { success: true, data };
  } catch (err) {
    console.error("Failed to send certificate earned email:", err);
    return { success: false, error: err };
  }
};
