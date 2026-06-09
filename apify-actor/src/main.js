import { Actor } from "apify";
import puppeteer from "puppeteer";

// --- Configuration ---
const MAX_RETRIES = 2;
const PAGE_TIMEOUT = 60_000;
const STABLE_PAUSE = 3_000;

const COURTS = {
  SCP: {
    courtFull: "Supreme Court of Pakistan",
    province: "Federal",
    url: "https://scp.gov.pk/LatestJudgments",
  },
  LHC: {
    courtFull: "Lahore High Court",
    province: "Punjab",
    url: "https://data.lhc.gov.pk/reported_judgments/judgments_approved_for_reporting",
  },
  IHC: {
    courtFull: "Islamabad High Court",
    province: "Islamabad",
    url: "https://mis.ihc.gov.pk/frmJgmnt?jgs=1",
  },
  PHC: {
    courtFull: "Peshawar High Court",
    province: "KPK",
    url: "https://www.peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php?action=search",
  },
  BHC: {
    courtFull: "High Court of Balochistan",
    province: "Balochistan",
    url: "https://bhc.gov.pk/beta/resources/judgments",
  },
};

// --- Utilities ---

function clean(str) {
  if (!str) return "";
  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePkDate(raw) {
  if (!raw) return null;
  const s = raw
    .toString()
    .replace(/[,\s]+/g, " ")
    .trim();
  // Try direct parse first
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString();
  // DD-MM-YYYY or DD/MM/YYYY
  const m1 = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m1) {
    const d2 = new Date(
      `${m1[3]}-${m1[2].padStart(2, "0")}-${m1[1].padStart(2, "0")}`,
    );
    if (!isNaN(d2.getTime())) return d2.toISOString();
  }
  // DD-MMM-YYYY  e.g. 03-FEB-2026
  const m2 = s.match(/^(\d{1,2})[-/\s]([A-Za-z]{3,})[-/\s](\d{2,4})$/);
  if (m2) {
    const d3 = new Date(`${m2[2]} ${m2[1]} ${m2[3]}`);
    if (!isNaN(d3.getTime())) return d3.toISOString();
  }
  return null;
}

function toAbsolute(href, base) {
  if (!href) return null;
  href = href.trim();
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// --- Browser ---
async function launchBrowser() {
  return puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  );
  page.setDefaultNavigationTimeout(PAGE_TIMEOUT);
  return page;
}

async function getPageHtml(
  browser,
  url,
  waitUntil = "domcontentloaded",
  extraWait = STABLE_PAUSE,
) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const page = await newPage(browser);
    try {
      // Catch timeout separately — Puppeteer still has partial HTML we can use
      await page
        .goto(url, { waitUntil, timeout: PAGE_TIMEOUT })
        .catch(async (err) => {
          if (
            err.message.includes("Navigation timeout") ||
            err.message.includes("net::ERR")
          ) {
            console.warn(`[fetch] Timeout for ${url} — reading partial HTML`);
          } else {
            throw err;
          }
        });
      await sleep(extraWait);
      const html = await page.content();
      const finalUrl = page.url();
      await page.close();
      if (html && html.length > 500) return { html, finalUrl };
      throw new Error("Page content too short");
    } catch (err) {
      await page.close().catch(() => {});
      console.warn(
        `[fetch] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed for ${url}: ${err.message}`,
      );
      if (attempt < MAX_RETRIES) await sleep(3000 * (attempt + 1));
    }
  }
  return null;
}

/**
 * HTTP-only fallback — no browser, no JS execution.
 * LHC is server-rendered so this works and avoids timeout issues.
 */
async function fetchWithHttp(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Referer: new URL(url).origin,
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return { html, finalUrl: res.url || url };
  } catch (err) {
    console.warn(`[http-fetch] Failed for ${url}: ${err.message}`);
    return null;
  }
}

