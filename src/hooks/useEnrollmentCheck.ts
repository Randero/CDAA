import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "./useUserRole";

interface EnrollmentCheckResult {
  isEnrolled: boolean;
  enrollmentCount: number;
  isLoading: boolean;
}

export function useEnrollmentCheck(): EnrollmentCheckResult {
  const { user, isLoading: userLoading } = useUserRole();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkEnrollment() {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { count, error } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);

        if (error) throw error;

        setEnrollmentCount(count || 0);
        setIsEnrolled((count || 0) > 0);
      } catch (error) {
        console.error("Error checking enrollment:", error);
        setIsEnrolled(false);
      } finally {
        setIsLoading(false);
      }
    }

    if (!userLoading) {
      checkEnrollment();
    }
  }, [user?.id, userLoading]);

  return { isEnrolled, enrollmentCount, isLoading: isLoading || userLoading };
}
