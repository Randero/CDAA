import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Eye, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useEffect } from "react";
import { generateIDCardHTML, formatDate, getExpiryDate, type IDCardData } from "@/lib/idCardUtils";

export default function StudentIDCard() {
  const { user } = useUserRole();
  const [previewCard, setPreviewCard] = useState<IDCardData | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["student-id-cards", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: enrollData, error: enrollErr } = await supabase
        .from("enrollments")
        .select("*, course:courses(*)")
        .eq("user_id", user.id);
      if (enrollErr) throw enrollErr;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return (enrollData || []).map((e: any) => {
        const expiryDate = getExpiryDate(e.created_at, e.course?.duration);
        const isExpired = expiryDate < new Date();
        return {
          id: e.id,
          studentName: profile?.full_name || "Student",
          email: user?.email || "",
          studentId: `CDAA-${user!.id.slice(0, 8).toUpperCase()}`,
          avatarUrl: profile?.avatar_url,
          country: profile?.country || "N/A",
          courseName: e.course?.title || "Unknown Course",
          enrolledAt: e.created_at,
          expiryDate,
          isExpired,
          duration: e.course?.duration || "N/A",
        };
      });
    },
    enabled: !!user?.id,
  });

  const handleViewPrint = async (card: IDCardData) => {
    const html = await generateIDCardHTML(card);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Student ID Cards</h1>
          <p className="text-muted-foreground mt-1">
            Your auto-generated ID cards based on course enrollment
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : !enrollments?.length ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No ID Cards Available</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enroll in a course to automatically generate your student ID card.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {enrollments.map((card: IDCardData) => (
              <Card key={card.id} className="bg-card border-border overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-[#1a365d] via-[#2563eb] to-[#06b6d4]" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{card.courseName}</h3>
                        <p className="text-xs text-muted-foreground">ID: {card.studentId}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={card.isExpired
                        ? "bg-destructive/10 text-destructive border-destructive/30"
                        : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      }
                    >
                      {card.isExpired ? "Expired" : "Active"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Student</p>
                      <p className="font-medium text-foreground text-xs">{card.studentName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground text-xs">{card.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expires</p>
                      <p className={`font-medium text-xs ${card.isExpired ? "text-destructive" : "text-foreground"}`}>
                        {formatDate(card.expiryDate)}
                      </p>
                    </div>
                  </div>

                  {card.isExpired && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                      <p className="text-xs text-destructive">This ID card has expired. Re-enroll to renew.</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button className="flex-1" variant="outline" size="sm" onClick={() => setPreviewCard(card)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button className="flex-1" variant="outline" size="sm" onClick={() => handleViewPrint(card)}>
                      <Download className="h-4 w-4 mr-2" />
                      View & Print
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ID Card Preview Dialog */}
      <Dialog open={!!previewCard} onOpenChange={() => setPreviewCard(null)}>
        <DialogContent className="max-w-[500px] p-0 overflow-hidden">
          {previewCard && (
            <PreviewContent card={previewCard} onPrint={handleViewPrint} />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function PreviewContent({ card, onPrint }: { card: IDCardData; onPrint: (c: IDCardData) => void }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    generateIDCardHTML(card).then(setHtml);
  }, [card]);

  return (
    <div className="bg-muted p-6">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-display font-bold text-foreground">ID Card Preview</h3>
        <Button size="sm" onClick={() => onPrint(card)} className="gap-2">
          <Download className="h-4 w-4" /> Print
        </Button>
      </div>
      <div
        className="mx-auto overflow-hidden rounded-2xl shadow-xl"
        style={{ width: 420, height: 580, transform: "scale(0.9)", transformOrigin: "top center" }}
      >
        <iframe
          srcDoc={html}
          className="w-full h-full border-0"
          title="ID Card Preview"
        />
      </div>
    </div>
  );
}
