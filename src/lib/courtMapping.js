export const COURT_ABBR = ["SCP", "LHC", "IHC", "PHC", "BHC", "SHC"];

export const COURT_META = {
  SCP: { full: "Supreme Court of Pakistan", province: null },
  LHC: { full: "Lahore High Court", province: "Punjab" },
  IHC: {
    full: "Islamabad High Court",
    province: "Islamabad Capital Territory",
  },
  PHC: { full: "Peshawar High Court", province: "Khyber Pakhtunkhwa" },
  BHC: { full: "Balochistan High Court", province: "Balochistan" },
  SHC: { full: "High Court of Sindh", province: "Sindh" },
};

const NAME_TO_ABBR = {
  "supreme court of pakistan": "SCP",
  "supreme court": "SCP",
  scp: "SCP",

  "lahore high court": "LHC",
  lhc: "LHC",

  "islamabad high court": "IHC",
  ihc: "IHC",

  "peshawar high court": "PHC",
  phc: "PHC",

  "balochistan high court": "BHC",
  bhc: "BHC",

  "sindh high court": "SHC",
  "high court of sindh": "SHC",
  "high court sindh": "SHC",
  "high court of sindh karachi": "SHC",
  "sindh high court karachi": "SHC",
  shc: "SHC",
};

function normaliseCourtName(raw) {
  return raw
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[.,()[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveCourtAbbr(raw) {
  if (!raw) return null;
  const key = normaliseCourtName(raw);
  if (!key) return null;

  if (NAME_TO_ABBR[key]) return NAME_TO_ABBR[key];

  // Already a valid abbreviation (any case)?
  const upper = raw.toString().trim().toUpperCase();
  if (COURT_ABBR.includes(upper)) return upper;

  return null;
}

export function courtFullName(abbr) {
  return COURT_META[abbr]?.full ?? abbr;
}
