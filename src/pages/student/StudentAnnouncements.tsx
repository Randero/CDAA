import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Bell, Pin, ArrowLeft, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function StudentAnnouncements() {
  const navigate = useNavigate();

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["student-announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*, courses(title)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground">Stay updated with the latest news from your instructors</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : announcements?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No announcements yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements?.map((announcement: any) => (
              <Card key={announcement.id} className={announcement.is_pinned ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${announcement.is_pinned ? "bg-primary/10" : "bg-muted"}`}>
                        {announcement.is_pinned ? (
                          <Pin className="h-5 w-5 text-primary" />
                        ) : (
                          <Megaphone className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {announcement.title}
                          {announcement.is_pinned && <Badge variant="secondary">Pinned</Badge>}
                        </CardTitle>
                        <CardDescription>
                          {announcement.courses?.title} • {format(new Date(announcement.created_at), "MMM dd, yyyy 'at' HH:mm")}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{announcement.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
