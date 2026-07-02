export const LOYALTY_TIERS = [
  { min: 5000, percent: 5, label: "Bronze" },
  { min: 10000, percent: 8, label: "Silver" },
  { min: 15000, percent: 12, label: "Gold" },
  { min: 20000, percent: 15, label: "Platinum" },
] as const;

export function formatRs(amount: number) {
  return `Rs. ${Math.round(amount).toLocaleString()}`;
}

export function getDiscountPercentForSpent(lifetimeSpent: number): number {
  let percent = 0;
  for (const tier of LOYALTY_TIERS) {
    if (lifetimeSpent >= tier.min) {
      percent = tier.percent;
    }
  }
  return percent;
}

export function calculateLoyaltyDiscount(subtotal: number, lifetimeSpent: number) {
  const discountPercent = getDiscountPercentForSpent(lifetimeSpent);
  const discountAmount = Math.round(subtotal * (discountPercent / 100));
  const totalAfterDiscount = Math.max(0, subtotal - discountAmount);

  return {
    discountPercent,
    discountAmount,
    totalAfterDiscount,
  };
}

export function getNextTier(lifetimeSpent: number) {
  return LOYALTY_TIERS.find((tier) => lifetimeSpent < tier.min) ?? null;
}

export function getCurrentTierLabel(lifetimeSpent: number) {
  const tiers = [...LOYALTY_TIERS].reverse();
  return tiers.find((tier) => lifetimeSpent >= tier.min)?.label ?? "Member";
}
