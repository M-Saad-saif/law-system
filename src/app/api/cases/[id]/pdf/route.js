import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import Case from "@/models/Case";
import { format } from "date-fns";

const fmt = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "—");
const fmtDT = (d) => (d ? format(new Date(d), "dd MMM yyyy, hh:mm a") : "—");
const esc = (s) =>
  s ? String(s).replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
const money = (n) =>
  n != null ? `PKR ${Number(n).toLocaleString("en-PK")}` : "—";

function row(label, value) {
  if (!value || value === "—") return "";
  return `
    <tr>
      <td class="label">${esc(label)}</td>
      <td class="value">${esc(value)}</td>
    </tr>`;
}

function section(title, content) {
  if (!content || !content.trim()) return "";
  return `
    <div class="section">
      <h2 class="section-title">${esc(title)}</h2>
      ${content}
    </div>`;
}

function buildCaseDetails(c) {
  return section(
    "Case Details",
    `<table class="info-table">
      ${row("Case Title", c.caseTitle)}
      ${row("Case Number", c.caseNumber)}
      ${row("Suit / File No.", c.suitNo)}
      ${row("FIR No.", c.firNo)}
      ${row("Case Type", c.caseType)}
      ${row("Court Type", c.courtType)}
      ${row("Court Name", c.courtName)}
      ${row("Status", c.status)}
      ${row("Counsel For", c.counselFor)}
      ${row("Judge", c.judgeName)}
      ${row("Filing Date", fmt(c.filingDate))}
      ${row("Next Hearing", fmt(c.nextHearingDate))}
      ${row("Next Proceeding", fmt(c.nextProceedingDate))}
      ${row("Record Created", fmtDT(c.createdAt))}
      ${row("Last Updated", fmtDT(c.updatedAt))}
    </table>`,
  );
}

function buildClient(c) {
  const hasClient = c.clientName || c.clientContact || c.phone;
  if (!hasClient) return "";
  return section(
    "Client Information",
    `<table class="info-table">
      ${row("Client Name", c.clientName)}
      ${row("Client Contact", c.clientContact)}
      ${row("Case Phone", c.phone)}
    </table>`,
  );
}

function buildOppositeCounsel(c) {
  const oc = c.oppositeCounsel;
  if (!oc?.name && !oc?.contact) return "";
  return section(
    "Opposite Counsel",
    `<table class="info-table">
      ${row("Name", oc.name)}
      ${row("Contact", oc.contact)}
    </table>`,
  );
}

function buildProvisions(c) {
  if (!c.provisions?.length) return "";
  const tags = c.provisions
    .map((p) => `<span class="tag">${esc(p)}</span>`)
    .join(" ");
  return section("Legal Provisions", `<div class="tags">${tags}</div>`);
}

function buildProceedings(c) {
  if (!c.proceedings?.length) return "";
  const rows = c.proceedings
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(
      (p, i) => `
      <tr>
        <td class="seq">${i + 1}</td>
        <td>${fmt(p.date)}</td>
        <td>${esc(p.notes)}</td>
        <td>${p.nextDate ? fmt(p.nextDate) : "—"}</td>
        <td>${esc(p.addedBy) || "—"}</td>
      </tr>`,
    )
    .join("");
  return section(
    `Proceedings (${c.proceedings.length})`,
    `<table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th>Notes</th>
          <th>Next Date</th>
          <th>Added By</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`,
  );
}

function buildAccused(c) {
  if (!c.accused?.length) return "";
  const rows = c.accused
    .map(
      (a, i) => `
      <tr>
        <td class="seq">${i + 1}</td>
        <td>${esc(a.name)}</td>
        <td><span class="status-chip status-${(a.bailStatus || "").replace("_", "-")}">${esc(a.bailStatus?.replace("_", " ") || "N/A")}</span></td>
        <td>${a.bailAmount ? money(a.bailAmount) : "—"}</td>
        <td>${a.bailApplicationDate ? fmt(a.bailApplicationDate) : "—"}</td>
        <td>${esc(a.notes) || "—"}</td>
      </tr>`,
    )
    .join("");
  return section(
    `Accused / Bail (${c.accused.length})`,
    `<table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Bail Status</th>
          <th>Bail Amount</th>
          <th>Application Date</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`,
  );
}

