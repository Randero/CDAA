import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreditCard, Search, Eye, Ban, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { getExpiryDate, formatDate, generateIDCardHTML, type IDCardData } from "@/lib/idCardUtils";

export default function AdminIDCards() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["admin-id-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("enrollments")
        .select("*, course:courses(title, duration), profile:profiles!enrollments_user_id_fkey(full_name, avatar_url, country)")
        .order("created_at", { ascending: false });

      if (error) {
        // Fallback: fetch without the problematic join
        const { data: enrollData, error: enrollErr } = await supabase
          .from("enrollments")
          .select("*, course:courses(title, duration)")
          .order("created_at", { ascending: false });
        if (enrollErr) throw enrollErr;

        // Fetch all profiles separately
        const userIds = [...new Set((enrollData || []).map((e: any) => e.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url, country")
          .in("user_id", userIds);

        const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

        return (enrollData || []).map((e: any) => {
          const profile = profileMap.get(e.user_id);
          const expiryDate = getExpiryDate(e.created_at, e.course?.duration);
          const isExpired = expiryDate < new Date();
          return {
            id: e.id,
            userId: e.user_id,
            studentName: profile?.full_name || "Unknown",
            email: "",
            studentId: `CDAA-${e.user_id.slice(0, 8).toUpperCase()}`,
            avatarUrl: profile?.avatar_url,
            country: profile?.country || "N/A",
            courseName: e.course?.title || "Unknown",
            enrolledAt: e.created_at,
            expiryDate,
            isExpired,
            duration: e.course?.duration || "N/A",
          };
        });
      }

      return (data || []).map((e: any) => {
        const expiryDate = getExpiryDate(e.created_at, e.course?.duration);
        const isExpired = expiryDate < new Date();
        return {
          id: e.id,
          userId: e.user_id,
          studentName: (e.profile as any)?.full_name || "Unknown",
          email: "",
          studentId: `CDAA-${e.user_id.slice(0, 8).toUpperCase()}`,
          avatarUrl: (e.profile as any)?.avatar_url,
          country: (e.profile as any)?.country || "N/A",
          courseName: e.course?.title || "Unknown",
          enrolledAt: e.created_at,
          expiryDate,
          isExpired,
          duration: e.course?.duration || "N/A",
        };
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", enrollmentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-id-cards"] });
      toast.success("Student ID card revoked (enrollment removed)");
    },
    onError: () => {
      toast.error("Failed to revoke ID card");
    },
  });

  const handleViewCard = async (card: any) => {
    const html = await generateIDCardHTML(card as IDCardData);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const filtered = (enrollments || []).filter((e: any) =>
    e.studentName.toLowerCase().includes(search.toLowerCase()) ||
    e.studentId.toLowerCase().includes(search.toLowerCase()) ||
    e.courseName.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = (enrollments || []).filter((e: any) => !e.isExpired).length;
  const expiredCount = (enrollments || []).filter((e: any) => e.isExpired).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Student ID Cards</h1>
          <p className="text-muted-foreground mt-1">Manage and revoke student identification cards</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10"><Users className="h-5 w-5 text-primary" /></div>
              <div><p className="text-2xl font-bold text-foreground">{enrollments?.length || 0}</p><p className="text-xs text-muted-foreground">Total ID Cards</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10"><CreditCard className="h-5 w-5 text-emerald-500" /></div>
              <div><p className="text-2xl font-bold text-foreground">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10"><Ban className="h-5 w-5 text-destructive" /></div>
              <div><p className="text-2xl font-bold text-foreground">{expiredCount}</p><p className="text-xs text-muted-foreground">Expired</p></div>
            </CardContent>
          </Card>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No ID cards found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((card: any) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-medium text-foreground">{card.studentName}</TableCell>
                        <TableCell className="font-mono text-xs">{card.studentId}</TableCell>
                        <TableCell className="text-sm max-w-[200px] truncate">{card.courseName}</TableCell>
                        <TableCell className="text-sm">{formatDate(new Date(card.enrolledAt))}</TableCell>
                        <TableCell className="text-sm">{formatDate(card.expiryDate)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={card.isExpired
                            ? "bg-destructive/10 text-destructive border-destructive/30"
                            : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          }>
                            {card.isExpired ? "Expired" : "Active"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleViewCard(card)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  <Ban className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Revoke ID Card</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will revoke {card.studentName}'s ID card for "{card.courseName}" by removing their enrollment. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={() => revokeMutation.mutate(card.id)}
                                  >
                                    Revoke
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
