import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";
import connectDB from "@/lib/db";
import CrossExamination from "@/models/CrossExamination";
import WitnessSection from "@/models/WitnessSection";
import { format } from "date-fns";

export const GET = withAuth(async (req, { params }, user) => {
  await connectDB();

  const exam = await CrossExamination.findById(params.id)
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email")
    .populate("caseId", "caseTitle caseNumber")
    .lean();

  if (!exam)
    return NextResponse.json(
      { error: "Cross-examination not found." },
      { status: 404 },
    );

  const isOwner = exam.createdBy._id.toString() === user.id.toString();
  const isAssigned =
    exam.assignedTo && exam.assignedTo._id.toString() === user.id.toString();
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAssigned && !isAdmin) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const witnesses = await WitnessSection.find({ crossExamId: exam._id })
    .sort({ createdAt: 1 })
    .lean();

  const formatDate = (d) => (d ? format(new Date(d), "dd MMM yyyy") : "N/A");

  // Build QA rows HTML for a witness
  const buildQaRows = (pairs) =>
    pairs
      .sort((a, b) => a.sequence - b.sequence)
      .map((p) => {
        const question =
          p.useEditedVersion && p.editedQuestion
            ? p.editedQuestion
            : p.originalQuestion;
        const answer =
          p.useEditedVersion && p.editedAnswer
            ? p.editedAnswer
            : p.originalAnswer;
        const flag = p.isFlagged
          ? '<span class="badge flag">⚑ Flagged</span>'
          : "";
        const approved = p.isApproved
          ? '<span class="badge ok">✓ Approved</span>'
          : "";
        const edited = p.useEditedVersion
          ? '<span class="badge edited">Edited</span>'
          : "";
        return `
          <tr class="${p.isFlagged ? "row-flagged" : p.isApproved ? "row-ok" : ""}">
            <td class="seq">${p.sequence}</td>
            <td>
              <div class="q-label">Q:</div>
              <div class="q-text">${question || "<em>—</em>"}</div>
              <div class="q-label" style="margin-top:6px">A:</div>
              <div class="a-text">${answer || "<em>—</em>"}</div>
              ${p.strategyNote ? `<div class="note"><strong>Strategy:</strong> ${p.strategyNote}</div>` : ""}
            </td>
            <td class="badges">${flag}${approved}${edited}</td>
          </tr>`;
      })
      .join("");

  const witnessBlocks = witnesses
    .map(
      (w) => `
      <div class="witness-block">
        <h3>${w.witnessName} <span class="witness-type">(${w.witnessType})</span></h3>
        ${w.role ? `<p class="witness-role">${w.role}</p>` : ""}
        <table>
          <thead><tr><th>#</th><th>Question / Answer</th><th>Status</th></tr></thead>
          <tbody>${buildQaRows(w.qaPairs)}</tbody>
        </table>
      </div>`,
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${exam.title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', serif; color: #1a1a1a; padding: 40px; max-width: 900px; margin: auto; }
  header { border-bottom: 2px solid #1a1a1a; padding-bottom: 16px; margin-bottom: 24px; }
  header h1 { font-size: 22px; margin-bottom: 4px; }
  .meta { font-size: 12px; color: #555; display: flex; gap: 24px; flex-wrap: wrap; margin-top: 8px; }
  .meta span { display: flex; flex-direction: column; }
  .meta strong { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; color: #999; }
  .status-pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px;
    font-family: monospace; background: #f0f4ff; border: 1px solid #c7d2fe; color: #3730a3; }
  .witness-block { margin-bottom: 32px; }
  .witness-block h3 { font-size: 15px; font-weight: bold; margin-bottom: 4px; padding: 8px 12px;
    background: #f8f8f8; border-left: 3px solid #1a1a1a; }
  .witness-type { font-weight: normal; font-size: 12px; color: #666; text-transform: capitalize; }
  .witness-role { font-size: 12px; color: #666; margin: 4px 0 8px 0; padding-left: 12px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #1a1a1a; color: white; padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; }
  td { padding: 10px; border-bottom: 1px solid #eee; vertical-align: top; }
  td.seq { width: 36px; color: #999; font-size: 11px; }
  td.badges { width: 90px; }
  .q-label { font-size: 10px; font-weight: bold; text-transform: uppercase; color: #999; margin-bottom: 2px; }
  .q-text  { font-weight: 600; }
  .a-text  { color: #444; margin-top: 2px; }
  .note    { font-size: 11px; color: #666; margin-top: 6px; padding: 4px 8px; background: #fffbeb; border-left: 2px solid #f59e0b; }
  .row-flagged td { background: #fff5f5; }
  .row-ok td { background: #f0fff4; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-family: sans-serif; margin-bottom: 3px; }
  .badge.flag   { background: #fee2e2; color: #b91c1c; }
  .badge.ok     { background: #dcfce7; color: #15803d; }
  .badge.edited { background: #e0f2fe; color: #0369a1; }
  footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ddd;
    font-size: 11px; color: #999; display: flex; justify-content: space-between; }
  @media print {
    body { padding: 20px; }
    .witness-block { page-break-inside: avoid; }
  }
</style>
</head>
<body>
<header>
  <h1>${exam.title}</h1>
  <div class="meta">
    <span><strong>Case</strong>${exam.caseId ? `${exam.caseId.caseTitle} (${exam.caseId.caseNumber})` : "N/A"}</span>
    <span><strong>Status</strong><span class="status-pill">${exam.status}</span></span>
    <span><strong>Version</strong>v${exam.version - 1}</span>
    <span><strong>Prepared by</strong>${exam.createdBy.name}</span>
    ${exam.assignedTo ? `<span><strong>Reviewed by</strong>${exam.assignedTo.name}</span>` : ""}
    ${exam.hearingDate ? `<span><strong>Hearing Date</strong>${formatDate(exam.hearingDate)}</span>` : ""}
    <span><strong>Generated</strong>${formatDate(new Date())}</span>
  </div>
</header>

${witnessBlocks || '<p style="color:#999;font-style:italic">No witness sections found.</p>'}

<footer>
  <span>LexisPortal — Cross-Examination Document</span>
  <span>Generated ${new Date().toISOString()}</span>
</footer>

<script>
  // Auto-trigger print dialog when opened directly
  window.onload = () => window.print();
</script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="cross-exam-${params.id}.html"`,
    },
  });
});