function buildCitations(c) {
  if (!c.citations?.length) return "";
  const rows = c.citations
    .map(
      (ci, i) => `
      <tr>
        <td class="seq">${i + 1}</td>
        <td>${esc(ci.title)}</td>
        <td>${esc(ci.text) || "—"}</td>
        <td>${ci.documentUrl ? `<a href="${esc(ci.documentUrl)}">${esc(ci.documentUrl)}</a>` : "—"}</td>
      </tr>`,
    )
    .join("");
  return section(
    `Citations (${c.citations.length})`,
    `<table class="data-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Text</th>
          <th>Document</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`,
  );
}

function buildNotes(c) {
  if (!c.notes?.length) return "";
  const cards = c.notes
    .map(
      (n) => `
      <div class="note-card" style="border-left-color: ${esc(n.color || "#fef3c7")}; background: ${esc(n.color || "#fef3c7")}22;">
        <p>${esc(n.content)}</p>
        <span class="note-date">${fmtDT(n.createdAt)}</span>
      </div>`,
    )
    .join("");
  return section(
    `Notes (${c.notes.length})`,
    `<div class="notes-grid">${cards}</div>`,
  );
}

function buildFee(c) {
  const fee = c.fee;
  if (!fee) return "";
  const agreed = fee.agreedAmount || 0;
  const paid = (fee.payments || []).reduce((s, p) => s + (p.amount || 0), 0);
  const outstanding = agreed - paid;

  const paymentRows = (fee.payments || [])
    .map(
      (p, i) => `
      <tr>
        <td class="seq">${i + 1}</td>
        <td>${fmt(p.date)}</td>
        <td>${money(p.amount)}</td>
        <td>${esc(p.method?.replace("_", " "))}</td>
        <td>${esc(p.note) || "—"}</td>
      </tr>`,
    )
    .join("");

  const summary = `
    <table class="info-table fee-summary">
      ${row("Agreed Amount", money(agreed))}
      ${row("Total Paid", money(paid))}
      ${row("Outstanding", money(outstanding))}
      ${fee.notes ? row("Fee Notes", fee.notes) : ""}
    </table>`;

  const payments =
    fee.payments?.length > 0
      ? `<h3 class="sub-heading">Payment History</h3>
         <table class="data-table">
           <thead>
             <tr><th>#</th><th>Date</th><th>Amount</th><th>Method</th><th>Note</th></tr>
           </thead>
           <tbody>${paymentRows}</tbody>
         </table>`
      : '<p class="empty-note">No payments recorded.</p>';

  return section("Fee & Payments", summary + payments);
}