// =============================================================================
// SCP — Supreme Court of Pakistan
// URL: https://scp.gov.pk/LatestJudgments
//
// Table columns (from screenshot):
//   0: Sr.No  1: Case Subject  2: Case No  3: Case Title (link→PDF)
//   4: Author Judge  5: Judgment Date  6: Upload Date  7: Citation  8: SC Citation
//
// The page is JS-rendered — we must wait for the table to appear in the DOM.
// Uses Puppeteer with waitForSelector to ensure data is loaded before reading.
// =============================================================================
async function scrapeSCP(browser, maxResults) {
  console.log("[SCP] Starting…");
  const results = [];
  const meta = COURTS.SCP;

  // SCP is behind Cloudflare — Apify datacenter IPs are blocked.
  // Use Apify residential proxy to bypass Cloudflare.
  let proxyUrl = null;
  try {
    const proxyConf = await Actor.createProxyConfiguration({
      groups: ["RESIDENTIAL"],
    });
    proxyUrl = await proxyConf.newUrl();
    console.log("[SCP] Using residential proxy");
  } catch (err) {
    console.warn(
      `[SCP] Could not get residential proxy: ${err.message} — trying without`,
    );
  }

  // Launch a separate browser with proxy if available
  let scpBrowser = browser;
  let ownBrowser = false;
  if (proxyUrl) {
    try {
      scpBrowser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          `--proxy-server=${proxyUrl}`,
        ],
      });
      ownBrowser = true;
    } catch (err) {
      console.warn(`[SCP] Proxy browser launch failed: ${err.message}`);
      scpBrowser = browser;
    }
  }

  const page = await newPage(scpBrowser);
  let html = null;
  let base = "https://scp.gov.pk";

  try {
    await page
      .goto(meta.url, { waitUntil: "domcontentloaded", timeout: PAGE_TIMEOUT })
      .catch((err) => console.warn(`[SCP] goto: ${err.message}`));

    // Wait for table to appear
    await page
      .waitForSelector("table td, #DataTables_Table_0 td, .table td", {
        timeout: 20_000,
      })
      .catch(() => console.warn("[SCP] table selector timed out"));

    await sleep(3000);
    html = await page.content();
    base = new URL(page.url()).origin;
    console.log(
      `[SCP] HTML size: ${html.length}, is Cloudflare: ${html.includes("Cloudflare")}`,
    );
  } catch (err) {
    console.warn(`[SCP] Error: ${err.message}`);
  } finally {
    await page.close().catch(() => {});
    if (ownBrowser) await scpBrowser.close().catch(() => {});
  }

  if (!html || html.includes("Cloudflare") || html.length < 2000) {
    console.log("[SCP] Blocked or no content — skipping.");
    return results;
  }

  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  console.log(`[SCP] Rows: ${rows.length}`);

  const firstDataRow = rows.find((r) => r[1].includes("<td"));
  if (firstDataRow) {
    const cells = [
      ...firstDataRow[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi),
    ].map((m) => clean(m[1]));
    console.log(
      `[SCP] First row (${cells.length} cells):`,
      JSON.stringify(cells.slice(0, 6)),
    );
  }

  for (const row of rows) {
    const inner = row[1];
    if (!inner.includes("<td")) continue;
    const cells = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      clean(m[1]),
    );
    if (cells.length < 4) continue;
    if (/sr\.?\s*no|case\s*subject|author\s*judge/i.test(cells[0] + cells[1]))
      continue;

    const linkMatch = inner.match(
      /<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
    );
    const href = linkMatch ? toAbsolute(linkMatch[1], base) : null;

    // SCP columns: 0=Sr.No 1=Case Subject 2=Case No 3=Case Title 4=Author Judge 5=Judgment Date 6=Upload Date 7=Citation 8=SC Citation
    const caseTitle = cells[3] || cells[2] || "";
    const caseSubject = cells[1] || null;
    const caseNo = cells[2] || null;
    const judge = cells[4] || null;
    const judgDate = cells[5] || null;
    const citation = cells[7] || cells[8] || null;

    if (!caseTitle || caseTitle.length < 3) continue;

    const judgeClean = judge
      ? judge
          .replace(
            /^(mr\.?\s+justice\s+|justice\s+|hon[''` + "`" + `]?ble\s+)/i,
            "",
          )
          .trim()
      : null;

    results.push({
      title: caseTitle.slice(0, 500),
      court: "SCP",
      courtFull: meta.courtFull,
      courtAbbr: "SCP",
      province: meta.province,
      citation: citation || null,
      judge: judgeClean ? judgeClean.slice(0, 300) : null,
      matter: caseSubject ? caseSubject.slice(0, 200) : null,
      caseNo: caseNo || null,
      orderDate: parsePkDate(judgDate),
      sourceUrl: href,
      approved: true,
      fetchedAt: new Date().toISOString(),
    });
    if (maxResults > 0 && results.length >= maxResults) break;
  }

  console.log(`[SCP] Scraped ${results.length} judgments.`);
  return results;
}

