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

// 1. One-time Credit Packs (Primary Focus)
export const oneTimePriceList: PriceItem[] = [
  {
    id: "pack_starter",
    name: "Starter Pack",
    currency: "usd",
    type: "one_time",
    unit_amount: 990, // $9.90
    credits: 100,
    badge: "Quick Start",
    features: [
      "100 AI Edit & Generation Credits",
      "One-time payment, Credits Never Expire",
      "Full Qwen & Wanx 2.1 Model Access",
      "High Resolution Download",
      "Full Inpainting & Editing Tools",
      "Commercial Usage License"
    ]
  },
  {
    id: "pack_standard",
    name: "Standard Pack",
    currency: "usd",
    type: "one_time",
    unit_amount: 2990, // $29.90
    credits: 350,
    badge: "Most Popular — Best Value",
    isPopular: true,
    features: [
      "350 AI Edit & Generation Credits",
      "Only $0.085 per credit",
      "One-time payment, Credits Never Expire",
      "Fast GPU Priority Processing Queue",
      "Ultra HD Resolution & Inpainting",
      "Cloud Gallery Archiving",
      "Commercial Usage License"
    ]
  },
  {
    id: "pack_pro",
    name: "Pro Pack",
    currency: "usd",
    type: "one_time",
    unit_amount: 6990, // $69.90
    credits: 1000,
    badge: "Maximum Savings",
    features: [
      "1,000 AI Edit & Generation Credits",
      "Only $0.069 per credit (Save 30%)",
      "One-time payment, Credits Never Expire",
      "VIP Dedicated Priority Queue",
      "👑 Lifetime Cloud Vault Archiving",
      "Highest Resolution & Ultra HD",
      "Commercial Usage License"
    ]
  }
];

// 2. Subscriptions (Secondary / Optional)
export const subscriptionPriceList: PriceItem[] = [
  {
    id: "sub_monthly",
    name: "Pro Monthly",
    currency: "usd",
    type: "recurring",
    unit_amount: 1990,
    credits: 250,
    badge: "Flexible Billing",
    features: [
      "250 AI Credits Per Month",
      "Cancel anytime with 1-click",
      "Fast GPU Priority Queue",
      "Full Inpainting & Editing Tools",
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
    badge: "Save 50%",
    features: [
      "3,600 AI Credits Per Year (300/mo)",
      "Only $9.90/month (billed annually)",
      "👑 Unlimited Lifetime Cloud Vault Archiving",
      "VIP Dedicated Priority Queue",
      "Commercial Usage License",
      "Priority 24/7 Support"
    ]
  }
];

// Unified price list (one-time first, followed by subscriptions)
export const priceList: PriceItem[] = [...oneTimePriceList, ...subscriptionPriceList];
