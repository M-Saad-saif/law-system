
export function getJudgmentsSheetConfig() {
  return {
    sheetId: process.env.JUDGMENTS_SHEET_ID,
    gid: process.env.JUDGMENTS_SHEET_GID,
  };
}

const MAX_CSV_BYTES = Number(process.env.JUDGMENTS_SHEET_MAX_BYTES || 100 * 1024 * 1024);

export async function fetchSheetCSV({ sheetId, gid }) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Google Sheet CSV (status ${res.status}). Make sure the sheet is shared as "Anyone with the link can view".`,
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const contentLength = Number(res.headers.get("content-length") || 0);
  if (contentLength > MAX_CSV_BYTES) {
    throw new Error(
      `Google Sheet CSV is too large (${Math.round(contentLength / 1024 / 1024)}MB). Refusing to load it in one request.`,
    );
  }

  if (!res.body) {
    const text = await res.text();
    if (text.length > MAX_CSV_BYTES) {
      throw new Error(
        `Google Sheet CSV is too large (${Math.round(text.length / 1024 / 1024)}MB). Refusing to load it in one request.`,
      );
    }
    if (contentType.includes("text/html") || text.trim().startsWith("<")) {
      throw new Error(
        "Google Sheet did not return CSV (got HTML instead). Check sharing permissions and the sheet/tab id.",
      );
    }
    return text;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let text = "";
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    received += value.byteLength;
    if (received > MAX_CSV_BYTES) {
      reader.cancel().catch(() => {});
      throw new Error(
        `Google Sheet CSV is too large (${Math.round(received / 1024 / 1024)}MB). Refusing to load it in one request.`,
      );
    }

    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();

  if (contentType.includes("text/html") || text.trim().startsWith("<")) {
    throw new Error(
      "Google Sheet did not return CSV (got HTML instead). Check sharing permissions and the sheet/tab id.",
    );
  }

  return text;
}
