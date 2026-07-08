
export function getJudgmentsSheetConfig() {
  return {
    sheetId: process.env.JUDGMENTS_SHEET_ID,
    gid: process.env.JUDGMENTS_SHEET_GID,
  };
}

export async function fetchSheetCSV({ sheetId, gid }) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(
      `Failed to fetch Google Sheet CSV (status ${res.status}). Make sure the sheet is shared as "Anyone with the link can view".`,
    );
  }

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (contentType.includes("text/html") || text.trim().startsWith("<")) {
    throw new Error(
      "Google Sheet did not return CSV (got HTML instead). Check sharing permissions and the sheet/tab id.",
    );
  }

  return text;
}
