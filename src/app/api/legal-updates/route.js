import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";

// In-memory cache (15 min TTL)
const CACHE_TTL_MS = 15 * 60 * 1000;
let cache = { data: [], fetchedAt: 0, courts: [] };

const DEFAULT_TIMEOUT_MS = 15000;
const BASE_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Accept-Language": "en-PK,en-US;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
};

const COURT_META = {
  SHC: {
    courtFull: "Sindh High Court",
    province: "Sindh",
    website: "https://caselaw.shc.gov.pk/caselaw/public/home",
  },
  LHC: {
    courtFull: "Lahore High Court",
    province: "Punjab",
    website: "https://lhc.gov.pk/reported_judgments",
  },
  SCP: {
    courtFull: "Supreme Court of Pakistan",
    province: "Federal",
    website: "https://scp.gov.pk/LatestJudgments",
  },
  IHC: {
    courtFull: "Islamabad High Court",
    province: "Islamabad",
    website: "https://mis.ihc.gov.pk/frmJgmnt?jgs=1",
  },
  PHC: {
    courtFull: "Peshawar High Court",
    province: "KPK",
    website: "https://peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php",
  },
  BHC: {
    courtFull: "High Court of Balochistan",
    province: "Balochistan",
    website: "https://bhc.gov.pk/beta/resources/judgments",
  },
};

function stripTags(str) {
  if (!str) return "";
  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePkDate(raw) {
  if (!raw) return null;
  const cleaned = raw.replace(/[\s,]+/g, " ").trim();
  const d = new Date(cleaned.replace(/-/g, " "));
  return isNaN(d) ? null : d.toISOString();
}

function absolutize(href, base) {
  if (!href) return null;
  if (href.startsWith("http")) return href;
  return `${base.replace(/\/+$/, "")}/${href.replace(/^\/+/, "")}`;
}

async function fetchHtml(url, { referer } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const headersPrimary = {
      ...BASE_HEADERS,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      ...(referer ? { Referer: referer } : {}),
    };

    let res = await fetch(url, {
      headers: headersPrimary,
      redirect: "follow",
      next: { revalidate: 0 },
      signal: controller.signal,
    });

    if (res.status === 406 || res.status === 403) {
      const headersFallback = {
        ...BASE_HEADERS,
        Accept: "*/*",
        ...(referer ? { Referer: referer } : {}),
      };
      res = await fetch(url, {
        headers: headersFallback,
        redirect: "follow",
        next: { revalidate: 0 },
        signal: controller.signal,
      });
    }

    if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
    return res.text();
  } finally {
    clearTimeout(timer);
  }
}

