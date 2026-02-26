import { getLogoBase64 } from "./logoBase64";

let LOGO_URL = "";

export interface IDCardData {
  id: string;
  studentName: string;
  email: string;
  studentId: string;
  avatarUrl: string | null;
  country: string;
  courseName: string;
  enrolledAt: string;
  expiryDate: Date;
  isExpired: boolean;
  duration: string;
}

export function parseDurationToMonths(duration: string | null): number {
  if (!duration) return 6;
  const lower = duration.toLowerCase();
  const numMatch = lower.match(/(\d+)/);
  const num = numMatch ? parseInt(numMatch[1]) : 6;
  if (lower.includes("week")) return Math.max(1, Math.ceil(num / 4));
  if (lower.includes("month")) return num;
  if (lower.includes("year")) return num * 12;
  if (lower.includes("hour")) return Math.max(1, Math.ceil(num / 40));
  return 6;
}

export function getExpiryDate(enrolledAt: string, duration: string | null): Date {
  const start = new Date(enrolledAt);
  const months = parseDurationToMonths(duration);
  start.setMonth(start.getMonth() + months);
  return start;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function generateQRCodeSVG(data: string, size: number = 60): string {
  return `<img src="https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=1a365d" alt="QR Code" width="${size}" height="${size}" style="border-radius:4px;display:block;" crossorigin="anonymous" />`;
}

export async function generateIDCardHTML(card: IDCardData): Promise<string> {
  LOGO_URL = await getLogoBase64();
  const enrollDate = formatDate(new Date(card.enrolledAt));
  const expiry = formatDate(card.expiryDate);
  const verifyUrl = `https://cdaa.academy/verify/${card.studentId}`;
  const qrCode = generateQRCodeSVG(verifyUrl, 55);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Student ID Card - ${card.studentName}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f1f5f9;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:flex;justify-content:center;align-items:center;min-height:100vh;flex-direction:column;gap:20px;}
.no-print{display:flex;gap:12px;margin-bottom:8px;}
.no-print button{padding:10px 24px;font-size:13px;font-weight:600;border:none;border-radius:8px;cursor:pointer;}
.btn-print{background:#1a365d;color:#fff;}.btn-close{background:#e2e8f0;color:#0f172a;}

.id-card{width:420px;height:270px;border-radius:16px;overflow:hidden;position:relative;background:#fff;box-shadow:0 20px 40px rgba(0,0,0,0.15);}
.id-card-back{width:420px;height:270px;border-radius:16px;overflow:hidden;position:relative;background:#fff;box-shadow:0 20px 40px rgba(0,0,0,0.15);}

/* Watermark */
.logo-watermark{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:200px;opacity:0.06;pointer-events:none;z-index:0;border-radius:50%;}

/* Front */
.card-header{background:linear-gradient(135deg,#0c1929 0%,#1e3a5f 60%,#0c4a6e 100%);padding:14px 20px;display:flex;align-items:center;gap:12px;}
.card-header img{width:50px;height:50px;object-fit:contain;border-radius:50%;background:#fff;padding:2px;}
.card-header-text{color:#fff;}
.card-header-text h2{font-size:13px;font-weight:800;letter-spacing:0.5px;}
.card-header-text p{font-size:8px;opacity:0.7;letter-spacing:1.5px;text-transform:uppercase;}
.card-body{display:flex;padding:16px 20px;gap:16px;height:calc(100% - 78px);position:relative;z-index:1;}
.avatar-col{display:flex;flex-direction:column;align-items:center;gap:6px;}
.avatar{width:80px;height:80px;border-radius:10px;background:linear-gradient(135deg,#1e3a5f,#06b6d4);display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid #c9a84c;}
.avatar img{width:100%;height:100%;object-fit:cover;}
.avatar span{font-size:32px;font-weight:800;color:#fff;}
.student-id-badge{font-size:8px;font-weight:700;color:#fff;background:#1a365d;padding:2px 8px;border-radius:4px;letter-spacing:0.5px;}
.info-col{flex:1;display:flex;flex-direction:column;justify-content:center;gap:6px;}
.info-row label{font-size:8px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;display:block;}
.info-row p{font-size:12px;font-weight:600;color:#0f172a;margin-top:1px;}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;}
.card-strip{position:absolute;bottom:0;left:0;right:0;height:4px;background:linear-gradient(90deg,#1a365d,#2563eb,#06b6d4,#c9a84c);}
.status-badge{position:absolute;top:14px;right:16px;font-size:8px;font-weight:800;padding:3px 10px;border-radius:10px;text-transform:uppercase;letter-spacing:0.5px;}
.status-active{background:#dcfce7;color:#16a34a;}
.status-expired{background:#fee2e2;color:#dc2626;}
.qr-front{position:absolute;bottom:14px;right:14px;z-index:2;}

/* Back */
.back-header{background:linear-gradient(135deg,#0c1929,#1e3a5f);padding:10px 16px;text-align:center;color:#fff;}
.back-header h3{font-size:10px;font-weight:800;letter-spacing:1px;}
.back-header p{font-size:8px;opacity:0.7;margin-top:2px;}
.back-body{padding:6px 14px;text-align:center;position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;height:calc(100% - 44px);overflow:hidden;justify-content:space-between;}
.back-top{display:flex;flex-direction:column;align-items:center;}
.barcode{font-family:monospace;font-size:11px;letter-spacing:3px;color:#0f172a;margin:3px 0;padding:3px 8px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;}
.qr-back{margin:2px auto;display:flex;justify-content:center;}
.terms{font-size:6.5px;color:#64748b;line-height:1.35;margin-top:2px;text-align:left;list-style:none;padding:0 4px;}
.terms li{margin-bottom:1px;}
.back-footer{font-size:6px;color:#94a3b8;text-align:center;padding-top:2px;border-top:1px solid #e2e8f0;width:100%;}

@media print{body{background:#fff;}.no-print{display:none!important;}.id-card,.id-card-back{box-shadow:none;page-break-after:always;}}
</style>
</head>
<body>
<div class="no-print">
  <button class="btn-print" onclick="window.print()">🖨️ Print ID Card</button>
  <button class="btn-close" onclick="window.close()">Close</button>
</div>

<!-- FRONT -->
<div class="id-card">
  <img src="${LOGO_URL}" alt="" class="logo-watermark" />
  <div class="card-header">
    <img src="${LOGO_URL}" alt="CDAA" />
    <div class="card-header-text">
      <h2>CYBER DEFEND ACADEMY AFRICA</h2>
      <p>Student Identification Card</p>
    </div>
  </div>
  <span class="status-badge ${card.isExpired ? "status-expired" : "status-active"}">${card.isExpired ? "Expired" : "Active"}</span>
  <div class="card-body">
    <div class="avatar-col">
      <div class="avatar">
        ${card.avatarUrl
          ? `<img src="${card.avatarUrl}" alt="${card.studentName}" />`
          : `<span>${card.studentName.charAt(0)}</span>`
        }
      </div>
      <span class="student-id-badge">${card.studentId}</span>
    </div>
    <div class="info-col">
      <div class="info-row">
        <label>Full Name</label>
        <p>${card.studentName}</p>
      </div>
      <div class="info-row">
        <label>Program</label>
        <p style="font-size:11px;">${card.courseName}</p>
      </div>
      <div class="info-grid">
        <div class="info-row">
          <label>Enrolled</label>
          <p style="font-size:10px;">${enrollDate}</p>
        </div>
        <div class="info-row">
          <label>Valid Until</label>
          <p style="font-size:10px;color:${card.isExpired ? "#dc2626" : "#0f172a"}">${expiry}</p>
        </div>
      </div>
    </div>
    <div class="qr-front">${qrCode}</div>
  </div>
  <div class="card-strip"></div>
</div>

<!-- BACK -->
<div class="id-card-back">
  <img src="${LOGO_URL}" alt="" class="logo-watermark" />
  <div class="back-header">
    <h3>CYBER DEFEND ACADEMY AFRICA</h3>
    <p>Securing Africa's Digital Future</p>
  </div>
  <div class="back-body">
    <div class="back-top">
      <div class="barcode">${card.studentId}</div>
      <div class="qr-back">${generateQRCodeSVG(verifyUrl, 45)}</div>
      <p style="font-size:6.5px;color:#64748b;margin:1px 0;">Scan to verify • ${verifyUrl}</p>
    </div>
    <ul class="terms">
      <li>• This card is the property of Cyber Defend Academy Africa (CDAA) and must be returned upon request.</li>
      <li>• This card is non-transferable and must be presented for identification purposes when required.</li>
      <li>• Loss or theft of this card should be reported immediately to the academy administration office.</li>
      <li>• This card is valid only for the period indicated on the front side.</li>
      <li>• Misuse or alteration of this card is strictly prohibited and may result in disciplinary action.</li>
    </ul>
    <div class="back-footer">
      <p>📧 info@cyberdefendafrica.com &nbsp;|&nbsp; 🌐 www.cyberdefendafrica.com</p>
    </div>
  </div>
  <div class="card-strip"></div>
</div>
</body>
</html>`;
}
