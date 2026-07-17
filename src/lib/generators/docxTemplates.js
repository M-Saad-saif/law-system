import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from "docx";

function fmtDate(d) {
  if (!d) return "____________________";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "____________________";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function line(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, ...opts })],
    spacing: { after: 200 },
  });
}

function centeredTitle(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { after: 300 },
    children: [new TextRun({ text, bold: true, size: 32 })],
  });
}

/**
 * VAKALATNAMA
 * Standard Pakistani "power of attorney" filed to authorize an advocate
 * to represent a client in a specific case.
 */
export function buildVakalatnamaDoc(caseDoc) {
  const accusedNames = (caseDoc.accused || []).map((a) => a.name).join(", ");
  const provisions = (caseDoc.provisions || []).join(", ");

  return new Document({
    sections: [
      {
        properties: {},
        children: [
          centeredTitle("VAKALATNAMA"),
          line(
            `IN THE COURT OF: ${caseDoc.courtName || "____________________"}`,
            { bold: true },
          ),
          line(`CASE TITLE: ${caseDoc.caseTitle || "____________________"}`),
          line(
            `CASE / SUIT NO: ${caseDoc.caseNumber || caseDoc.suitNo || "____________________"}`,
          ),
          caseDoc.firNo
            ? line(`FIR NO: ${caseDoc.firNo}`)
            : new Paragraph({}),
          provisions ? line(`PROVISIONS: ${provisions}`) : new Paragraph({}),
          new Paragraph({ text: "", spacing: { after: 300 } }),
          line(
            `I / We, ${caseDoc.clientName || "____________________"}, ${
              caseDoc.counselFor ? `the ${caseDoc.counselFor} ` : ""
            }in the above-titled case${accusedNames ? ` (accused: ${accusedNames})` : ""}, do hereby appoint, engage and authorize the Advocate(s) named below to appear, act and plead on my/our behalf in the above case and in all proceedings connected therewith, including applications for bail, adjournments, withdrawal, compromise, and to sign, verify and file pleadings, appeals, revisions and any other documents necessary for the proper conduct of the case.`,
          ),
          new Paragraph({ text: "", spacing: { after: 400 } }),
          line("The said Advocate(s) is/are further authorized to:"),
          line("1. Admit or deny facts and documents on my/our behalf."),
          line("2. Receive back documents filed in the case."),
          line("3. Engage another Advocate as may be deemed necessary."),
          new Paragraph({ text: "", spacing: { after: 500 } }),
          line(`Dated: ${fmtDate(new Date())}`),
          line(`Place: ${caseDoc.courtName || "____________________"}`),
          new Paragraph({ text: "", spacing: { after: 600 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              left: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              insideHorizontal: { style: BorderStyle.NONE },
              insideVertical: { style: BorderStyle.NONE },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      line("_______________________"),
                      line("Signature of Client"),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({ text: "" }),
                      new Paragraph({ text: "" }),
                      line("_______________________"),
                      line("Signature of Advocate"),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });
}


export function buildBailApplicationDoc(caseDoc) {
  const accused = caseDoc.accused || [];
  const provisions = (caseDoc.provisions || []).join(", ");

  return new Document({
    sections: [
      {
        properties: {},
        children: [
          centeredTitle("BAIL APPLICATION"),
          line(
            `IN THE COURT OF: ${caseDoc.courtName || "____________________"}`,
            { bold: true },
          ),
          line(`CASE TITLE: ${caseDoc.caseTitle || "____________________"}`),
          line(
            `CASE / SUIT NO: ${caseDoc.caseNumber || caseDoc.suitNo || "____________________"}`,
          ),
          line(`FIR NO: ${caseDoc.firNo || "____________________"}`),
          line(`SECTIONS: ${provisions || "____________________"}`),
          new Paragraph({ text: "", spacing: { after: 300 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: "APPLICATION FOR GRANT OF BAIL UNDER SECTION 497/498 Cr.P.C.",
                bold: true,
              }),
            ],
            spacing: { after: 300 },
          }),
          line(
            `Respectfully Sheweth: That the Applicant/Accused${
              accused.length ? " " + accused.map((a) => a.name).join(", ") : ""
            } is involved in FIR No. ${caseDoc.firNo || "____"} registered under ${
              provisions || "____"
            }, pending before ${caseDoc.courtName || "the Hon'ble Court"}.`,
          ),
          new Paragraph({ text: "", spacing: { after: 300 } }),
          line("GROUNDS FOR BAIL:", { bold: true }),
          line("1. ____________________________________________________"),
          line("2. ____________________________________________________"),
          line("3. ____________________________________________________"),
          new Paragraph({ text: "", spacing: { after: 300 } }),
          line("PRAYER:", { bold: true }),
          line(
            "It is, therefore, respectfully prayed that this Hon'ble Court may graciously be pleased to admit the Applicant/Accused to bail in the aforementioned case, in the interest of justice.",
          ),
          new Paragraph({ text: "", spacing: { after: 500 } }),
          line(`Dated: ${fmtDate(new Date())}`),
          new Paragraph({ text: "", spacing: { after: 500 } }),
          line("_______________________"),
          line("Counsel for the Applicant/Accused"),
        ],
      },
    ],
  });
}

export const TEMPLATES = {
  vakalatnama: {
    label: "Vakalatnama",
    build: buildVakalatnamaDoc,
    filenamePrefix: "Vakalatnama",
  },
  bail: {
    label: "Bail Application",
    build: buildBailApplicationDoc,
    filenamePrefix: "Bail-Application",
  },
};

export async function generateCaseDocx(caseDoc, templateKey) {
  const template = TEMPLATES[templateKey];
  if (!template) {
    throw new Error(`Unknown document template: ${templateKey}`);
  }
  const doc = template.build(caseDoc);
  const buffer = await Packer.toBuffer(doc);
  const safeTitle = (caseDoc.caseTitle || "case").replace(/[^a-z0-9]+/gi, "-");
  const filename = `${template.filenamePrefix}-${safeTitle}.docx`;
  return { buffer, filename };
}