// 1) Sindh High Court - FIXED
async function fetchSHC() {
  try {
    const html = await fetchHtml(COURT_META.SHC.website, {
      referer: "https://caselaw.shc.gov.pk/",
    });

    const results = [];

    // More flexible pattern for SHC judgments
    const judgmentRegex =
      /<div[^>]*class="[^"]*judgment[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
    const blocks = [...html.matchAll(judgmentRegex)];

    // Fallback to blockquote if div pattern fails
    const blocksToParse =
      blocks.length > 0
        ? blocks
        : [...html.matchAll(/<blockquote>([\s\S]*?)<\/blockquote>/gi)];

    for (const block of blocksToParse) {
      const inner = block[1];

      // Extract title and URL
      const titleMatch = inner.match(
        /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
      );
      if (!titleMatch) continue;

      const rawTitle = stripTags(titleMatch[2]);
      const sourceUrl = titleMatch[1]?.trim() || "";

      // Extract citation
      const citationMatch =
        inner.match(/(\d{4}\s+SHC\s+\w+\s+\d+)/i) ||
        inner.match(/(\d{4}\s+PLD\s+\w+\s+\d+)/i) ||
        inner.match(/(\d{4}\s+PCrLJ\s+\d+)/i);

      // Extract matter/category
      const matterMatch =
        inner.match(/Matter:[-:\s]*<strong>([^<]+)<\/strong>/i) ||
        inner.match(/Category:[-:\s]*([^<]+)/i);

      // Extract judge
      const judgeMatch =
        inner.match(/Hon['']ble\s+([^<]+?)(?=<|$)/i) ||
        inner.match(/Judge:[-:\s]*([^<]+)/i);

      // Extract date
      const dateMatch =
        inner.match(/Date:[-:\s]*([\d]{2}[-/][A-Za-z]{3}[-/][\d]{2,4})/i) ||
        inner.match(/Order Date:[-:\s]*([\d]{2}[-/][A-Za-z]{3}[-/][\d]{2,4})/i);

      const dlMatch = inner.match(/Downloads?\s+(\d+)/i);
      const approved = /Approved for Reporting/i.test(inner);

      if (!rawTitle || rawTitle.length < 5) continue;

      // Determine bench
      let bench = null;
      if (/Circuit at ([\w\s]+)/i.test(rawTitle)) {
        bench = rawTitle.match(/Circuit at ([\w\s]+)/i)[1].trim();
      } else if (/Karachi/i.test(rawTitle)) bench = "Karachi";
      else if (/Hyderabad/i.test(rawTitle)) bench = "Hyderabad";
      else if (/Sukkur/i.test(rawTitle)) bench = "Sukkur";

      const courtFull = bench
        ? `Sindh High Court - ${bench} Bench`
        : "Sindh High Court";

      results.push({
        id: sourceUrl || rawTitle,
        title: rawTitle.substring(0, 220),
        citation: citationMatch ? citationMatch[1].trim() : null,
        matter: matterMatch ? stripTags(matterMatch[1]) : null,
        judge: judgeMatch ? stripTags(judgeMatch[1]) : null,
        court: courtFull,
        courtFull,
        courtAbbr: "SHC",
        province: "Sindh",
        orderDate: parsePkDate(dateMatch?.[1] ?? null),
        downloads: dlMatch ? parseInt(dlMatch[1]) : 0,
        approved,
        sourceUrl: sourceUrl.startsWith("http")
          ? sourceUrl
          : sourceUrl
            ? `https://caselaw.shc.gov.pk${sourceUrl}`
            : null,
      });
    }

    return results;
  } catch (error) {
    console.error("SHC fetch error:", error);
    return [];
  }
}

