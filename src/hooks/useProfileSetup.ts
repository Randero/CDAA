import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProfileSetup = () => {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkProfileSetup = async () => {
      setIsChecking(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsChecking(false);
        return;
      }

      setUserId(user.id);

      // Check if profile is incomplete (missing bio, country, or avatar)
      const { data: profile } = await supabase
        .from("profiles")
        .select("bio, country, avatar_url")
        .eq("user_id", user.id)
        .single();

      // Consider profile incomplete if all optional fields are empty
      const isIncomplete = profile && !profile.bio && !profile.country && !profile.avatar_url;
      
      // Check localStorage to see if user has dismissed setup
      const setupDismissed = localStorage.getItem(`profile_setup_${user.id}`);
      
      setNeedsSetup(isIncomplete && !setupDismissed);
      setIsChecking(false);
    };

    checkProfileSetup();
  }, []);

  const completeSetup = () => {
    if (userId) {
      localStorage.setItem(`profile_setup_${userId}`, "completed");
    }
    setNeedsSetup(false);
  };

  return { needsSetup, userId, isChecking, completeSetup };
};
