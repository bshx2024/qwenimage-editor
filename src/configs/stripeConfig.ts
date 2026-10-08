export interface PriceItem {
  id: string;
  name: string;
  currency: string;
  type: 'one_time' | 'recurring';
  unit_amount: number;
  credits: number;
  badge?: string;
  isPopular?: boolean;
  features: string[];
}

export const priceList: PriceItem[] = [
  {
    id: "price_starter",
    name: "Starter Pack",
    currency: "usd",
    type: "one_time",
    unit_amount: 499,
    credits: 100,
    badge: "One-time Trial",
    features: [
      "100 AI Edit & Generation Credits",
      "One-time payment, Never Expires",
      "Full Qwen & Wanx Model Access",
      "High Resolution Download",
      "30-Day Cloud Gallery Retention",
      "Commercial Usage Allowed"
    ]
  },
  {
    id: "price_monthly",
    name: "Pro Monthly",
    currency: "usd",
    type: "recurring",
    unit_amount: 1990,
    credits: 500,
    badge: "Flexible Billing",
    features: [
      "500 AI Credits Per Month",
      "👑 Lifetime Cloud Vault (Never Expire)",
      "Fast GPU Priority Queue",
      "Full Inpainting & Editing Tools",
      "No Watermarks & Ultra HD",
      "Commercial Usage License"
    ]
  },
  {
    id: "price_yearly",
    name: "Pro Yearly",
    currency: "usd",
    type: "recurring",
    unit_amount: 11880,
    credits: 6000,
    badge: "Most Popular — Save 50%",
    isPopular: true,
    features: [
      "6,000 AI Credits Per Year",
      "Only $9.90/month (billed annually)",
      "👑 Unlimited Lifetime Cloud Vault Archiving",
      "VIP Dedicated Priority Queue",
      "Highest Resolution & Fast Inpainting",
      "Commercial Usage License",
      "Priority 24/7 Support"
    ]
  }
];
