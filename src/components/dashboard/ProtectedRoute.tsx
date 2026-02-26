import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { useProfileSetup } from "@/hooks/useProfileSetup";
import { ProfileSetupModal } from "@/components/profile/ProfileSetupModal";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

type AppRole = Database["public"]["Enums"]["app_role"];

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  allowedRoles,
  redirectTo = "/auth"
}: ProtectedRouteProps) {
  const { user, roles, isLoading } = useUserRole();
  const { needsSetup, userId, isChecking, completeSetup } = useProfileSetup();
  
  // Enable session timeout for all protected routes
  useSessionTimeout();

  if (isLoading || isChecking) {
    return <LoadingScreen message="Verifying access..." />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  const hasAccess = allowedRoles.some(role => roles.includes(role));

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access this area.
            </p>
          </div>
          <Link to="/">
            <Button className="bg-gradient-to-r from-primary to-cyan">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Profile Setup Modal for new users */}
      {needsSetup && userId && (
        <ProfileSetupModal
          isOpen={needsSetup}
          onComplete={completeSetup}
          userId={userId}
        />
      )}
      {children}
    </>
  );
}
