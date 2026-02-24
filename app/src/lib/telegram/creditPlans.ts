import "server-only";

export type CreditPlanId = "10k" | "20k" | "59k" | "149k" | "269k" | "630k";

export type CreditPlan = {
  id: CreditPlanId;
  credits: number;
  usdLabel: string;
  stars: number;
};

// Note: Telegram Stars don't map 1:1 to USD. These star amounts are placeholders
// you can adjust once you decide your in-Telegram pricing.
export const CREDIT_PLANS: CreditPlan[] = [
  { id: "10k", credits: 10_000, usdLabel: "$9.99", stars: 99 },
  { id: "20k", credits: 20_000, usdLabel: "$19.99", stars: 199 },
  { id: "59k", credits: 59_000, usdLabel: "$49.99", stars: 499 },
  { id: "149k", credits: 149_000, usdLabel: "$99.99", stars: 999 },
  { id: "269k", credits: 269_000, usdLabel: "$149.99", stars: 1499 },
  { id: "630k", credits: 630_000, usdLabel: "$299.99", stars: 2999 },
];

export function getPlan(planId: string) {
  return CREDIT_PLANS.find((p) => p.id === planId) ?? null;
}