// =============================================================================
// LHC — Lahore High Court
// FINDING: LHC IP-blocks HTTP fetch, but browser DOES load the page (247KB).
// The content is server-rendered HTML — just need to read page.content()
// after the navigation timeout fires, not wait for it to fully "complete".
// =============================================================================
async function scrapeLHC(browser, maxResults) {
  console.log("[LHC] Starting…");
  const results = [];
  const meta = COURTS.LHC;
  const page = await newPage(browser);
  let html = null;
  let base = "https://data.lhc.gov.pk";

  try {
    // Navigate — IGNORE the timeout error, page still loads content
    await page
      .goto(meta.url, { waitUntil: "domcontentloaded", timeout: 90_000 })
      .catch((err) =>
        console.warn(`[LHC] goto: ${err.message} — reading content anyway`),
      );

    // Wait a bit for any lazy-loaded content
    await sleep(5000);

    html = await page.content();
    base = new URL(page.url()).origin;
    console.log(`[LHC] HTML size: ${html.length} chars`);

    // Debug: log structure
    const trCount = (html.match(/<tr/gi) || []).length;
    const liCount = (html.match(/<li/gi) || []).length;
    const linkCount = (html.match(/<a /gi) || []).length;
    console.log(`[LHC] <tr>=${trCount}, <li>=${liCount}, <a>=${linkCount}`);

    // Log first <li> or <ol> content to understand structure
    const firstLi = html.match(/<li[^>]*>([\s\S]{0,500}?)<\/li>/i);
    if (firstLi)
      console.log(`[LHC] First <li>: ${clean(firstLi[0]).slice(0, 200)}`);

    // Log first few PDF links
    const pdfLinks = [
      ...html.matchAll(/href="([^"]*(?:appjudgments|\.pdf)[^"]*)"/gi),
    ].slice(0, 3);
    console.log(`[LHC] PDF/judgment links: ${pdfLinks.length}`);
    pdfLinks.forEach((l) => console.log(`  ${l[1]}`));
  } catch (err) {
    console.error(`[LHC] Error: ${err.message}`);
  } finally {
    await page.close().catch(() => {});
  }

  if (!html || html.length < 1000) {
    console.log("[LHC] No content loaded.");
    return results;
  }

  // ── Parse the list structure ──
  // From screenshot: <ol><li> list where each <li> has:
  //   <a href="https://sys.lhc.gov.pk/appjudgments/...pdf">
  //     Case Title ... by <strong>Mr. Justice Name</strong>
  //   </a>
  //   Tag Line: <i>text</i>
  //   uploaded on: DD-MM-YYYY (in same or sibling element)

  const linkRe =
    /href="([^"]*(?:sys\.lhc\.gov\.pk|appjudgments|lhc\.gov\.pk\/)[^"]*)"/gi;
  const allPdfMatches = [...html.matchAll(linkRe)];
  console.log(`[LHC] Judgment links found: ${allPdfMatches.length}`);

  if (allPdfMatches.length === 0) {
    // Fallback: find ALL <a> tags that could be judgments
    const allLinks = [
      ...html.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi),
    ];
    console.log(`[LHC] All links: ${allLinks.length}`);
    // Log first 5 non-nav links
    let shown = 0;
    for (const lm of allLinks) {
      const t = clean(lm[2]);
      if (t.length > 20 && !/menu|nav|home|about|login/i.test(t)) {
        console.log(`  href=${lm[1].slice(0, 60)} text="${t.slice(0, 80)}"`);
        if (++shown >= 5) break;
      }
    }
    return results;
  }

  // Process each judgment link
  for (const pdfMatch of allPdfMatches) {
    const href = pdfMatch[1];
    const matchIndex = pdfMatch.index;

    // Get context: 200 chars before (for the <a> tag) and 800 after (for tag line + date)
    const before = html.slice(Math.max(0, matchIndex - 200), matchIndex);
    const after = html.slice(matchIndex, matchIndex + 1200);

    // Extract the full <a> tag content
    const aTagMatch = after.match(/href="[^"]*"[^>]*>([\s\S]*?)<\/a>/i);
    if (!aTagMatch) continue;
    const aInnerHtml = aTagMatch[1];
    const fullText = clean(aInnerHtml);
    if (!fullText || fullText.length < 8) continue;

    // Judge from <strong> inside <a>
    const strongMatch = aInnerHtml.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i);
    let judge = strongMatch ? clean(strongMatch[1]) : null;
    if (!judge) {
      const byM = fullText.match(/by\s+(Mr\.?\s+Justice\s+[\w\s]+)/i);
      judge = byM ? byM[1].trim() : null;
    }
    if (judge)
      judge = judge
        .replace(
          /^(mr\.?\s+justice\s+|justice\s+|hon['’]?ble\s+mr\.?\s+justice\s+)/i,
          "",
        )
        .trim();

    // Title: before " by Mr. Justice"
    let title = fullText;
    const byIdx = fullText.search(/\s+by\s+Mr\.?\s+Justice\s+/i);
    if (byIdx > 0) title = fullText.slice(0, byIdx).trim();
    if (!title || title.length < 5) continue;

    // After the </a> tag
    const afterA = after.slice(
      aTagMatch[0].length + after.indexOf(aTagMatch[0]),
    );

    // Tag Line
    const tagM =
      afterA.match(/Tag\s*Line\s*:\s*<[^>]*>([\s\S]*?)<\/[a-z]+>/i) ||
      afterA.match(/Tag\s*Line\s*:\s*([^<]{10,250})/i);
    const matter = tagM ? clean(tagM[1]).slice(0, 200) : null;

    // uploaded on: DD-MM-YYYY
    const dateM = (afterA + before).match(
      /uploaded\s+on\s*:\s*(\d{1,2}[-/]\d{1,2}[-/]\d{4})/i,
    );
    const orderDate = dateM ? parsePkDate(dateM[1]) : null;

    let courtFull = meta.courtFull;
    const lower = title.toLowerCase();
    if (lower.includes("rawalpindi")) courtFull += " – Rawalpindi Bench";
    else if (lower.includes("multan")) courtFull += " – Multan Bench";
    else if (lower.includes("bahawalpur")) courtFull += " – Bahawalpur Bench";

    results.push({
      title: title.slice(0, 500),
      court: "LHC",
      courtFull,
      courtAbbr: "LHC",
      province: meta.province,
      citation: null,
      judge: judge ? judge.slice(0, 300) : null,
      matter,
      orderDate,
      sourceUrl: href.startsWith("http") ? href : toAbsolute(href, base),
      approved: true,
      fetchedAt: new Date().toISOString(),
    });

    if (maxResults > 0 && results.length >= maxResults) break;
  }

  console.log(`[LHC] Scraped ${results.length} judgments.`);
  return results;
}

