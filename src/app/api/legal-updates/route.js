import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";

// ─── Per-court in-memory cache (15 min TTL) ──────────────────────────────────
const CACHE_TTL = 15 * 60 * 1000;
const courtCache = {};

// ─── Court registry ───────────────────────────────────────────────────────────
// Each entry describes a Pakistani court, its scrape URL, and its status.
// status: "live" = scraper works | "blocked" = 403/robots | "js-only" = needs browser
const COURTS = {
  shc: {
    name: "Sindh High Court",
    province: "Sindh",
    short: "SHC",
    url: "https://caselaw.shc.gov.pk/caselaw/public/home",
    status: "live",
    scraper: scrapeSHC,
  },
  ihc: {
    name: "Islamabad High Court",
    province: "Islamabad",
    short: "IHC",
    url: "https://mis.ihc.gov.pk/frmJgmnt",
    status: "live",
    scraper: scrapeIHC,
  },
  lhc: {
    name: "Lahore High Court",
    province: "Punjab",
    short: "LHC",
    url: "https://data.lhc.gov.pk/reported_judgments/judgments_approved_for_reporting",
    status: "blocked", // Returns 403
    scraper: null,
    note: "LHC blocks automated access (HTTP 403). Use their website directly.",
    website: "https://lhc.gov.pk/reported_judgments",
  },
  phc: {
    name: "Peshawar High Court",
    province: "KPK",
    short: "PHC",
    url: "https://peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php",
    status: "live",
    scraper: scrapePHC,
  },
  bhc: {
    name: "High Court of Balochistan",
    province: "Balochistan",
    short: "BHC",
    url: "https://portal.bhc.gov.pk/judgments/",
    status: "js-only", // React SPA — needs browser JS to render
    scraper: null,
    note: "BHC portal is a JavaScript SPA. Cannot be scraped server-side without a headless browser.",
    website: "https://portal.bhc.gov.pk/judgments/",
  },
  scp: {
    name: "Supreme Court of Pakistan",
    province: "Federal",
    short: "SCP",
    url: "https://scp.gov.pk/judgments",
    status: "live",
    scraper: scrapeSCP,
  },
};

// ─── helper ───────────────────────────────────────────────────────────────────
async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LexisPortal/1.0; legal research tool)",
      Accept: "text/html,application/xhtml+xml",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.text();
}

