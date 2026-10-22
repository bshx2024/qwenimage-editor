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

// 1. One-time Credit Packs
export const oneTimePriceList: PriceItem[] = [
  {
    id: "pack_starter",
    name: "Starter Pack",
    currency: "usd",
    type: "one_time",
    unit_amount: 499, // $4.99
    credits: 100,
    badge: "Lowest Entry — $0.05 / edit",
    isPopular: false,
    features: [
      "100 AI Edit & Generation Credits",
      "One-time payment, Credits Never Expire",
      "Full Qwen & Wanx 2.1 Model Access",
      "High Resolution Download",
      "Full Inpainting & Editing Tools",
      "Commercial Usage License"
    ]
  }
];

// 2. Subscriptions
export const subscriptionPriceList: PriceItem[] = [
  {
    id: "sub_monthly",
    name: "Pro Monthly",
    currency: "usd",
    type: "recurring",
    unit_amount: 1990,
    credits: 250,
    badge: "Most Popular — Fast GPU",
    isPopular: true,
    features: [
      "250 AI Credits Per Month",
      "Dedicated Fast GPU Priority Queue",
      "Ultra HD Resolution & Inpainting",
      "Cancel anytime with 1-click",
      "Commercial Usage License"
    ]
  },
  {
    id: "sub_yearly",
    name: "Pro Yearly",
    currency: "usd",
    type: "recurring",
    unit_amount: 11880,
    credits: 3600,
    badge: "Best Value — Save 50%",
    features: [
      "3,600 AI Credits Per Year (300/mo)",
      "Only $9.90/month (billed annually $118.80)",
      "👑 VIP Dedicated Priority Queue",
      "Full Commercial License",
      "Priority Customer Support"
    ]
  }
];

// Unified price list (Starter Pack, Pro Monthly, Pro Yearly)
export const priceList: PriceItem[] = [...oneTimePriceList, ...subscriptionPriceList];
