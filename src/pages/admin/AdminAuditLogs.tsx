import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, History, User, Shield, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_id: string;
  actor_name: string | null;
  actor_role: string | null;
  details: any;
  created_at: string;
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error) setLogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionColors: Record<string, string> = {
    create: "bg-emerald-500/10 text-emerald-500",
    update: "bg-amber-500/10 text-amber-500",
    delete: "bg-red-500/10 text-red-500",
    approve: "bg-primary/10 text-primary",
    reject: "bg-red-500/10 text-red-500",
    suspend: "bg-orange-500/10 text-orange-500",
    role_change: "bg-violet-500/10 text-violet-500",
  };

  const getActionColor = (action: string) => {
    const key = Object.keys(actionColors).find(k => action.toLowerCase().includes(k));
    return key ? actionColors[key] : "bg-muted text-muted-foreground";
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actor_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">Track all administrative actions</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{logs.length}</p>
                <p className="text-sm text-muted-foreground">Total Events</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.action.toLowerCase().includes("role")).length}
                </p>
                <p className="text-sm text-muted-foreground">Role Changes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.action.toLowerCase().includes("suspend") || l.action.toLowerCase().includes("delete")).length}
                </p>
                <p className="text-sm text-muted-foreground">Critical Actions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {uniqueActions.map(action => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                Activity Log ({filteredLogs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">Loading...</p>
              ) : filteredLogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No logs found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.entity_type}</p>
                            {log.entity_id && (
                              <p className="text-xs text-muted-foreground font-mono">
                                {log.entity_id.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{log.actor_name || "System"}</p>
                              <p className="text-xs text-muted-foreground">{log.actor_role || "—"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.details && (
                            <pre className="text-xs text-muted-foreground overflow-hidden text-ellipsis">
                              {JSON.stringify(log.details, null, 0).slice(0, 50)}...
                            </pre>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