// =============================================================================
// IHC — Islamabad High Court
// URL: https://mis.ihc.gov.pk/frmJgmnt?jgs=1
//
// Structure (from screenshot) — List of blocks, NOT a table:
//   "<N>_ <Parties> (<Case Type-Number>) On <DD-MMM-YYYY>"
//   "Honourable Mr. Justice <Name>"
//   "[View Judgment] button/link → PDF"
// =============================================================================
async function scrapeIHC(browser, maxResults) {
  console.log("[IHC] Starting…");
  const results = [];
  const meta = COURTS.IHC;

  // IHC is JS-rendered — use networkidle2 with longer wait
  const fetched = await getPageHtml(browser, meta.url, "networkidle2", 5000);
  if (!fetched) {
    console.log("[IHC] Failed to fetch page.");
    return results;
  }

  const { html, finalUrl } = fetched;
  const base = new URL(finalUrl).origin;

  // Each judgment block contains the parties line, judge line, and a "View Judgment" link.
  // Pattern: find all "View Judgment" links and walk backwards in the HTML for context.

  // Try table rows first
  const tableRows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  let usedTable = false;

  if (tableRows.length > 2) {
    for (const row of tableRows) {
      const inner = row[1];
      if (!inner.includes("<td")) continue;
      const cells = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(
        (m) => clean(m[1]),
      );
      if (cells.length < 2) continue;
      if (/sr\.?\s*no|case\s*no|s\.no/i.test(cells[0])) continue;

      const linkMatch = inner.match(/<a[^>]+href="([^"]*)"[^>]*>/i);
      const href = linkMatch ? toAbsolute(linkMatch[1], base) : null;

      // Find judge in cells
      const judgeCell = cells.find((c) => /honourable|justice|judge/i.test(c));
      const judge = judgeCell
        ? judgeCell
            .replace(
              /^(honourable\s+mr\.?\s+justice\s+|mr\.?\s+justice\s+|justice\s+|honourable\s+)/i,
              "",
            )
            .trim()
        : null;

      // Date cell
      const dateCell = cells.find((c) =>
        /\d{2}[-/][A-Za-z]{3}[-/]\d{4}|\d{4}-\d{2}-\d{2}|\d{2}[-/]\d{2}[-/]\d{4}/.test(
          c,
        ),
      );

      // Title = first meaningful cell that's not a number and not a judge
      const title =
        cells.find(
          (c) =>
            c.length > 8 &&
            !/^\d+$/.test(c) &&
            c !== judgeCell &&
            c !== dateCell,
        ) || cells[1];
      if (!title || title.length < 3) continue;

      results.push({
        title: title.slice(0, 500),
        court: "IHC",
        courtFull: meta.courtFull,
        courtAbbr: "IHC",
        province: meta.province,
        citation: null,
        judge: judge ? judge.slice(0, 300) : null,
        matter: null,
        orderDate: parsePkDate(dateCell),
        sourceUrl: href,
        approved: true,
        fetchedAt: new Date().toISOString(),
      });

      usedTable = true;
      if (maxResults > 0 && results.length >= maxResults) break;
    }
  }

  // Fallback: parse the list-style layout visible in screenshot
  if (!usedTable || results.length === 0) {
    // Each item: number + parties text + (CaseType-Number) On Date  then judge on next line
    // Use regex to find judgment blocks by "View Judgment" anchor pattern
    const blockRe = /(\d+)[_.\s]+([\s\S]{10,400}?)(View\s+Judgment|Download)/gi;
    const blocks = [...html.matchAll(blockRe)];

    for (const b of blocks) {
      const blockText = clean(b[2]);

      // Parties: everything before "(Writ Petition..." or "On "
      const partiesMatch = blockText.match(/^([\s\S]+?)\s*\([^)]+\)\s*On\s/i);
      const parties = partiesMatch
        ? partiesMatch[1].trim()
        : blockText.split(" On ")[0].trim();

      // Case number: e.g. (Writ Petition-5459-2025)
      const caseNoMatch = blockText.match(/\(([^)]+)\)/);
      const caseNo = caseNoMatch ? caseNoMatch[1].trim() : null;

      // Date: "On DD-MMM-YYYY"
      const dateMatch = blockText.match(
        /On\s+(\d{1,2}[-/][A-Za-z]{3}[-/]\d{4})/i,
      );
      const orderDate = dateMatch ? parsePkDate(dateMatch[1]) : null;

      // Judge: "Honourable Mr. Justice <Name>"
      const judgeMatch = blockText.match(
        /Honourable\s+Mr\.?\s+Justice\s+([A-Z][a-zA-Z\s]+)/,
      );
      const judge = judgeMatch ? judgeMatch[1].trim() : null;

      // PDF link near this block
      const linkRe = new RegExp(
        `${b[0].slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]{0,500}?href="([^"]+)"`,
        "i",
      );
      const lMatch = html.match(linkRe);
      const href = lMatch ? toAbsolute(lMatch[1], base) : null;

      if (!parties || parties.length < 5) continue;

      results.push({
        title: (parties + (caseNo ? ` (${caseNo})` : "")).slice(0, 500),
        court: "IHC",
        courtFull: meta.courtFull,
        courtAbbr: "IHC",
        province: meta.province,
        citation: null,
        judge: judge ? judge.slice(0, 300) : null,
        matter: caseNo || null,
        orderDate,
        sourceUrl: href,
        approved: true,
        fetchedAt: new Date().toISOString(),
      });

      if (maxResults > 0 && results.length >= maxResults) break;
    }
  }

  console.log(`[IHC] Scraped ${results.length} judgments.`);
  return results;
}

