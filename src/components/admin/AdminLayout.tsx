import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  MessageSquare, 
  Star,
  Settings,
  LogOut,
  Shield,
  ChevronLeft,
  FolderOpen,
  Route,
  Award,
  FileText,
  ClipboardList,
  Wrench,
  CreditCard,
  Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface AdminLayoutProps {
  children: ReactNode;
}

import { MessageSquareWarning } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: BookOpen, label: "Courses", path: "/admin/courses" },
  { icon: FolderOpen, label: "Categories", path: "/admin/categories" },
  { icon: Route, label: "Learning Paths", path: "/admin/learning-paths" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Award, label: "Certificates", path: "/admin/certificates" },
  { icon: FileText, label: "Blog Posts", path: "/admin/blog" },
  { icon: MessageSquare, label: "Messages", path: "/admin/messages" },
  { icon: MessageSquareWarning, label: "Complaints", path: "/admin/complaints" },
  { icon: Star, label: "Testimonials", path: "/admin/testimonials" },
  { icon: FileText, label: "Transcripts", path: "/admin/transcripts" },
  { icon: ClipboardList, label: "Audit Logs", path: "/admin/audit-logs" },
  { icon: CreditCard, label: "Payment Settings", path: "/admin/payment-settings" },
  { icon: Ticket, label: "Coupons", path: "/admin/coupons" },
  { icon: CreditCard, label: "ID Cards", path: "/admin/id-cards" },
  { icon: Wrench, label: "Settings", path: "/admin/platform-settings" },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Cyber Defend Africa</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
              Back to Site
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
