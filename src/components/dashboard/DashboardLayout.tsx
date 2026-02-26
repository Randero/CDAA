import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BookOpen,
  GraduationCap,
  Award,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Home,
  Users,
  PlusCircle,
  ChevronRight,
  ClipboardList,
  FolderOpen,
  Bell,
  MessageSquare,
  Megaphone,
  Lock,
  AlertCircle,
  FileText,
  CreditCard,
} from "lucide-react";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { useUserRole } from "@/hooks/useUserRole";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useEnrollmentCheck } from "@/hooks/useEnrollmentCheck";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import logo from "@/assets/logo.png";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  requiresEnrollment?: boolean;
}

interface DashboardLayoutProps {
  children: ReactNode;
  type: "student" | "instructor";
}

const studentNavItems: NavItem[] = [
  { title: "Dashboard", href: "/student", icon: Home, requiresEnrollment: false },
  { title: "My Courses", href: "/student/courses", icon: BookOpen, requiresEnrollment: false },
  { title: "Quizzes", href: "/student/quizzes", icon: ClipboardList, requiresEnrollment: true },
  { title: "Assignments", href: "/student/assignments", icon: ClipboardList, requiresEnrollment: true },
  { title: "Resources", href: "/student/resources", icon: FolderOpen, requiresEnrollment: true },
  { title: "Announcements", href: "/student/announcements", icon: Bell, requiresEnrollment: true },
  { title: "Complaints", href: "/student/complaints", icon: MessageSquare, requiresEnrollment: true },
  { title: "Certificates", href: "/student/certificates", icon: Award, requiresEnrollment: true },
  { title: "Transcripts", href: "/student/transcripts", icon: FileText, requiresEnrollment: true },
  { title: "ID Card", href: "/student/id-card", icon: CreditCard, requiresEnrollment: true },
  { title: "Learning Paths", href: "/student/paths", icon: GraduationCap, requiresEnrollment: true },
  { title: "Settings", href: "/student/settings", icon: Settings, requiresEnrollment: false },
];

const instructorNavItems: NavItem[] = [
  { title: "Dashboard", href: "/instructor", icon: Home },
  { title: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { title: "Create Course", href: "/instructor/courses/new", icon: PlusCircle },
  { title: "Quizzes", href: "/instructor/quizzes", icon: ClipboardList },
  { title: "Assignments", href: "/instructor/assignments", icon: ClipboardList },
  { title: "Resources", href: "/instructor/resources", icon: FolderOpen },
  { title: "Announcements", href: "/instructor/announcements", icon: Megaphone },
  { title: "Students", href: "/instructor/students", icon: Users },
  { title: "Analytics", href: "/instructor/analytics", icon: BarChart3 },
  { title: "Settings", href: "/instructor/settings", icon: Settings },
];

export function DashboardLayout({ children, type }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserRole();
  const { isEnrolled, isLoading: enrollmentLoading } = useEnrollmentCheck();
  const [mobileOpen, setMobileOpen] = useState(false);

  const baseNavItems = type === "student" ? studentNavItems : instructorNavItems;
  const dashboardTitle = type === "student" ? "Student Dashboard" : "Instructor Dashboard";

  // Filter nav items based on enrollment status for students
  const navItems = type === "student" 
    ? baseNavItems.map(item => ({
        ...item,
        isLocked: item.requiresEnrollment && !isEnrolled,
      }))
    : baseNavItems.map(item => ({ ...item, isLocked: false }));

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="CDA Academy" className="h-10 w-10" />
          <div>
            <span className="font-display font-bold text-lg text-foreground">CDA Academy</span>
            <p className="text-xs text-muted-foreground">{dashboardTitle}</p>
          </div>
        </Link>
      </div>

      {/* Enrollment Warning for Students */}
      {type === "student" && !enrollmentLoading && !isEnrolled && (
        <div className="px-4 pt-4">
          <Alert className="bg-amber-500/10 border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs text-amber-500">
              Enroll in a course to unlock all features
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ScrollArea className="flex-1 px-4 py-6">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isLocked = 'isLocked' in item && item.isLocked;

            if (isLocked) {
              return (
                <div
                  key={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground/50 cursor-not-allowed"
                  title="Enroll in a course to access this feature"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="flex-1">{item.title}</span>
                  <Lock className="h-4 w-4" />
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs text-muted-foreground">Theme</span>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 py-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
              {user?.email}
            </p>
          </div>
        </div>
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <Home className="h-5 w-5" />
            Back to Site
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col">
        <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-16 border-b border-border bg-card">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="CDA Academy" className="h-8 w-8" />
            <span className="font-display font-bold">CDA Academy</span>
          </Link>
          
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <NavContent />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
