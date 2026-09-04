const DRAFT_TOKEN_KEY = "craftie_area_checkout_draft_token";

export function getCheckoutDraftToken() {
  try {
    const existing = localStorage.getItem(DRAFT_TOKEN_KEY);
    if (existing) return existing;

    const next =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(DRAFT_TOKEN_KEY, next);
    return next;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function clearCheckoutDraftToken() {
  try {
    localStorage.removeItem(DRAFT_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function phoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function isCheckoutDraftPhoneReady(phone: string) {
  return phoneDigits(phone).length >= 7;
}
