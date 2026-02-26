import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Award, Download, ExternalLink, Copy, Check, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { getLogoBase64 } from "@/lib/logoBase64";

async function renderCertificateHTML(cert: any): Promise<string> {
  const LOGO_URL = await getLogoBase64();
  const issueDate = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const verifyUrl = `https://cdaa.academy/verify/${cert.verification_id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=1a365d`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Certificate - ${cert.student_name}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f1f5f9;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
.cert-page{width:1056px;height:816px;margin:40px auto;position:relative;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);}
.cert-frame{position:absolute;inset:12px;border:3px solid #1a365d;border-radius:8px;}
.cert-frame-inner{position:absolute;inset:4px;border:1px solid #c9a84c;border-radius:6px;}
.holo-strip{position:absolute;top:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#1a365d,#2563eb,#06b6d4,#c9a84c,#06b6d4,#2563eb,#1a365d);}
.watermark{position:absolute;inset:0;opacity:0.03;background-image:repeating-linear-gradient(45deg,transparent,transparent 35px,#1a365d 35px,#1a365d 36px);pointer-events:none;}
.cert-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:50px 70px;}
.logo-section{display:flex;align-items:center;gap:16px;margin-bottom:8px;}
.logo-img{width:72px;height:72px;object-fit:contain;}
.academy-name{font-family:'Playfair Display',serif;font-size:22px;font-weight:800;color:#1a365d;letter-spacing:1px;text-transform:uppercase;}
.academy-tagline{font-size:10px;color:#64748b;letter-spacing:3px;text-transform:uppercase;margin-top:2px;}
.divider{display:flex;align-items:center;gap:12px;margin:14px 0;width:100%;}
.divider-line{flex:1;height:1px;background:linear-gradient(90deg,transparent,#c9a84c,transparent);}
.divider-diamond{width:8px;height:8px;background:#c9a84c;transform:rotate(45deg);}
.cert-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:#1a365d;letter-spacing:3px;text-transform:uppercase;margin:6px 0 4px;}
.cert-subtitle{font-size:12px;color:#64748b;letter-spacing:4px;text-transform:uppercase;}
.presented-to{font-size:12px;color:#94a3b8;letter-spacing:2px;text-transform:uppercase;margin-top:18px;}
.recipient-name{font-family:'Playfair Display',serif;font-size:34px;font-weight:700;color:#0f172a;margin:8px 0;border-bottom:2px solid #c9a84c;padding-bottom:6px;display:inline-block;}
.completion-text{font-size:14px;color:#475569;line-height:1.7;max-width:640px;text-align:center;margin:10px 0;}
.course-name{font-size:18px;font-weight:700;color:#1a365d;margin:6px 0;}
.meta-row{display:flex;justify-content:space-between;align-items:flex-end;width:100%;margin-top:20px;padding:0 20px;}
.meta-col{text-align:center;}
.meta-label{font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:4px;}
.meta-value{font-size:13px;font-weight:600;color:#0f172a;}
.sig-line{width:160px;border-top:1px solid #1a365d;margin:0 auto 4px;}
.seal{width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,#c9a84c,#f59e0b);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;text-align:center;line-height:1.2;border:3px solid #1a365d;box-shadow:0 4px 12px rgba(201,168,76,0.4);}
.cert-footer{position:absolute;bottom:18px;left:0;right:0;text-align:center;font-size:9px;color:#94a3b8;letter-spacing:0.5px;}
.qr-section{position:absolute;bottom:30px;right:30px;z-index:3;text-align:center;}
.qr-section img{border:2px solid #e2e8f0;border-radius:6px;padding:3px;background:#fff;}
.qr-section p{font-size:7px;color:#94a3b8;margin-top:3px;}
.no-print{text-align:center;margin:20px;display:flex;gap:12px;justify-content:center;}
.no-print button{padding:12px 28px;font-size:14px;font-weight:600;border:none;border-radius:8px;cursor:pointer;}
.btn-print{background:#1a365d;color:#fff;}.btn-close{background:#e2e8f0;color:#0f172a;}
@media print{body{background:#fff;}.cert-page{box-shadow:none;margin:0;}.no-print{display:none!important;}}
</style>
</head>
<body>
<div class="no-print">
  <button class="btn-print" onclick="window.print()">🖨️ Print Certificate</button>
  <button class="btn-close" onclick="window.close()">Close</button>
</div>
<div class="cert-page">
  <div class="holo-strip"></div>
  <div class="cert-frame"><div class="cert-frame-inner"></div></div>
  <div class="watermark"></div>
  <div class="cert-content">
    <div class="logo-section">
      <img src="${LOGO_URL}" alt="CDAA Logo" class="logo-img" />
      <div>
        <div class="academy-name">Cyber Defend Academy Africa</div>
        <div class="academy-tagline">Securing Africa's Digital Future</div>
      </div>
    </div>
    <div class="divider"><div class="divider-line"></div><div class="divider-diamond"></div><div class="divider-line"></div></div>
    <div class="cert-subtitle">This is to certify that</div>
    <div class="cert-title">Certificate of Completion</div>
    <div class="presented-to">Is proudly presented to</div>
    <div class="recipient-name">${cert.student_name}</div>
    <div class="completion-text">For successfully completing the professional training program in</div>
    <div class="course-name">${cert.course_name}</div>
    <div class="completion-text" style="margin-top:4px;font-size:12px;">Having demonstrated competence and dedication in the field of cybersecurity, this certificate is awarded in recognition of academic excellence and professional growth.</div>
    <div class="divider" style="margin:16px 0;"><div class="divider-line"></div><div class="divider-diamond"></div><div class="divider-line"></div></div>
    <div class="meta-row">
      <div class="meta-col">
        <div class="sig-line"></div>
        <div class="meta-value">Director of Training</div>
        <div class="meta-label">CDAA Authority</div>
      </div>
      <div class="seal">CDAA<br>VERIFIED</div>
      <div class="meta-col">
        <div class="meta-label">Date of Issue</div>
        <div class="meta-value">${issueDate}</div>
        <div class="meta-label" style="margin-top:8px;">Verification ID</div>
        <div class="meta-value" style="font-family:monospace;font-size:11px;">${cert.verification_id}</div>
      </div>
    </div>
  </div>
  <div class="qr-section">
    <img src="${qrCodeUrl}" alt="QR Verification" width="80" height="80" />
    <p>Scan to verify</p>
  </div>
  <div class="cert-footer">Cyber Defend Academy Africa &bull; Official Certificate &bull; Verify at academy portal &bull; ${cert.verification_id}</div>
</div>
</body>
</html>`;
}

export default function StudentCertificates() {
  const { user } = useUserRole();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewCert, setPreviewCert] = useState<any>(null);

  const { data: certificates, isLoading } = useQuery({
    queryKey: ["student-certificates-full", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user.id)
        .is("revoked_at", null)
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const copyVerificationId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("Verification ID copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleViewPrint = async (cert: any) => {
    const html = await renderCertificateHTML(cert);
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
          <h1 className="text-3xl font-display font-bold text-foreground">My Certificates</h1>
          <p className="text-muted-foreground mt-1">
            View, preview, and download your earned certificates
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : certificates?.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Certificates Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Complete courses to earn certificates that validate your cybersecurity skills.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {certificates?.map((cert) => (
              <Card key={cert.id} className="bg-card border-border overflow-hidden">
                <div className="h-3 bg-gradient-to-r from-primary via-cyan to-accent" />
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-accent/10">
                        <Award className="h-8 w-8 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Certificate of Completion
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.course_name}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Student Name</p>
                      <p className="font-medium text-foreground">{cert.student_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Issue Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(cert.issued_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
                    <span className="text-xs text-muted-foreground">Verification ID:</span>
                    <code className="text-xs font-mono text-foreground flex-1">
                      {cert.verification_id}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyVerificationId(cert.verification_id)}
                    >
                      {copiedId === cert.verification_id ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" variant="outline" onClick={() => setPreviewCert(cert)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button className="flex-1" variant="outline" onClick={() => handleViewPrint(cert)}>
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

      {/* Certificate Preview Dialog */}
      <Dialog open={!!previewCert} onOpenChange={() => setPreviewCert(null)}>
        <DialogContent className="max-w-[1120px] p-0 overflow-hidden">
          {previewCert && (
            <CertPreviewContent cert={previewCert} onPrint={handleViewPrint} />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function CertPreviewContent({ cert, onPrint }: { cert: any; onPrint: (c: any) => void }) {
  const [html, setHtml] = useState("");
  useEffect(() => {
    renderCertificateHTML(cert).then(setHtml);
  }, [cert]);

  return (
    <div className="bg-muted p-6">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-display font-bold text-foreground">Certificate Preview</h3>
        <Button size="sm" onClick={() => onPrint(cert)} className="gap-2">
          <Download className="h-4 w-4" /> Open & Print
        </Button>
      </div>
      <div
        className="bg-white rounded-lg shadow-xl mx-auto overflow-hidden"
        style={{ width: 1056, height: 816, transform: "scale(0.95)", transformOrigin: "top center" }}
      >
        <iframe
          srcDoc={html}
          className="w-full h-full border-0"
          title="Certificate Preview"
        />
      </div>
    </div>
  );
}
