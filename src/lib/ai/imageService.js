import sharp from "sharp";

const WIDTH = 1400;
const MARGIN_X = 60;
const CONTENT_WIDTH = WIDTH - MARGIN_X * 2;

const COLORS = {
  cream: "#f8f4e9",
  parchment: "#f1ead7",
  navy: "#16233a",
  navyLight: "#1f3350",
  gold: "#c9a227",
  goldLight: "#e0c568",
  green: "#2f4a34",
  brown: "#6b4a23",
  ink: "#1c1c1c",
  white: "#ffffff",
};

function escapeXml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date) {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
}

function estimateMaxChars(widthPx, fontSize, factor = 0.52) {
  return Math.max(10, Math.floor(widthPx / (fontSize * factor)));
}

function wrapLines(text, maxChars) {
  const words = String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = w;
    } else {
      current += " " + w;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function toBullets(text) {
  if (!text) return [];
  let parts = String(text)
    .split(/\n|;/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    parts = String(text)
      .split(/(?<=[.!?])\s+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return parts;
}

function decisionBadge(finalDecision = "") {
  const lower = finalDecision.toLowerCase();
  if (/(allow|grant|uphold|accept)/.test(lower)) return "PETITION ALLOWED";
  if (/(dismiss|reject|decline|deny)/.test(lower)) return "PETITION DISMISSED";
  if (/(disposed)/.test(lower)) return "CASE DISPOSED";
  return "DECISION RECORDED";
}

function scalesIcon(cx, cy, s = 1, color = COLORS.green) {
  const armY = cy - 32 * s;
  return `
  <g stroke="${color}" stroke-width="${3 * s}" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <line x1="${cx}" y1="${cy - 46 * s}" x2="${cx}" y2="${cy + 34 * s}" />
    <line x1="${cx - 34 * s}" y1="${armY}" x2="${cx + 34 * s}" y2="${armY}" />
    <circle cx="${cx}" cy="${cy - 46 * s}" r="${4 * s}" fill="${color}" />
    <line x1="${cx - 34 * s}" y1="${armY}" x2="${cx - 34 * s}" y2="${armY + 16 * s}" />
    <line x1="${cx + 34 * s}" y1="${armY}" x2="${cx + 34 * s}" y2="${armY + 16 * s}" />
    <path d="M ${cx - 46 * s} ${armY + 16 * s} A ${12 * s} ${12 * s} 0 0 0 ${cx - 22 * s} ${armY + 16 * s}" />
    <path d="M ${cx + 22 * s} ${armY + 16 * s} A ${12 * s} ${12 * s} 0 0 0 ${cx + 46 * s} ${armY + 16 * s}" />
    <path d="M ${cx - 18 * s} ${cy + 34 * s} L ${cx + 18 * s} ${cy + 34 * s} L ${cx + 12 * s} ${cy + 22 * s} L ${cx - 12 * s} ${cy + 22 * s} Z" fill="${color}" stroke="none" />
  </g>`;
}

function laurelIcon(cx, cy, s = 1, mirror = false, color = COLORS.green) {
  const dir = mirror ? -1 : 1;
  let leaves = "";
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    const angle = (-70 + t * 140) * (Math.PI / 180);
    const r = 22 * s;
    const lx = cx + dir * Math.cos(angle) * r;
    const ly = cy + Math.sin(angle) * r;
    const deg = (angle * 180) / Math.PI;
    leaves += `<ellipse cx="${lx}" cy="${ly}" rx="${6 * s}" ry="${3 * s}" transform="rotate(${dir * deg} ${lx} ${ly})" fill="${color}" opacity="0.85" />`;
  }
  return `<g>${leaves}</g>`;
}

function bookIcon(x, y, s = 1) {
  const w = 30 * s;
  const h = 36 * s;
  return `
  <g>
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${3 * s}" fill="${COLORS.brown}" />
    <rect x="${x + 3 * s}" y="${y + 3 * s}" width="${w - 6 * s}" height="${h - 6 * s}" rx="${2 * s}" fill="${COLORS.goldLight}" />
    <line x1="${x + w / 2}" y1="${y + 3 * s}" x2="${x + w / 2}" y2="${y + h - 3 * s}" stroke="${COLORS.brown}" stroke-width="${1.5 * s}" />
    <text x="${x + w / 2}" y="${y + h / 2 + 4 * s}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${8 * s}" font-weight="700" fill="${COLORS.brown}">LAW</text>
  </g>`;
}

function gavelIcon(x, y, s = 1) {
  return `
  <g stroke="${COLORS.green}" stroke-width="${3 * s}" fill="${COLORS.green}" stroke-linejoin="round">
    <rect x="${x - 22 * s}" y="${y - 4 * s}" width="${26 * s}" height="${12 * s}" rx="${2 * s}" transform="rotate(-35 ${x} ${y})" />
    <rect x="${x - 2 * s}" y="${y - 26 * s}" width="${5 * s}" height="${34 * s}" rx="${2 * s}" transform="rotate(-35 ${x} ${y})" fill="${COLORS.brown}" stroke="none" />
    <rect x="${x - 6 * s}" y="${y + 24 * s}" width="${38 * s}" height="${7 * s}" rx="${2 * s}" fill="${COLORS.brown}" stroke="none" />
  </g>`;
}

function cornerOrnament(x, y, rotation) {
  return `
  <g transform="translate(${x},${y}) rotate(${rotation})" opacity="0.9">
    <path d="M 0 0 L 46 0 M 0 0 L 0 46" stroke="${COLORS.gold}" stroke-width="3" fill="none" />
    <circle cx="10" cy="10" r="4" fill="${COLORS.gold}" />
  </g>`;
}

function buildSvg(data = {}) {
  const caseTitle = data.judgementTitle || "Judgement Summary";
  const caseNumber = data.caseNumber || "N/A";
  const courtName = data.courtName || "N/A";
  const judgementDate = formatDate(data.judgementDate);
  const judgeName = data.judgeName || "N/A";
  const petitioner = data.petitioner || "Petitioner";
  const respondent = data.respondent || "Respondent";
  const badge = decisionBadge(data.finalDecision);
  const sections = (data.relevantSections || []).filter(Boolean);

  // ---------- Pass 1: wrap all text up front so we can compute heights ----------
  const titleLines = wrapLines(caseTitle, estimateMaxChars(900, 30, 0.5)).slice(
    0,
    2,
  );

  const FINDINGS_COL_WIDTH = 800; // left column of the two-column box
  const DECISION_COL_WIDTH = 380; // right column
  const findingsCharW = estimateMaxChars(FINDINGS_COL_WIDTH, 19);
  const decisionCharW = estimateMaxChars(DECISION_COL_WIDTH, 20);

  const bullets = toBullets(data.keyFindings).map((b) =>
    wrapLines(b, findingsCharW),
  );
  const findingsLineCount = bullets.reduce(
    (sum, lines) => sum + lines.length,
    0,
  );
  const findingsGapCount = Math.max(0, bullets.length - 1);

  const decisionLines = wrapLines(
    data.finalDecision || "Not specified.",
    decisionCharW,
  );

  const SECTION_COL_WIDTH = (CONTENT_WIDTH - 60) / 3;
  const sectionCharW = estimateMaxChars(SECTION_COL_WIDTH - 50, 18);
  const sectionEntries = sections.map((sec) => wrapLines(sec, sectionCharW));
  const sectionRowCount = Math.max(1, Math.ceil(sectionEntries.length / 3));
  const sectionRowMaxLines = [];
  for (let r = 0; r < sectionRowCount; r++) {
    const rowItems = sectionEntries.slice(r * 3, r * 3 + 3);
    sectionRowMaxLines.push(Math.max(1, ...rowItems.map((l) => l.length)));
  }

  // ---------- Pass 2: lay out cumulative Y positions ----------
  let y = 40;

  // Header
  const headerIconY = y + 60;
  y += 60; // icon row baseline area
  const mainTitleY = y + 12;
  y += 46;
  const subtitleStartY = y + 30;
  const subtitleLineH = 34;
  y += titleLines.length * subtitleLineH + 10;
  const dividerY = y + 8;
  y = dividerY + 32;

  // Case number / court row
  const caseRowY = y;
  y += 66;

  // Date / judge row
  const dateRowY = y;
  y += 66;

  // Parties row
  const partiesRowY = y;
  y += 82;

  // Two-column content box
  const boxTopY = y;
  const findingsBodyHeight = findingsLineCount * 26 + findingsGapCount * 14;
  const decisionBodyHeight = decisionLines.length * 30;
  const boxInnerHeight = Math.max(
    findingsBodyHeight,
    decisionBodyHeight + 70,
    160,
  );
  const boxHeaderHeight = 60;
  const boxHeight = boxHeaderHeight + boxInnerHeight + 40;
  y = boxTopY + boxHeight + 30;

  // Relevant sections footer
  const footerTopY = y;
  const footerHeaderHeight = 40;
  let footerBodyHeight = 0;
  const sectionRowY = [];
  {
    let ry = footerTopY + footerHeaderHeight + 30;
    for (let r = 0; r < sectionRowCount; r++) {
      sectionRowY.push(ry);
      const rowHeight = 40 + (sectionRowMaxLines[r] - 1) * 22;
      ry += rowHeight + 18;
    }
    footerBodyHeight = ry - (footerTopY + footerHeaderHeight);
  }
  y = footerTopY + footerHeaderHeight + footerBodyHeight;

  const HEIGHT = y + 50;

  // ---------- Build markup ----------
  const titleLinesSvg = titleLines
    .map(
      (line, i) =>
        `<text x="${WIDTH / 2}" y="${subtitleStartY + i * subtitleLineH}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-style="italic" fill="${COLORS.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n");

  let bulletsCursorY = boxTopY + boxHeaderHeight + 30;
  const bulletsSvg = bullets
    .map((lines) => {
      const block = lines
        .map(
          (line, li) =>
            `<text x="${li === 0 ? MARGIN_X + 48 : MARGIN_X + 62}" y="${bulletsCursorY + li * 26}" font-family="Georgia, 'Times New Roman', serif" font-size="19" fill="${COLORS.ink}">${li === 0 ? "•  " : ""}${escapeXml(line)}</text>`,
        )
        .join("\n");
      bulletsCursorY += lines.length * 26 + 14;
      return block;
    })
    .join("\n");
  if (!bullets.length) {
    bulletsSvg.concat(
      `<text x="${MARGIN_X + 48}" y="${bulletsCursorY}" font-family="Georgia, serif" font-size="19" fill="${COLORS.ink}">No observations recorded.</text>`,
    );
  }

  const decisionColX = MARGIN_X + FINDINGS_COL_WIDTH + 100;
  const decisionTextSvg = decisionLines
    .map(
      (line, i) =>
        `<text x="${decisionColX}" y="${boxTopY + boxHeaderHeight + 34 + i * 30}" font-family="Georgia, 'Times New Roman', serif" font-size="20" fill="${COLORS.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n");
  const decisionTextBottomY =
    boxTopY + boxHeaderHeight + 34 + decisionLines.length * 30;

  const scalesIconCy = boxTopY + boxHeaderHeight + boxInnerHeight / 2 + 10;
  const scalesIconCx = MARGIN_X + FINDINGS_COL_WIDTH + 40;

  const dividerX = MARGIN_X + FINDINGS_COL_WIDTH + 20;

  const sectionsSvg = sectionEntries
    .map((lines, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const x = MARGIN_X + col * (SECTION_COL_WIDTH + 30);
      const rowY = sectionRowY[row];
      return `
      ${bookIcon(x, rowY, 1)}
      ${lines
        .map(
          (line, li) =>
            `<text x="${x + 42}" y="${rowY + 22 + li * 24}" font-family="Georgia, 'Times New Roman', serif" font-size="18" fill="${COLORS.ink}">${escapeXml(line)}</text>`,
        )
        .join("\n")}
      `;
    })
    .join("\n");

  return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${COLORS.cream}" />
      <stop offset="1" stop-color="${COLORS.parchment}" />
    </linearGradient>
  </defs>

  <!-- background -->
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="${COLORS.navy}" />
  <rect x="16" y="16" width="${WIDTH - 32}" height="${HEIGHT - 32}" rx="18" fill="url(#bgGrad)" stroke="${COLORS.gold}" stroke-width="3" />
  <rect x="32" y="32" width="${WIDTH - 64}" height="${HEIGHT - 64}" rx="12" fill="none" stroke="${COLORS.green}" stroke-width="1.5" />

  ${cornerOrnament(30, 30, 0)}
  ${cornerOrnament(WIDTH - 30, 30, 90)}
  ${cornerOrnament(WIDTH - 30, HEIGHT - 30, 180)}
  ${cornerOrnament(30, HEIGHT - 30, 270)}

  <!-- header -->
  ${scalesIcon(150, headerIconY, 1.1, COLORS.green)}
  ${scalesIcon(WIDTH - 150, headerIconY, 1.1, COLORS.green)}
  <text x="${WIDTH / 2}" y="${mainTitleY}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="700" letter-spacing="2" fill="${COLORS.brown}">JUDGEMENT SUMMARY</text>
  ${titleLinesSvg}
  <line x1="${WIDTH / 2 - 220}" y1="${dividerY}" x2="${WIDTH / 2 - 20}" y2="${dividerY}" stroke="${COLORS.gold}" stroke-width="2" />
  <rect x="${WIDTH / 2 - 8}" y="${dividerY - 8}" width="16" height="16" fill="${COLORS.gold}" transform="rotate(45 ${WIDTH / 2} ${dividerY})" />
  <line x1="${WIDTH / 2 + 20}" y1="${dividerY}" x2="${WIDTH / 2 + 220}" y2="${dividerY}" stroke="${COLORS.gold}" stroke-width="2" />

  <!-- case number / court row -->
  <rect x="${MARGIN_X}" y="${caseRowY}" width="200" height="52" rx="8" fill="${COLORS.navyLight}" />
  <text x="${MARGIN_X + 18}" y="${caseRowY + 33}" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="${COLORS.white}">CASE NO:</text>
  <rect x="${MARGIN_X + 210}" y="${caseRowY}" width="330" height="52" rx="8" fill="${COLORS.white}" stroke="${COLORS.navyLight}" stroke-width="1.5" />
  <text x="${MARGIN_X + 228}" y="${caseRowY + 33}" font-family="Georgia, serif" font-size="19" fill="${COLORS.ink}">${escapeXml(caseNumber)}</text>

  <rect x="${MARGIN_X + 570}" y="${caseRowY}" width="180" height="52" rx="8" fill="${COLORS.navyLight}" />
  <text x="${MARGIN_X + 588}" y="${caseRowY + 33}" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="${COLORS.white}">COURT:</text>
  <rect x="${MARGIN_X + 750}" y="${caseRowY}" width="${CONTENT_WIDTH - 750}" height="52" rx="8" fill="${COLORS.white}" stroke="${COLORS.navyLight}" stroke-width="1.5" />
  <text x="${MARGIN_X + 768}" y="${caseRowY + 33}" font-family="Georgia, serif" font-size="19" fill="${COLORS.ink}">${escapeXml(courtName)}</text>

  <!-- date / judge row -->
  <rect x="${MARGIN_X}" y="${dateRowY}" width="230" height="52" rx="8" fill="${COLORS.navyLight}" />
  <text x="${MARGIN_X + 20}" y="${dateRowY + 33}" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="${COLORS.white}">JUDGEMENT DATE:</text>
  <rect x="${MARGIN_X + 232}" y="${dateRowY}" width="220" height="52" rx="8" fill="${COLORS.white}" stroke="${COLORS.navyLight}" stroke-width="1.5" />
  <text x="${MARGIN_X + 252}" y="${dateRowY + 33}" font-family="Georgia, serif" font-size="20" fill="${COLORS.ink}">${escapeXml(judgementDate)}</text>

  <rect x="${MARGIN_X + 640}" y="${dateRowY}" width="200" height="52" rx="8" fill="${COLORS.navyLight}" />
  <text x="${MARGIN_X + 658}" y="${dateRowY + 33}" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="700" fill="${COLORS.white}">JUDGE NAME:</text>
  <rect x="${MARGIN_X + 842}" y="${dateRowY}" width="${CONTENT_WIDTH - 842}" height="52" rx="8" fill="${COLORS.white}" stroke="${COLORS.navyLight}" stroke-width="1.5" />
  <text x="${MARGIN_X + 862}" y="${dateRowY + 33}" font-family="Georgia, serif" font-size="20" fill="${COLORS.ink}">${escapeXml(judgeName)}</text>

  <!-- parties row -->
  <rect x="${MARGIN_X}" y="${partiesRowY}" width="${CONTENT_WIDTH}" height="66" rx="10" fill="${COLORS.white}" stroke="${COLORS.green}" stroke-width="1.5" />
  <rect x="${MARGIN_X}" y="${partiesRowY}" width="200" height="66" rx="10" fill="${COLORS.green}" />
  <text x="${MARGIN_X + 20}" y="${partiesRowY + 40}" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" fill="${COLORS.white}">PARTIES:</text>

  <text x="${MARGIN_X + 420}" y="${partiesRowY + 24}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="${COLORS.green}">Petitioner / Appellant</text>
  <text x="${MARGIN_X + 420}" y="${partiesRowY + 52}" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="700" fill="${COLORS.ink}">'${escapeXml(petitioner)}'</text>
  ${laurelIcon(MARGIN_X + 640, partiesRowY + 33, 1, false)}

  <text x="${MARGIN_X + 940}" y="${partiesRowY + 24}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="${COLORS.green}">Respondent / State</text>
  <text x="${MARGIN_X + 940}" y="${partiesRowY + 52}" text-anchor="middle" font-family="Georgia, serif" font-size="20" font-weight="700" fill="${COLORS.ink}">'${escapeXml(respondent)}'</text>
  ${laurelIcon(MARGIN_X + 720, partiesRowY + 33, 1, true)}

  <!-- two-column content box -->
  <rect x="${MARGIN_X}" y="${boxTopY}" width="${CONTENT_WIDTH}" height="${boxHeight}" rx="12" fill="${COLORS.white}" fill-opacity="0.7" stroke="${COLORS.gold}" stroke-width="1.5" />
  <line x1="${dividerX}" y1="${boxTopY + 14}" x2="${dividerX}" y2="${boxTopY + boxHeight - 14}" stroke="${COLORS.gold}" stroke-width="1" stroke-dasharray="4 4" />

  <text x="${MARGIN_X + 30}" y="${boxTopY + 42}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${COLORS.ink}">KEY FINDINGS / OBSERVATIONS:</text>
  <line x1="${MARGIN_X + 30}" y1="${boxTopY + 54}" x2="${MARGIN_X + 440}" y2="${boxTopY + 54}" stroke="${COLORS.gold}" stroke-width="1.5" />
  ${bulletsSvg}

  ${scalesIcon(scalesIconCx, scalesIconCy, 1.4, COLORS.green)}

  <text x="${decisionColX}" y="${boxTopY + 42}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${COLORS.ink}">FINAL DECISION:</text>
  <line x1="${decisionColX}" y1="${boxTopY + 54}" x2="${WIDTH - MARGIN_X - 30}" y2="${boxTopY + 54}" stroke="${COLORS.gold}" stroke-width="1.5" />
  ${gavelIcon(WIDTH - MARGIN_X - 60, boxTopY + 30, 1)}
  ${decisionTextSvg}

  <rect x="${decisionColX}" y="${decisionTextBottomY + 20}" width="${DECISION_COL_WIDTH - 20}" height="38" rx="19" fill="${COLORS.gold}" />
  <text x="${decisionColX + (DECISION_COL_WIDTH - 20) / 2}" y="${decisionTextBottomY + 45}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" font-weight="700" letter-spacing="1" fill="${COLORS.navy}">${escapeXml(badge)}</text>

  <!-- relevant sections footer -->
  <text x="${MARGIN_X}" y="${footerTopY + 26}" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" fill="${COLORS.ink}">RELEVANT LAWS / SECTIONS:</text>
  <line x1="${MARGIN_X + 360}" y1="${footerTopY + 19}" x2="${WIDTH - MARGIN_X}" y2="${footerTopY + 19}" stroke="${COLORS.gold}" stroke-width="1.5" />
  ${sectionsSvg || `<text x="${MARGIN_X}" y="${footerTopY + footerHeaderHeight + 20}" font-family="Georgia, serif" font-size="18" fill="${COLORS.ink}">No sections recorded.</text>`}
</svg>`;
}

/**
 * Generate a judgement summary card as a PNG. Pure SVG, no AI/network
 * call — instant, 100% legible, and every field is shown in full (the
 * canvas grows to fit the content instead of truncating it).
 * Returns { ok, base64, mimeType } or { ok: false, error }.
 */
export async function generateJudgementImage(caseData) {
  if (!caseData || (!caseData.judgementTitle && !caseData.caseNumber)) {
    return {
      ok: false,
      error: "No case details provided to generate an image from.",
    };
  }

  try {
    const svg = buildSvg(caseData);
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer();
    return {
      ok: true,
      base64: buffer.toString("base64"),
      mimeType: "image/png",
    };
  } catch (err) {
    console.error("[imageService] generateJudgementImage error:", err.message);
    return {
      ok: false,
      error: "Failed to generate the judgement image. Please try again.",
    };
  }
}

export async function checkImageAIAvailability() {
  return { available: true };
}