// 2) Lahore High Court - IMPROVED with multiple strategies
async function fetchLHC() {
  try {
    const urls = [
      "https://data.lhc.gov.pk/reported_judgments/judgments_approved_for_reporting",
      "https://lhc.gov.pk/reported_judgments",
      "https://lhc.gov.pk/judgments/reported",
    ];

    let html = null;
    let usedUrl = null;
    for (const url of urls) {
      try {
        html = await fetchHtml(url, { referer: "https://lhc.gov.pk/" });
        if (
          html &&
          (html.includes("judgment") ||
            html.includes("Judgment") ||
            html.includes("<tr"))
        ) {
          usedUrl = url;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!html) {
      console.log("LHC: No HTML fetched from any URL");
      return [];
    }

    const results = [];

    // Try multiple extraction patterns
    let rows = [];

    // Pattern 1: Standard table rows
    const tableRows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    if (tableRows.length > 0) rows = tableRows;

    // Pattern 2: Div-based judgments
    if (rows.length === 0) {
      const divJudgments = [
        ...html.matchAll(
          /<div[^>]*class="[^"]*judgment[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        ),
      ];
      rows = divJudgments;
    }

    // Pattern 3: List items
    if (rows.length === 0) {
      const listItems = [
        ...html.matchAll(/<li[^>]*>([\s\S]*?judgment[\s\S]*?)<\/li>/gi),
      ];
      rows = listItems;
    }

    for (const row of rows) {
      const inner = row[1];

      // Skip if no content
      if (!inner || inner.length < 20) continue;

      // Extract link and title
      const linkMatch = inner.match(
        /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
      );
      if (!linkMatch) continue;

      const title = stripTags(linkMatch[2]);
      const href = linkMatch[1]?.trim() || "";

      if (!title || title.length < 5) continue;

      // Extract citation
      const citation =
        inner.match(/(\d{4}\s+LHC\s+\d+)/i)?.[1]?.trim() ??
        inner.match(/(\d{4}\s+PLD\s+Lahore\s+\d+)/i)?.[1]?.trim() ??
        inner.match(/(\d{4}\s+MLD\s+\d+)/i)?.[1]?.trim() ??
        null;

      // Extract date
      let dateCell = null;
      const dateMatch =
        inner.match(/(\d{2}[\/-]\d{2}[\/-]\d{2,4})/) ||
        inner.match(/(\d{2}-[A-Za-z]{3}-\d{2,4})/);
      if (dateMatch) dateCell = dateMatch[1];

      // Determine bench
      let bench = null;
      const lower = (title + inner).toLowerCase();
      if (lower.includes("rawalpindi")) bench = "Rawalpindi";
      else if (lower.includes("multan")) bench = "Multan";
      else if (lower.includes("bahawalpur")) bench = "Bahawalpur";

      const courtFull = bench
        ? `Lahore High Court - ${bench} Bench`
        : "Lahore High Court";

      // Build source URL
      let sourceUrl = null;
      if (href) {
        if (href.startsWith("http")) {
          sourceUrl = href;
        } else if (usedUrl) {
          const baseUrl = usedUrl.split("/").slice(0, 3).join("/");
          sourceUrl = absolutize(href, baseUrl);
        } else {
          sourceUrl = absolutize(href, "https://lhc.gov.pk");
        }
      }

      results.push({
        id: href || title,
        title: title.substring(0, 220),
        citation,
        matter: null,
        judge: null,
        court: courtFull,
        courtFull,
        courtAbbr: "LHC",
        province: "Punjab",
        orderDate: parsePkDate(dateCell),
        downloads: 0,
        approved: /approved|reported/i.test(inner),
        sourceUrl,
      });
    }

    console.log(`LHC: Found ${results.length} judgments`);
    return results;
  } catch (error) {
    console.error("LHC fetch error:", error);
    return [];
  }
}

// 3) Supreme Court - WORKING (keep as is)
async function fetchSCP() {
  // ... existing SCP code remains the same ...
  const html = await fetchHtml(COURT_META.SCP.website, {
    referer: "https://scp.gov.pk/",
  });

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const results = [];

  for (const row of [...html.matchAll(rowRegex)]) {
    const inner = row[1];
    if (!inner.includes("<td")) continue;

    const cells = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      stripTags(m[1]),
    );
    if (cells.length < 5) continue;

    const title = cells[3] || cells[2];
    if (!title || title.length < 5) continue;

    const dateCell = cells[5] || null;
    const citation = cells[7] || cells[8] || null;
    const linkMatch = inner.match(/href="([^"]+\.pdf[^"]*)"/i);
    const sourceUrl = linkMatch
      ? absolutize(linkMatch[1], "https://scp.gov.pk")
      : null;

    results.push({
      id: sourceUrl || title,
      title: title.substring(0, 220),
      citation,
      matter: cells[1] || null,
      judge: cells[4] || null,
      court: "Supreme Court of Pakistan",
      courtFull: "Supreme Court of Pakistan",
      courtAbbr: "SCP",
      province: "Federal",
      orderDate: parsePkDate(dateCell),
      downloads: 0,
      approved: true,
      sourceUrl,
    });
  }

  return results;
}

// 4) Islamabad High Court - IMPROVED
async function fetchIHC() {
  try {
    const urls = [
      "https://mis.ihc.gov.pk/frmJgmnt?jgs=1&pg=1",
      "https://mis.ihc.gov.pk/frmJgmnt?jgs=1",
      "https://mis.ihc.gov.pk/judgments",
      "https://ihc.gov.pk/judgments",
    ];
    
    let html = null;
    for (const url of urls) {
      try {
        html = await fetchHtml(url, { referer: "https://ihc.gov.pk/" });
        if (html && (html.includes("judgment") || html.includes("Judgment") || html.includes(".pdf"))) {
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!html) {
      console.log("IHC: No HTML fetched");
      return [];
    }
    
    const results = [];
    
    // Try multiple patterns for IHC
    const patterns = [
      // Pattern 1: Table rows with links
      {
        regex: /<tr[^>]*>([\s\S]*?)<\/tr>/gi,
        extract: (inner) => {
          const linkMatch = inner.match(/<a[^>]*href="([^"]*\.pdf[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
          if (!linkMatch) return null;
          return {
            title: stripTags(linkMatch[2]),
            href: linkMatch[1],
            date: inner.match(/(\d{2}[-/]\d{2}[-/]\d{2,4})/)?.[1],
            citation: inner.match(/(?:Citation|No\.):?\s*([^<]+)/i)?.[1]?.trim()
          };
        }
      },
      // Pattern 2: Div containers
      {
        regex: /<div[^>]*class="[^"]*item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
        extract: (inner) => {
          const linkMatch = inner.match(/<a[^>]*href="([^"]*\.pdf[^"]*)"[^>]*>([\s\S]*?)<\/a>/i);
          if (!linkMatch) return null;
          return {
            title: stripTags(linkMatch[2]),
            href: linkMatch[1],
            date: inner.match(/(\d{2}[-/]\d{2}[-/]\d{2,4})/)?.[1],
            citation: null
          };
        }
      }
    ];
    
    for (const pattern of patterns) {
      const matches = [...html.matchAll(pattern.regex)];
      for (const match of matches) {
        const extracted = pattern.extract(match[1]);
        if (!extracted) continue;
        
        const { title, href, date, citation } = extracted;
        if (!title || title.length < 5) continue;
        
        results.push({
          id: href || title,
          title: title.substring(0, 200),
          citation: citation || null,
          matter: null,
          judge: null,
          court: "Islamabad High Court",
          courtFull: "Islamabad High Court",
          courtAbbr: "IHC",
          province: "Islamabad",
          orderDate: parsePkDate(date),
          downloads: 0,
          approved: true,
          sourceUrl: href?.startsWith("http") ? href : href ? `https://mis.ihc.gov.pk${href}` : null,
        });
      }
      
      if (results.length > 0) break;
    }
    
    console.log(`IHC: Found ${results.length} judgments`);
    return results.slice(0, 30);
  } catch (error) {
    console.error("IHC fetch error:", error);
    return [];
  }
}


// 5) Peshawar High Court - IMPROVED
async function fetchPHC() {
  try {
    const urls = [
      "https://peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php",
      "https://peshawarhighcourt.gov.pk/PHCCMS/judgments.php",
      "https://peshawarhighcourt.gov.pk/judgments",
    ];
    
    let html = null;
    for (const url of urls) {
      try {
        html = await fetchHtml(url, { referer: "https://peshawarhighcourt.gov.pk/" });
        if (html && (html.includes("judgment") || html.includes("Judgment") || html.includes("<tr"))) {
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (!html) {
      console.log("PHC: No HTML fetched");
      return [];
    }
    
    const results = [];
    
    // Extract all links that look like judgments
    const allLinks = [...html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)];
    
    for (const link of allLinks) {
      const href = link[1];
      const linkText = stripTags(link[2]);
      
      // Filter for judgment links
      if (!href || (!href.includes('.pdf') && !linkText.toLowerCase().includes('judgment'))) {
        continue;
      }
      
      if (!linkText || linkText.length < 5) continue;
      
      // Find surrounding context for additional info
      const surrounding = link[0] + (link.input?.substring(Math.max(0, link.index - 200), link.index + 500) || '');
      
      // Extract citation
      const citation = 
        surrounding.match(/(\d{4}\s+PHC\s+\d+)/i)?.[1]?.trim() ??
        surrounding.match(/(\d{4}\s+PCrLJ\s+\d+)/i)?.[1]?.trim() ??
        surrounding.match(/(\d{4}\s+PLD\s+\w+\s+\d+)/i)?.[1]?.trim();
      
      // Extract date
      const dateMatch = surrounding.match(/(\d{2}[-/]\d{2}[-/]\d{2,4})/);
      
      // Determine bench
      let bench = null;
      const lower = (linkText + surrounding).toLowerCase();
      if (lower.includes("abbottabad")) bench = "Abbottabad";
      else if (lower.includes("mingora") || lower.includes("swat")) bench = "Mingora";
      else if (lower.includes("d.i.khan")) bench = "D.I. Khan";
      
      const courtFull = bench ? `Peshawar High Court - ${bench} Bench` : "Peshawar High Court";
      
      results.push({
        id: href || linkText,
        title: linkText.substring(0, 220),
        citation,
        matter: null,
        judge: null,
        court: courtFull,
        courtFull,
        courtAbbr: "PHC",
        province: "KPK",
        orderDate: parsePkDate(dateMatch?.[1] ?? null),
        downloads: 0,
        approved: /approved|reported/i.test(surrounding),
        sourceUrl: href?.startsWith("http") ? href : href ? `https://peshawarhighcourt.gov.pk${href}` : null,
      });
    }
    
    console.log(`PHC: Found ${results.length} judgments`);
    return results.slice(0, 30);
  } catch (error) {
    console.error("PHC fetch error:", error);
    return [];
  }
}

// 6) High Court of Balochistan - FIXED (corrected regex)
async function fetchBHC() {
  try {
    const urls = [
      "https://bhc.gov.pk/beta/resources/judgments",
      "https://bhc.gov.pk/resources/judgments",
      COURT_META.BHC.website,
    ];

    let html = null;
    for (const url of urls) {
      try {
        html = await fetchHtml(url, { referer: "https://bhc.gov.pk/" });
        if (html && (html.includes("judgment") || html.includes("Judgment")))
          break;
      } catch {
        continue;
      }
    }

    if (!html) return [];

    const results = [];

    // Look for judgment entries
    const judgmentPatterns = [
      /<div[^>]*class="[^"]*judgment[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<article[^>]*>([\s\S]*?)<\/article>/gi,
      /<li[^>]*>([\s\S]*?)(?:judgment|case)[\s\S]*?<\/li>/gi,
    ];

    let entries = [];
    for (const pattern of judgmentPatterns) {
      entries = [...html.matchAll(pattern)];
      if (entries.length > 0) break;
    }

    // If no structured entries found, extract links to PDFs
    if (entries.length === 0) {
      const pdfLinks = [...html.matchAll(/href="([^"]*\.pdf[^"]*)"/gi)];
      for (const link of pdfLinks.slice(0, 20)) {
        const url = absolutize(link[1], "https://bhc.gov.pk");
        const title =
          url
            .split("/")
            .pop()
            ?.replace(/\.pdf$/i, "") || "Judgment";

        results.push({
          id: url,
          title: title.substring(0, 220),
          citation: null,
          matter: null,
          judge: null,
          court: "High Court of Balochistan",
          courtFull: "High Court of Balochistan",
          courtAbbr: "BHC",
          province: "Balochistan",
          orderDate: null,
          downloads: 0,
          approved: true,
          sourceUrl: url,
        });
      }
    } else {
      // Parse structured entries
      for (const entry of entries) {
        const inner = entry[1];

        // Extract title - FIXED: removed extra parenthesis
        const titleMatch =
          inner.match(/<a[^>]*>([\s\S]*?)<\/a>/i) ||
          inner.match(/<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
        const title = titleMatch
          ? stripTags(titleMatch[1])
          : stripTags(inner).substring(0, 100);

        if (!title || title.length < 10) continue;

        // Extract citation
        const citationMatch =
          inner.match(/(?:Citation|Cite):\s*([^<]+)/i) ||
          inner.match(/(\d{4}\s+(?:PLC|CLD|MLD|YLR|PCrLJ|PTD|PLD)\s+\d+)/i);

        // Extract link
        const linkMatch = inner.match(/href="([^"]*\.pdf[^"]*)"/i);
        const sourceUrl = linkMatch
          ? absolutize(linkMatch[1], "https://bhc.gov.pk")
          : null;

        results.push({
          id: sourceUrl || title,
          title: title.substring(0, 220),
          citation: citationMatch ? citationMatch[1].trim() : null,
          matter: null,
          judge: null,
          court: "High Court of Balochistan",
          courtFull: "High Court of Balochistan",
          courtAbbr: "BHC",
          province: "Balochistan",
          orderDate: null,
          downloads: 0,
          approved: true,
          sourceUrl,
        });
      }
    }

    return results.slice(0, 30); // Limit results
  } catch (error) {
    console.error("BHC fetch error:", error);
    return [];
  }
}

async function fetchAllCourts() {
  const fetchers = [
    { fn: fetchSHC, label: "SHC" },
    { fn: fetchLHC, label: "LHC" },
    { fn: fetchSCP, label: "SCP" },
    { fn: fetchIHC, label: "IHC" },
    { fn: fetchPHC, label: "PHC" },
    { fn: fetchBHC, label: "BHC" },
  ];

  const settled = await Promise.allSettled(fetchers.map(({ fn }) => fn()));

  const all = [];
  const courtSummary = [];

  for (let i = 0; i < settled.length; i++) {
    const result = settled[i];
    const label = fetchers[i].label;
    const meta = COURT_META[label] || {};

    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      all.push(...result.value);
      courtSummary.push({
        court: label,
        courtFull: meta.courtFull || label,
        province: meta.province || null,
        website: meta.website || null,
        status: "live",
        count: result.value.length,
      });
    } else {
      courtSummary.push({
        court: label,
        courtFull: meta.courtFull || label,
        province: meta.province || null,
        website: meta.website || null,
        status: "error",
        count: 0,
        error: result.reason?.message || "Failed to fetch",
      });
    }
  }

  // Remove duplicates
  const seen = new Set();
  const unique = all.filter((j) => {
    if (!j.id) return true;
    if (seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });

  // Sort by date (newest first)
  unique.sort((a, b) => {
    if (a.orderDate && b.orderDate)
      return new Date(b.orderDate) - new Date(a.orderDate);
    if (a.orderDate) return -1;
    if (b.orderDate) return 1;
    return 0;
  });

  return { judgments: unique, courtSummary };
}

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 60);

  // Support both `courts=shc,ihc` and legacy `court=SHC`
  const courtsParam = searchParams.get("courts");
  const legacyCourt = searchParams.get("court");
  const requested = courtsParam
    ? courtsParam.split(",").map((c) => c.trim().toUpperCase())
    : legacyCourt
      ? [legacyCourt.trim().toUpperCase()]
      : ["SHC", "IHC", "PHC", "LHC", "BHC", "SCP"];

  // Return from cache if still valid
  if (Date.now() - cache.fetchedAt < CACHE_TTL_MS && cache.data.length > 0) {
    const data = cache.data.filter((j) => requested.includes(j.courtAbbr));
    return NextResponse.json({
      success: true,
      source: "cache",
      data: data.slice(0, limit),
      total: data.length,
      courts: cache.courts,
      unavailable: cache.courts.filter((c) => c.status !== "live"),
      fetchedAt: new Date(cache.fetchedAt).toISOString(),
    });
  }

  try {
    const { judgments, courtSummary } = await fetchAllCourts();
    cache = { data: judgments, fetchedAt: Date.now(), courts: courtSummary };

    const data = judgments.filter((j) => requested.includes(j.courtAbbr));

    return NextResponse.json({
      success: true,
      source: "live",
      data: data.slice(0, limit),
      total: data.length,
      courts: courtSummary,
      unavailable: courtSummary.filter((c) => c.status !== "live"),
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Main fetch error:", err);
    // Return stale cache if available
    if (cache.data.length > 0) {
      const data = cache.data.filter((j) => requested.includes(j.courtAbbr));
      return NextResponse.json({
        success: true,
        source: "stale-cache",
        data: data.slice(0, limit),
        total: data.length,
        courts: cache.courts,
        unavailable: cache.courts.filter((c) => c.status !== "live"),
        fetchedAt: new Date(cache.fetchedAt).toISOString(),
      });
    }

    return NextResponse.json(
      {
        success: false,
        source: "error",
        data: [],
        error: err.message,
        fetchedAt: new Date().toISOString(),
      },
      { status: 502 },
    );
  }
});