function cleanText(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

// ─── Sindh High Court scraper ─────────────────────────────────────────────────
// Same logic as previous route — works well.
async function scrapeSHC() {
  const html = await fetchHtml(COURTS.shc.url);
  const blockRegex = /<blockquote>([\s\S]*?)<\/blockquote>/gi;
  const blocks = [...html.matchAll(blockRegex)];
  const results = [];

  for (const block of blocks) {
    const inner = block[1];
    const aMatch = inner.match(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!aMatch) continue;
    const title = cleanText(aMatch[2]);
    const sourceUrl = aMatch[1]?.trim() || null;
    const citationMatch = inner.match(/(\d{4}\s+SHC\s+\w+\s+\d+)/i);
    const matterMatch = inner.match(/Matter:-\s*<strong>(.*?)<\/strong>/i);
    const judgeMatch = inner.match(/Hon['']ble\s+([\s\S]*?)(?=Source:|Downloads|Order Date)/i);
    const dateMatch = inner.match(/Order Date:\s*[\r\n\s]*([\d]{2}-[A-Z]{3}-[\d]{2,4})/i);
    const dlMatch = inner.match(/Downloads\s+(\d+)/i);
    const approved = /Approved for Reporting/i.test(inner);

    if (!title) continue;
    results.push({
      court: "SHC",
      courtFull: "Sindh High Court",
      province: "Sindh",
      title,
      citation: citationMatch?.[1]?.trim() || null,
      matter: matterMatch ? cleanText(matterMatch[1]) : null,
      judge: judgeMatch ? cleanText(judgeMatch[1]).replace(/Source:.*/, "").trim() : null,
      orderDate: dateMatch ? new Date(dateMatch[1].replace(/-/g, " ")).toISOString() : null,
      downloads: dlMatch ? parseInt(dlMatch[1]) : 0,
      approved,
      sourceUrl: sourceUrl?.startsWith("http") ? sourceUrl : null,
    });
  }
  return results;
}

// ─── Islamabad High Court scraper ─────────────────────────────────────────────
// IHC judgment list page at mis.ihc.gov.pk/frmJgmnt — server-rendered HTML table
async function scrapeIHC() {
  const html = await fetchHtml(COURTS.ihc.url);
  const results = [];

  // Try to find table rows with judgment data
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [...html.matchAll(rowRegex)];

  for (const row of rows) {
    const inner = row[1];
    const cells = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      cleanText(m[1])
    );
    if (cells.length < 2) continue;

    // Attempt to extract a PDF link
    const linkMatch = inner.match(/href="([^"]*\.pdf[^"]*)"/i);
    const sourceUrl = linkMatch
      ? `https://mis.ihc.gov.pk${linkMatch[1]}`
      : null;

    const title = cells.find((c) => c.length > 15 && /vs|v\/s|versus/i.test(c)) || cells[1];
    if (!title || title.length < 5) continue;

    // Citation pattern: "W.P. No. XXXX/YYYY" or "Crl. No."
    const citation = cells.find((c) => /No\.\s*\d+/i.test(c)) || null;
    const dateCell = cells.find((c) =>
      /\d{2}[\/\-]\d{2}[\/\-]\d{2,4}/.test(c)
    );

    results.push({
      court: "IHC",
      courtFull: "Islamabad High Court",
      province: "Islamabad",
      title: title.substring(0, 200),
      citation,
      matter: null,
      judge: null,
      orderDate: dateCell ? new Date(dateCell).toISOString() : null,
      downloads: 0,
      approved: /approved/i.test(inner),
      sourceUrl,
    });
  }

  // If table parse fails, try a simpler link extraction
  if (results.length === 0) {
    const linkRegex = /<a[^>]*href="([^"]*attachments[^"]*\.pdf[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const links = [...html.matchAll(linkRegex)];
    for (const link of links) {
      const title = cleanText(link[2]);
      if (!title || title.length < 5) continue;
      results.push({
        court: "IHC",
        courtFull: "Islamabad High Court",
        province: "Islamabad",
        title,
        citation: null,
        matter: null,
        judge: null,
        orderDate: null,
        downloads: 0,
        approved: false,
        sourceUrl: `https://mis.ihc.gov.pk${link[1]}`,
      });
    }
  }

  return results;
}

// ─── Peshawar High Court scraper ──────────────────────────────────────────────
// PHC has a reported judgments page with searchable results
async function scrapePHC() {
  const html = await fetchHtml(COURTS.phc.url);
  const results = [];

  // PHC page typically has judgment entries in divs or paragraphs
  const entryRegex = /<p[^>]*class="[^"]*judgment[^"]*"[^>]*>([\s\S]*?)<\/p>/gi;
  let entries = [...html.matchAll(entryRegex)];

  // Fallback: grab any paragraph with legal case-like content
  if (entries.length === 0) {
    const paraRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
    entries = [...html.matchAll(paraRegex)].filter((m) =>
      /vs|v\/s|versus|W\.P\.|Cr\.|PLJ|PLD|SCMR/i.test(m[1])
    );
  }

  for (const entry of entries.slice(0, 20)) {
    const inner = entry[1];
    const title = cleanText(inner).substring(0, 250);
    if (!title || title.length < 10) continue;

    const citation = title.match(/(\d{4}\s+(?:PLJ|PLD|SCMR|PCrLJ)\s+[\w\s]+\d+)/i)?.[1] || null;
    const linkMatch = inner.match(/href="([^"]+\.pdf[^"]*)"/i);

    results.push({
      court: "PHC",
      courtFull: "Peshawar High Court",
      province: "KPK",
      title,
      citation,
      matter: null,
      judge: null,
      orderDate: null,
      downloads: 0,
      approved: true,
      sourceUrl: linkMatch
        ? `https://peshawarhighcourt.gov.pk${linkMatch[1]}`
        : "https://peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php",
    });
  }

  return results;
}

