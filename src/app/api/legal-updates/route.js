import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api";

let cache = { data: [], fetchedAt: 0 };
const CACHE_TTL_MS = 15 * 60 * 1000;

async function fetchSHCJudgments() {
  const url = "https://caselaw.shc.gov.pk/caselaw/public/home";
  const baseHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
    "Accept-Language": "en-PK,en-US;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    Pragma: "no-cache", //always ftech new data..no old data
    Referer: "https://caselaw.shc.gov.pk/",
  };

  let res = await fetch(url, {
    headers: {
      ...baseHeaders,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
    next: { revalidate: 0 },
  });

  // Some servers reply 406 to specific Accept headers. Retry with a looser Accept.
  if (res.status === 406) {
    res = await fetch(url, {
      headers: { ...baseHeaders, Accept: "*/*" },
      redirect: "follow",
      next: { revalidate: 0 },
    });
  }

  if (!res.ok) throw new Error(`SHC fetch failed: ${res.status}`);
  const html = await res.text();

  //  parse blockquotes — each judgment is wrapped in <blockquote> 
  const blockRegex = /<blockquote>([\s\S]*?)<\/blockquote>/gi;
  const blocks = [...html.matchAll(blockRegex)];

  const judgments = [];

  for (const block of blocks) {
    const inner = block[1];

    // Title / case reference — inside first <a> tag
    const titleMatch = inner.match(
      /<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
    );
    if (!titleMatch) continue;

    const rawTitle = titleMatch[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const sourceUrl = titleMatch[1]?.trim() || "";

    // Citation e.g. "2026 SHC KHI 701"
    const citationMatch = inner.match(/(\d{4}\s+SHC\s+\w+\s+\d+)/i);
    const citation = citationMatch ? citationMatch[1].trim() : null;

    // Matter/category — inside <strong> after "Matter:-"
    const matterMatch = inner.match(/Matter:-\s*<strong>(.*?)<\/strong>/i);
    const matter = matterMatch
      ? matterMatch[1].replace(/<[^>]+>/g, "").trim()
      : null;

    // Judge name
    const judgeMatch = inner.match(
      /Hon['']ble\s+([\s\S]*?)(?=Source:|Downloads|Order Date)/i,
    );
    const judge = judgeMatch
      ? judgeMatch[1]
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
      : null;

    // Order date — "Order Date:\n 01-APR-26"
    const dateMatch = inner.match(
      /Order Date:\s*[\r\n\s]*([\d]{2}-[A-Z]{3}-[\d]{2,4})/i,
    );
    let orderDate = null;
    if (dateMatch) {
      orderDate = new Date(dateMatch[1].replace(/-/g, " "));
      if (isNaN(orderDate)) orderDate = null;
    }

    // Downloads count
    const dlMatch = inner.match(/Downloads\s+(\d+)/i);
    const downloads = dlMatch ? parseInt(dlMatch[1]) : 0;

    // Approved for reporting?
    const approved = /Approved for Reporting/i.test(inner);

    // Extract court from title
    let court = "Sindh High Court";
    if (/Circuit at (\w[\w\s]+)/i.test(rawTitle)) {
      court = `SHC — ${rawTitle.match(/Circuit at ([\w\s]+)/i)[1].trim()}`;
    } else if (/Karachi/i.test(rawTitle)) {
      court = "SHC — Karachi";
    } else if (/Hyderabad/i.test(rawTitle)) {
      court = "SHC — Hyderabad";
    }

    if (!rawTitle) continue;

    judgments.push({
      id: sourceUrl || rawTitle,
      title: rawTitle,
      citation,
      matter,
      judge,
      court,
      orderDate: orderDate ? orderDate.toISOString() : null,
      downloads,
      approved,
      sourceUrl: sourceUrl.startsWith("http") ? sourceUrl : null,
    });
  }

  return judgments;
}

// GET /api/legal-updates?limit=10
export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 30);

  // Serve from cache if fresh
  if (Date.now() - cache.fetchedAt < CACHE_TTL_MS && cache.data.length > 0) {
    return NextResponse.json({
      success: true,
      source: "cache",
      data: cache.data.slice(0, limit),
      total: cache.data.length,
      fetchedAt: new Date(cache.fetchedAt).toISOString(),
    });
  }

  try {
    const judgments = await fetchSHCJudgments();
    cache = { data: judgments, fetchedAt: Date.now() };

    return NextResponse.json({
      success: true,
      source: "live",
      data: judgments.slice(0, limit),
      total: judgments.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    // If live fetch fails, return stale cache if available
    if (cache.data.length > 0) {
      return NextResponse.json({
        success: true,
        source: "stale-cache",
        data: cache.data.slice(0, limit),
        total: cache.data.length,
        fetchedAt: new Date(cache.fetchedAt).toISOString(),
      });
    }

    return NextResponse.json({
      success: false,
      source: "error",
      data: [],
      error: err.message,
      fetchedAt: new Date().toISOString(),
    });
  }
});
