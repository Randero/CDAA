import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Download, FileText, Search, ArrowLeft, File, Image, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentResources() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data: resources, isLoading } = useQuery({
    queryKey: ["student-resources"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resources")
        .select("*, courses(title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filteredResources = resources?.filter((r: any) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.courses?.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes("image")) return <Image className="h-8 w-8 text-primary" />;
    if (fileType?.includes("video")) return <Video className="h-8 w-8 text-primary" />;
    if (fileType?.includes("pdf")) return <FileText className="h-8 w-8 text-destructive" />;
    return <File className="h-8 w-8 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <DashboardLayout type="student">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-display font-bold text-foreground">Learning Resources</h1>
            <p className="text-muted-foreground">Download course materials and resources</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredResources?.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No resources available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources?.map((resource: any) => (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {getFileIcon(resource.file_type)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{resource.title}</CardTitle>
                      <CardDescription className="truncate">{resource.courses?.title}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {resource.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{formatFileSize(resource.file_size)}</span>
                    <span>{format(new Date(resource.created_at), "MMM dd, yyyy")}</span>
                  </div>
                  <Button asChild className="w-full">
                    <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