function buildHtml(c) {
  const title = c.caseTitle || "Case Report";
  const statusColour =
    {
      Active: "#16a34a",
      Closed: "#6b7280",
      Pending: "#d97706",
      Adjourned: "#9333ea",
      Disposed: "#374151",
    }[c.status] || "#374151";

  const body = [
    buildCaseDetails(c),
    buildClient(c),
    buildOppositeCounsel(c),
    buildProvisions(c),
    buildProceedings(c),
    buildAccused(c),
    buildCitations(c),
    buildNotes(c),
    buildFee(c),
  ].join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Case Report — ${esc(title)}</title>
  <style>
    /* ── Reset & base ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #fff;
      padding: 40px 48px;
      max-width: 960px;
      margin: 0 auto;
    }
    a { color: #1d4ed8; }

    /* ── Page header ── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #1a1a1a;
      padding-bottom: 18px;
      margin-bottom: 28px;
    }
    .firm-name {
      font-size: 11px;
      font-family: sans-serif;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 6px;
    }
    .case-title {
      font-size: 22px;
      font-weight: bold;
      line-height: 1.3;
      max-width: 600px;
    }
    .header-meta {
      text-align: right;
      font-family: sans-serif;
      font-size: 11px;
      color: #6b7280;
      line-height: 2;
    }
    .status-pill {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-family: monospace;
      font-weight: bold;
      color: #fff;
      background: ${statusColour};
      letter-spacing: 0.5px;
    }

    /* ── Sections ── */
    .section { margin-bottom: 28px; }
    .section-title {
      font-family: sans-serif;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #374151;
      padding: 6px 10px;
      background: #f3f4f6;
      border-left: 4px solid #1a1a1a;
      margin-bottom: 12px;
    }
    .sub-heading {
      font-family: sans-serif;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #6b7280;
      margin: 14px 0 6px;
    }
    .empty-note {
      font-style: italic;
      color: #9ca3af;
      font-size: 12px;
      padding: 6px 0;
    }

    /* ── Info table (label / value pairs) ── */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .info-table td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
    .info-table td.label {
      font-family: sans-serif;
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: 200px;
      white-space: nowrap;
    }
    .info-table td.value { color: #111827; font-weight: 500; }
    .fee-summary { margin-bottom: 14px; }

    /* ── Data table (multi-column) ── */
    .data-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .data-table thead tr { background: #1a1a1a; color: #fff; }
    .data-table thead th {
      padding: 8px 10px;
      text-align: left;
      font-family: sans-serif;
      font-size: 10px;
      letter-spacing: 1px;
      text-transform: uppercase;
      font-weight: 600;
    }
    .data-table tbody tr:nth-child(even) { background: #f9fafb; }
    .data-table tbody td {
      padding: 8px 10px;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: top;
      color: #374151;
    }
    .data-table td.seq { color: #9ca3af; font-size: 11px; width: 28px; }

    /* ── Tags (legal provisions) ── */
    .tags { display: flex; flex-wrap: wrap; gap: 8px; }
    .tag {
      padding: 4px 12px;
      border-radius: 20px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1d4ed8;
      font-family: monospace;
      font-size: 12px;
      font-weight: 600;
    }

    /* ── Bail status chips ── */
    .status-chip {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-family: sans-serif;
      font-size: 10px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .status-granted  { background: #dcfce7; color: #15803d; }
    .status-refused  { background: #fee2e2; color: #b91c1c; }
    .status-pending  { background: #fef9c3; color: #92400e; }
    .status-not-applicable { background: #f3f4f6; color: #6b7280; }

    /* ── Notes cards ── */
    .notes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
    .note-card {
      padding: 12px 14px;
      border-left: 4px solid #fbbf24;
      border-radius: 4px;
      font-size: 12.5px;
      line-height: 1.6;
    }
    .note-date {
      display: block;
      font-size: 10px;
      color: #9ca3af;
      font-family: sans-serif;
      margin-top: 6px;
    }

    /* ── Page footer ── */
    .page-footer {
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #d1d5db;
      display: flex;
      justify-content: space-between;
      font-family: sans-serif;
      font-size: 10px;
      color: #9ca3af;
    }
    .confidential {
      font-family: sans-serif;
      font-size: 9px;
      text-align: center;
      color: #d1d5db;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    /* ── Print optimisation ── */
    @media print {
      body { padding: 20px 24px; }
      .section { page-break-inside: avoid; }
      .data-table { page-break-inside: auto; }
      .data-table tr { page-break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- Page header -->
  <div class="page-header">
    <div>
      <div class="firm-name">LawPortal — Case Report</div>
      <div class="case-title">${esc(title)}</div>
    </div>
    <div class="header-meta">
      <span class="status-pill">${esc(c.status)}</span><br/>
      ${c.caseNumber ? `<strong>${esc(c.caseNumber)}</strong><br/>` : ""}
      ${esc(c.caseType)} &bull; ${esc(c.courtType)}<br/>
      Generated: ${fmt(new Date())}
    </div>
  </div>

  <!-- Body sections -->
  ${body}

  <!-- Footer -->
  <div class="confidential">Confidential — Attorney-Client Privileged</div>
  <div class="page-footer">
    <span>LawPortal Case Report &mdash; ${esc(title)}</span>
    <span>Generated ${new Date().toISOString()}</span>
  </div>

  <script>
    // Auto-open print dialog so the user can save as PDF
    window.onload = () => window.print();
  </script>
</body>
</html>`;
}

export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const caseDoc = await Case.findOne({
    _id: params.id,
    userId: user.id,
  }).lean();

  if (!caseDoc) {
    return new Response(
      JSON.stringify({ success: false, message: "Case not found." }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const html = buildHtml(caseDoc);
  const safeTitle = (caseDoc.caseTitle || "case")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase();

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="case-report-${safeTitle}.html"`,
    },
  });
});
