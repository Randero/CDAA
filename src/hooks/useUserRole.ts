import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRoleResult {
  user: User | null;
  roles: AppRole[];
  isLoading: boolean;
  hasRole: (role: AppRole) => boolean;
  isAdmin: boolean;
  isInstructor: boolean;
  isStudent: boolean;
  isModerator: boolean;
}

export function useUserRole(): UserRoleResult {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId);

        if (error) {
          console.error("Error fetching user roles:", error);
          setRoles([]);
        } else {
          setRoles(data?.map((r) => r.role) || []);
        }
      } catch (err) {
        console.error("Failed to fetch user roles:", err);
        setRoles([]);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchRoles(session.user.id);
      } else {
        setRoles([]);
        setIsLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchRoles(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const hasRole = (role: AppRole) => roles.includes(role);

  return {
    user,
    roles,
    isLoading,
    hasRole,
    isAdmin: hasRole("admin"),
    isInstructor: hasRole("instructor"),
    isStudent: hasRole("student") || hasRole("user"),
    isModerator: hasRole("moderator"),
  };
}