// =============================================================================
// PHC — Peshawar High Court
// URL: https://www.peshawarhighcourt.gov.pk/PHCCMS/reportedJudgments.php?action=search
//
// Table columns (from screenshot):
//   0: S.No  1: Case (title/parties)  2: Remarks (long legal matter text)
//   3: Other Citation  4: PHC Neutral Citation  5: Decision Date
//   6: S.C.Status  7: Category  8: Judgment (PDF icon link)  9: SC Judgment
// =============================================================================
async function scrapePHC(browser, maxResults) {
  console.log("[PHC] Starting…");
  const results = [];
  const meta = COURTS.PHC;

  const fetched = await getPageHtml(browser, meta.url, "networkidle2", 4000);
  if (!fetched) {
    console.log("[PHC] Failed to fetch page.");
    return results;
  }

  const { html, finalUrl } = fetched;
  const base = new URL(finalUrl).origin;

  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];

  for (const row of rows) {
    const inner = row[1];
    if (!inner.includes("<td")) continue;

    const cells = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      clean(m[1]),
    );
    if (cells.length < 5) continue;

    // Skip header
    if (/s\.?\s*no|case\s*no|decision\s*date/i.test(cells[0] + cells[1]))
      continue;

    const caseTitle = cells[1] || ""; // Case (parties/title)
    const remarks = cells[2] || null; // Remarks — the legal matter summary
    const otherCitation = cells[3] || null; // Other Citation
    const phcCitation = cells[4] || null; // PHC Neutral Citation
    const decisionDate = cells[5] || null; // Decision Date
    const scStatus = cells[6] || null; // S.C.Status
    const category = cells[7] || null; // Category

    if (!caseTitle || caseTitle.length < 3) continue;

    // PDF link from the judgment column (cells[8])
    const linkMatch = inner.match(
      /<td[^>]*>[\s\S]*?<a[^>]+href="([^"]*\.pdf[^"]*)"[^>]*>/i,
    );
    const href = linkMatch ? toAbsolute(linkMatch[1], base) : null;

    // Bench from case title
    let courtFull = meta.courtFull;
    const lower = caseTitle.toLowerCase();
    if (lower.includes("abbottabad")) courtFull += " – Abbottabad Bench";
    else if (lower.includes("mingora") || lower.includes("swat"))
      courtFull += " – Mingora Bench";
    else if (lower.includes("d.i.khan") || lower.includes("di khan"))
      courtFull += " – D.I.Khan Bench";

    // citation: prefer PHC Neutral Citation, fallback to Other Citation
    const citation = phcCitation || otherCitation || null;

    // matter: use Remarks (trimmed — it's the legal summary), fallback to category
    const matter = remarks ? remarks.slice(0, 200) : category || null;

    results.push({
      title: caseTitle.slice(0, 500),
      court: "PHC",
      courtFull,
      courtAbbr: "PHC",
      province: meta.province,
      citation,
      judge: null, // PHC table doesn't show judge column
      matter,
      scStatus: scStatus || null,
      category: category || null,
      orderDate: parsePkDate(decisionDate),
      sourceUrl: href,
      approved: /reported|approved/i.test(inner),
      fetchedAt: new Date().toISOString(),
    });

    if (maxResults > 0 && results.length >= maxResults) break;
  }

  console.log(`[PHC] Scraped ${results.length} judgments.`);
  return results;
}

