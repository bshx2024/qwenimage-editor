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
      "100 standard edits (1 credit/edit) or 50 Plus edits (2 credits)",
      "Instant automatic credit refund if task fails ($0 loss)",
      "Full high-resolution downloads included ($0 extra fee)",
      "One-time payment, Credits Never Expire",
      "Full Qwen-Image-2.1 Model Access",
      "Commercial use subject to our Terms and applicable model-provider terms"
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
      "500 standard edits/month (1 credit/edit) or 250 Plus edits",
      "Dedicated Fast GPU Priority Queue (Zero Wait)",
      "Instant automatic credit refund if task fails ($0 loss)",
      "Monthly quota resets each cycle (does not roll over)",
      "Full high-resolution downloads included ($0 extra fee)",
      "Cancel anytime with 1-click",
      "Commercial use subject to our Terms and applicable model-provider terms"
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
      "6,000 standard edits/year (500/mo, 1 credit/edit)",
      "Only $9.90/month (billed annually $118.80, save 50%)",
      "👑 VIP Dedicated Priority GPU Queue",
      "Instant automatic credit refund on task failure ($0 loss)",
      "Full high-resolution downloads included ($0 extra fee)",
      "Commercial use subject to our Terms and applicable model-provider terms",
      "Priority Customer Support"
    ]
  }
];

// Unified price list (Starter Pack, Pro Monthly, Pro Yearly)
export const priceList: PriceItem[] = [...oneTimePriceList, ...subscriptionPriceList];
