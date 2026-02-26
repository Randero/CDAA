import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

interface AdminProtectedRouteProps {
  children: ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAdmin, isLoading } = useAdminCheck();
  
  // Enable session timeout for admin routes
  useSessionTimeout();

  if (isLoading) {
    return <LoadingScreen message="Verifying admin access..." />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-destructive" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel. 
              This area is restricted to administrators only.
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

  return <>{children}</>;
}
