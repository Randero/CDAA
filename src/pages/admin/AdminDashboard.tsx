import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  DollarSign,
  UserCheck,
  Clock,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

interface DashboardStats {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  unreadMessages: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    unreadMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesRes, profilesRes, enrollmentsRes, messagesRes] = await Promise.all([
          supabase.from("courses").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("enrollments").select("id", { count: "exact", head: true }),
          supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("is_read", false),
        ]);

        setStats({
          totalCourses: coursesRes.count || 0,
          totalUsers: profilesRes.count || 0,
          totalEnrollments: enrollmentsRes.count || 0,
          unreadMessages: messagesRes.count || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "from-primary to-cyan",
      bgColor: "bg-primary/10",
    },
    {
      title: "Registered Users",
      value: stats.totalUsers,
      icon: Users,
      color: "from-emerald-500 to-green-400",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: UserCheck,
      color: "from-violet-500 to-purple-400",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Unread Messages",
      value: stats.unreadMessages,
      icon: MessageSquare,
      color: "from-amber-500 to-orange-400",
      bgColor: "bg-amber-500/10",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to the admin control center</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground mt-1">
                        {loading ? "..." : stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: 'hsl(var(--primary))' }} />
                    </div>
                  </div>
                </CardContent>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <QuickActionButton 
                icon={BookOpen} 
                label="Add New Course" 
                href="/admin/courses" 
              />
              <QuickActionButton 
                icon={MessageSquare} 
                label="View Messages" 
                href="/admin/messages" 
                badge={stats.unreadMessages > 0 ? stats.unreadMessages : undefined}
              />
              <QuickActionButton 
                icon={Users} 
                label="Manage Users" 
                href="/admin/users" 
              />
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5 text-primary" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusItem label="Database" status="operational" />
              <StatusItem label="Authentication" status="operational" />
              <StatusItem label="Storage" status="operational" />
              <StatusItem label="Edge Functions" status="operational" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

function QuickActionButton({ 
  icon: Icon, 
  label, 
  href,
  badge 
}: { 
  icon: React.ElementType; 
  label: string; 
  href: string;
  badge?: number;
}) {
  return (
    <a 
      href={href}
      className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      {badge !== undefined && (
        <span className="px-2 py-1 text-xs font-bold rounded-full bg-primary text-primary-foreground">
          {badge}
        </span>
      )}
    </a>
  );
}

function StatusItem({ label, status }: { label: string; status: "operational" | "degraded" | "down" }) {
  const statusColors = {
    operational: "bg-emerald-500",
    degraded: "bg-amber-500",
    down: "bg-red-500",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span className="text-sm capitalize text-foreground">{status}</span>
      </div>
    </div>
  );
}