// =============================================================================
// BHC — High Court of Balochistan
// FINDING: 51KB loaded but 0 <tr>/<td> — JS-rendered table.
// Need to wait for JS to inject the table rows into the DOM.
// Also 142 <a> links present — may be a list structure, not a table.
// =============================================================================
async function scrapeBHC(browser, maxResults) {
  console.log("[BHC] Starting…");
  const results = [];
  const meta = COURTS.BHC;

  const urls = [
    "https://bhc.gov.pk/beta/resources/judgments",
    "https://bhc.gov.pk/resources/judgments",
  ];

  let html = null;
  let base = "https://bhc.gov.pk";

  for (const url of urls) {
    const page = await newPage(url.includes("beta") ? browser : browser);
    try {
      await page
        .goto(url, { waitUntil: "domcontentloaded", timeout: PAGE_TIMEOUT })
        .catch((err) => console.warn(`[BHC] goto: ${err.message}`));

      // JS renders the table — wait for it
      const found = await Promise.race([
        page
          .waitForSelector(
            "table tbody tr, .judgment-row, .case-item, li.judgment",
            { timeout: 15_000 },
          )
          .then(() => "table"),
        page
          .waitForSelector("a[href*='.pdf'], a[href*='judgment']", {
            timeout: 15_000,
          })
          .then(() => "links"),
        sleep(15_000).then(() => "timeout"),
      ]).catch(() => "error");
      console.log(`[BHC] waitForSelector: ${found}`);

      await sleep(2000);
      html = await page.content();
      base = new URL(page.url()).origin;
      await page.close();

      if (html && html.length > 2000) {
        const trCount = (html.match(/<tr/gi) || []).length;
        const tdCount = (html.match(/<td/gi) || []).length;
        const linkCount = (html.match(/<a /gi) || []).length;
        console.log(
          `[BHC] ${url}: HTML=${html.length}, <tr>=${trCount}, <td>=${tdCount}, <a>=${linkCount}`,
        );

        // Log all <th> headers
        const ths = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
          clean(m[1]),
        );
        if (ths.length) console.log(`[BHC] Headers:`, JSON.stringify(ths));

        // Log first data row
        const firstTr = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/i);
        if (firstTr && firstTr[1].includes("<td")) {
          const cells = [
            ...firstTr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi),
          ].map((m) => clean(m[1]));
          console.log(`[BHC] First row:`, JSON.stringify(cells.slice(0, 5)));
        }

        // Log first 3 meaningful links
        const links = [
          ...html.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi),
        ];
        let shown = 0;
        for (const lm of links) {
          const t = clean(lm[2]);
          if (t.length > 15 && !/menu|nav|home|about|login|^\s*$/i.test(t)) {
            console.log(
              `[BHC] Link: href=${lm[1].slice(0, 70)} text="${t.slice(0, 80)}"`,
            );
            if (++shown >= 5) break;
          }
        }

        if (trCount > 0 || linkCount > 10) break;
      }
      html = null;
    } catch (err) {
      await page.close().catch(() => {});
      console.warn(`[BHC] ${url}: ${err.message}`);
    }
  }

  if (!html) {
    console.log("[BHC] All URLs failed.");
    return results;
  }

  // ── Try table structure first ──
  const allTh = [...html.matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
    clean(m[1]),
  );
  const colMap = { title: -1, judge: -1, matter: -1, date: -1, citation: -1 };
  allTh.forEach((h, i) => {
    const hl = h.toLowerCase();
    if (/title|parties|case|petitioner/.test(hl)) colMap.title = i;
    else if (/judge|justice|bench|author/.test(hl)) colMap.judge = i;
    else if (/matter|subject|nature|remark|category/.test(hl))
      colMap.matter = i;
    else if (/date|decided|order/.test(hl)) colMap.date = i;
    else if (/citation|cite/.test(hl)) colMap.citation = i;
  });

  const allRows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const row of allRows) {
    const inner = row[1];
    if (!inner.includes("<td")) continue;
    const cells = [...inner.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      clean(m[1]),
    );
    if (cells.length < 2) continue;
    if (/^(s\.?no|sr\.?|#|no\.?)$/i.test(cells[0]) && cells[0].length < 5)
      continue;

    const linkMatch = inner.match(
      /<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
    );
    const href = linkMatch ? toAbsolute(linkMatch[1], base) : null;

    const title =
      colMap.title >= 0
        ? cells[colMap.title]
        : linkMatch
          ? clean(linkMatch[2])
          : cells.find((c) => c.length > 8 && !/^\d+$/.test(c)) || cells[1];
    if (!title || title.length < 3) continue;

    const judgeRaw =
      colMap.judge >= 0
        ? cells[colMap.judge]
        : cells.find((c) => /justice|hon/i.test(c)) || null;
    const judge = judgeRaw
      ? judgeRaw
          .replace(
            /^(mr\.?\s+justice\s+|justice\s+|hon[''` + "`" + `]?ble\s+)/i,
            "",
          )
          .trim()
      : null;
    const matter = colMap.matter >= 0 ? cells[colMap.matter] : null;
    const dateRaw =
      colMap.date >= 0
        ? cells[colMap.date]
        : cells.find((c) =>
            /\d{2}[-/]\d{2}[-/]\d{4}|\d{4}-\d{2}-\d{2}/.test(c),
          );
    const citation =
      colMap.citation >= 0
        ? cells[colMap.citation]
        : cells.find((c) => /\d{4}\s+(BHC|PLD|SCMR)/i.test(c)) || null;

    results.push({
      title: title.slice(0, 500),
      court: "BHC",
      courtFull: meta.courtFull,
      courtAbbr: "BHC",
      province: meta.province,
      citation: citation || null,
      judge: judge ? judge.slice(0, 300) : null,
      matter: matter ? matter.slice(0, 200) : null,
      orderDate: parsePkDate(dateRaw),
      sourceUrl: href,
      approved: true,
      fetchedAt: new Date().toISOString(),
    });
    if (maxResults > 0 && results.length >= maxResults) break;
  }

  // ── If no table rows, fall back to link-based extraction ──
  if (results.length === 0) {
    console.log("[BHC] No table rows — trying link-based extraction");
    const allLinks = [
      ...html.matchAll(/<a\s[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi),
    ];
    for (const lm of allLinks) {
      const href = toAbsolute(lm[1], base);
      const text = clean(lm[2]);
      if (!text || text.length < 10) continue;
      if (/menu|nav|home|about|login|next|prev|more/i.test(text)) continue;
      if (!/judgment|case|petition|appeal|bhc|civil|crl/i.test(text + lm[1]))
        continue;

      const after = html.slice(
        lm.index + lm[0].length,
        lm.index + lm[0].length + 500,
      );
      const dateM = after.match(/(\d{2}[-/]\d{2}[-/]\d{4}|\d{4}-\d{2}-\d{2})/);
      const judgeM = after.match(/justice\s+([\w\s]{5,50})/i);

      results.push({
        title: text.slice(0, 500),
        court: "BHC",
        courtFull: meta.courtFull,
        courtAbbr: "BHC",
        province: meta.province,
        citation: null,
        judge: judgeM ? judgeM[1].trim().slice(0, 300) : null,
        matter: null,
        orderDate: dateM ? parsePkDate(dateM[1]) : null,
        sourceUrl: href,
        approved: true,
        fetchedAt: new Date().toISOString(),
      });
      if (maxResults > 0 && results.length >= maxResults) break;
    }
  }

  console.log(`[BHC] Scraped ${results.length} judgments.`);
  return results;
}

// --- Scraper map ---
const SCRAPERS = {
  SCP: scrapeSCP,
  LHC: scrapeLHC,
  IHC: scrapeIHC,
  PHC: scrapePHC,
  BHC: scrapeBHC,
};

// --- Actor entrypoint ---
await Actor.main(async () => {
  const input = (await Actor.getInput()) ?? {};

  const courtsToScrape =
    Array.isArray(input.courts) && input.courts.length > 0
      ? input.courts.map((c) => c.toString().toUpperCase().trim())
      : Object.keys(SCRAPERS);

  const maxResults =
    typeof input.maxResultsPerCourt === "number"
      ? input.maxResultsPerCourt
      : 50;

  console.log(
    `[actor] Scraping: ${courtsToScrape.join(", ")} | max per court: ${maxResults || "unlimited"}`,
  );

  const browser = await launchBrowser();
  const summary = [];

  for (const abbr of courtsToScrape) {
    const scraper = SCRAPERS[abbr];
    if (!scraper) {
      console.warn(`[actor] Unknown court: ${abbr} – skipped.`);
      continue;
    }

    let items = [],
      status = "ok",
      errorMsg = null;
    try {
      items = await scraper(browser, maxResults);
    } catch (err) {
      status = "error";
      errorMsg = err.message;
      console.error(`[actor] ${abbr} threw: ${err.message}`);
    }

    if (items.length > 0) await Actor.pushData(items);
    summary.push({ court: abbr, count: items.length, status, error: errorMsg });
  }

  await browser.close();

  const store = await Actor.openKeyValueStore();
  await store.setValue("RUN_SUMMARY", {
    summary,
    completedAt: new Date().toISOString(),
  });

  const total = summary.reduce((s, c) => s + c.count, 0);
  console.log(
    `[actor] Done. Total: ${total}. ` +
      summary.map((c) => `${c.court}=${c.count}(${c.status})`).join(", "),
  );
});