// ─── Supreme Court scraper ────────────────────────────────────────────────────
async function scrapeSCP() {
  // SCP hosts individual judgment PDFs — fetch their judgments listing page
  const html = await fetchHtml("https://scp.gov.pk/judgments");
  const results = [];

  const linkRegex = /<a[^>]*href="([^"]*files\/judgments[^"]*\.pdf[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const links = [...html.matchAll(linkRegex)];

  for (const link of links.slice(0, 20)) {
    const title = cleanText(link[2]);
    if (!title || title.length < 5) continue;
    const citation = title.match(/(\d{4}\s+SCMR\s+\d+|PLD\s+\d{4}\s+SC\s+\d+)/i)?.[1] || null;

    results.push({
      court: "SCP",
      courtFull: "Supreme Court of Pakistan",
      province: "Federal",
      title,
      citation,
      matter: null,
      judge: null,
      orderDate: null,
      downloads: 0,
      approved: true,
      sourceUrl: link[1].startsWith("http") ? link[1] : `https://scp.gov.pk${link[1]}`,
    });
  }

  return results;
}

// ─── Fetch with cache ─────────────────────────────────────────────────────────
async function fetchCourt(courtKey) {
  const court = COURTS[courtKey];
  if (!court || !court.scraper) {
    return {
      court: courtKey.toUpperCase(),
      courtFull: court?.name || courtKey,
      province: court?.province || "Unknown",
      status: court?.status || "unknown",
      note: court?.note || "No scraper available.",
      website: court?.website || court?.url,
      data: [],
      error: court?.note || "Not scrapable",
    };
  }

  const cached = courtCache[courtKey];
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
    return { ...cached, source: "cache" };
  }

  try {
    const data = await court.scraper();
    const result = {
      court: courtKey.toUpperCase(),
      courtFull: court.name,
      province: court.province,
      status: "live",
      data,
      total: data.length,
      fetchedAt: Date.now(),
      source: "live",
    };
    courtCache[courtKey] = result;
    return result;
  } catch (err) {
    // Return stale cache on error
    if (cached?.data?.length > 0) {
      return { ...cached, source: "stale", error: err.message };
    }
    return {
      court: courtKey.toUpperCase(),
      courtFull: court.name,
      province: court.province,
      status: "error",
      data: [],
      total: 0,
      error: err.message,
      website: court.url,
    };
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────
// GET /api/legal-updates?courts=shc,ihc,phc&limit=10
// GET /api/legal-updates?courts=all&limit=20
export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "15"), 50);
  const courtParam = searchParams.get("courts") || "shc,ihc";

  const requestedKeys =
    courtParam === "all"
      ? Object.keys(COURTS)
      : courtParam.split(",").map((c) => c.trim().toLowerCase());

  // Fetch all requested courts in parallel
  const results = await Promise.allSettled(
    requestedKeys.map((key) => fetchCourt(key))
  );

  const courtResults = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    return {
      court: requestedKeys[i].toUpperCase(),
      status: "error",
      error: r.reason?.message || "Unknown error",
      data: [],
    };
  });

  // Merge and interleave all judgment data (round-robin by court)
  const allJudgments = [];
  const maxLen = Math.max(...courtResults.map((r) => r.data?.length || 0));
  for (let i = 0; i < maxLen; i++) {
    for (const cr of courtResults) {
      if (cr.data?.[i]) allJudgments.push(cr.data[i]);
    }
  }

  // Court status summary (useful for UI to show which courts are live)
  const courtSummary = courtResults.map((r) => ({
    court: r.court,
    courtFull: r.courtFull,
    province: r.province,
    status: r.status || (r.data?.length > 0 ? "live" : "error"),
    count: r.data?.length || 0,
    note: r.note || null,
    website: r.website || null,
    error: r.error || null,
  }));

  // Info on blocked/JS-only courts
  const unavailable = Object.entries(COURTS)
    .filter(([, c]) => c.status !== "live")
    .map(([key, c]) => ({
      court: key.toUpperCase(),
      courtFull: c.name,
      province: c.province,
      status: c.status,
      reason: c.note,
      website: c.website || c.url,
    }));

  return NextResponse.json({
    success: true,
    data: allJudgments.slice(0, limit),
    total: allJudgments.length,
    courts: courtSummary,
    unavailable,
    fetchedAt: new Date().toISOString(),
  });
});