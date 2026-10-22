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
      "Up to 100 standard edits (1 credit/task, 2 for Plus)",
      "Automatic refund if task fails ($0 loss)",
      "Free high-resolution downloads ($0 extra fee)",
      "One-time payment, Credits Never Expire",
      "Full Qwen & Wanx 2.1 Model Access",
      "Commercial usage permitted per Terms"
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
    credits: 500,
    badge: "Most Popular — Fast GPU",
    isPopular: true,
    features: [
      "Up to 500 standard edits/month (1 credit/task, 2 for Plus)",
      "Automatic refund if task fails ($0 loss)",
      "Free high-resolution downloads ($0 extra fee)",
      "Dedicated Fast GPU Priority Queue",
      "Cancel anytime with 1-click",
      "Commercial usage permitted per Terms"
    ]
  },
  {
    id: "sub_yearly",
    name: "Pro Yearly",
    currency: "usd",
    type: "recurring",
    unit_amount: 11880,
    credits: 6000,
    badge: "Best Value — Save 50%",
    features: [
      "Up to 6,000 standard edits/year (500/mo, 1 credit/task)",
      "Only $9.90/month (billed annually $118.80, save 50%)",
      "Automatic refund on task failure ($0 loss)",
      "Free high-resolution downloads ($0 extra fee)",
      "👑 VIP Dedicated Priority GPU Queue",
      "Commercial usage permitted per Terms",
      "Priority Customer Support"
    ]
  }
];

// Unified price list (Starter Pack, Pro Monthly, Pro Yearly)
export const priceList: PriceItem[] = [...oneTimePriceList, ...subscriptionPriceList];
