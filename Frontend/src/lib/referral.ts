const REFERRAL_STORAGE_KEY = "ateeqo_referral_code";

const REF_PARAM_KEYS = ["ref", "referral", "code"] as const;

export function normalizeReferralCode(value: string | null | undefined) {
  return (value ?? "").trim().toUpperCase();
}

export function getReferralCode() {
  try {
    return normalizeReferralCode(localStorage.getItem(REFERRAL_STORAGE_KEY));
  } catch {
    return "";
  }
}

export function setReferralCode(code: string) {
  const normalized = normalizeReferralCode(code);
  if (!normalized) return "";

  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, normalized);
  } catch {
    // ignore storage failures
  }

  return normalized;
}

export function clearReferralCode() {
  try {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
  } catch {
    // ignore storage failures
  }
}

export function buildReferralShareLink(resaleCode: string, origin = window.location.origin) {
  const code = normalizeReferralCode(resaleCode);
  if (!code) return origin;
  return `${origin}/?ref=${encodeURIComponent(code)}`;
}

export function buildReferralWhatsAppShareUrl(resaleCode: string) {
  const link = buildReferralShareLink(resaleCode);
  const text = `Shop at Ateeqo with my link and get a discount: ${link}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Reads ref/referral/code from the current URL, persists it, and returns the code if found.
 */
export function captureReferralFromSearch(search: string) {
  const params = new URLSearchParams(search);
  let raw = "";

  for (const key of REF_PARAM_KEYS) {
    const value = params.get(key);
    if (value?.trim()) {
      raw = value;
      break;
    }
  }

  const code = normalizeReferralCode(raw);
  if (!code) return "";

  setReferralCode(code);
  return code;
}

/**
 * Removes referral query params from a search string (keeps other params).
 */
export function stripReferralParams(search: string) {
  const params = new URLSearchParams(search);
  let changed = false;

  for (const key of REF_PARAM_KEYS) {
    if (params.has(key)) {
      params.delete(key);
      changed = true;
    }
  }

  if (!changed) return search;

  const next = params.toString();
  return next ? `?${next}` : "";
}
