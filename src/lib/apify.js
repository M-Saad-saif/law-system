const APIFY_BASE = "https://api.apify.com/v2";

const RUN_TIMEOUT_MS = 10 * 60 * 1000;
const POLL_INTERVAL_MS = 8_000;
const DATASET_PAGE_SIZE = 1_000;

function headers() {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error("APIFY_TOKEN environment variable is not set.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function apifyFetch(path, options = {}) {
  const url = `${APIFY_BASE}${path}`;
  const res = await fetch(url, { ...options, headers: headers() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Apify API error ${res.status} at ${path}: ${body.slice(0, 300)}`,
    );
  }
  return res.json();
}

export async function runActorAndWait(input = {}) {
  const actorId = process.env.APIFY_ACTOR_ID;
  if (!actorId)
    throw new Error("APIFY_ACTOR_ID environment variable is not set.");

  // Start the run
  const runData = await apifyFetch(`/acts/${actorId}/runs`, {
    method: "POST",
    body: JSON.stringify(input),
  });

  const runId = runData?.data?.id;
  const datasetId = runData?.data?.defaultDatasetId;
  if (!runId) throw new Error("Apify did not return a run ID.");

  console.log(`[apify] Run started: ${runId}`);

  // Poll until terminal state
  const deadline = Date.now() + RUN_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);

    const statusData = await apifyFetch(`/actor-runs/${runId}`);
    const status = statusData?.data?.status;

    console.log(`[apify] Run ${runId} status: ${status}`);

    if (status === "SUCCEEDED") {
      return statusData.data.defaultDatasetId || datasetId;
    }

    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
      throw new Error(`Apify actor run ${runId} ended with status: ${status}`);
    }
  }

  throw new Error(
    `Apify actor run ${runId} did not finish within ${RUN_TIMEOUT_MS / 60000} minutes.`,
  );
}

export async function fetchDatasetItems(datasetId) {
  const items = [];
  let offset = 0;

  while (true) {
    const page = await apifyFetch(
      `/datasets/${datasetId}/items?offset=${offset}&limit=${DATASET_PAGE_SIZE}&clean=true`,
    );

    const batch = page?.items ?? page ?? [];
    if (!Array.isArray(batch) || batch.length === 0) break;

    items.push(...batch);

    if (batch.length < DATASET_PAGE_SIZE) break; // last page
    offset += DATASET_PAGE_SIZE;
  }

  console.log(`[apify] Dataset ${datasetId}: fetched ${items.length} items.`);
  return items;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
