// ============================================
// FANMENI - Programme + personal participation limits
// ============================================

// Team limit = maximum candidates a single team may submit to one programme.
// The programme CODE PREFIX determines the limit automatically.
export const PROGRAMME_LIMITS = {
  BS: 7,
  BNS: 10,
  TS: 5,
  TNS: 10,
  BG: Infinity,
  TG: Infinity,
  G: Infinity,
};

// Personal student limits:
// Bidaya: 7 stage + 10 non-stage
// Thaniya: 5 stage + 7 non-stage
export const PERSONAL_LIMITS = {
  Bidaya: { stage: 7, nonStage: 10 },
  Thaniya: { stage: 5, nonStage: 7 },
};

export function getProgrammePrefix(code) {
  const normalized = String(code || "").trim().toUpperCase();
  return Object.keys(PROGRAMME_LIMITS)
    .sort((a, b) => b.length - a.length)
    .find((prefix) => normalized.startsWith(prefix)) || "";
}

export function getProgrammeLimit(code) {
  const prefix = getProgrammePrefix(code);
  return prefix ? PROGRAMME_LIMITS[prefix] : Infinity;
}

export function getProgrammeDivision(code) {
  const prefix = getProgrammePrefix(code);
  if (prefix === "BS" || prefix === "TS") return "stage";
  if (prefix === "BNS" || prefix === "TNS") return "nonStage";
  return null;
}

export function getPersonalLimit(category, code) {
  const limits = PERSONAL_LIMITS[String(category || "").trim()];
  const division = getProgrammeDivision(code);
  if (!limits || !division) return Infinity;
  return limits[division];
}

export function getPersonalLimitLabel(category, code) {
  const division = getProgrammeDivision(code);
  if (division === "stage") return `${category} stage limit`;
  if (division === "nonStage") return `${category} non-stage limit`;
  return "Personal limit";
}

export function isUnlimitedProgramme(code) {
  return getProgrammeLimit(code) === Infinity;
}
