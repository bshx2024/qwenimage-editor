export interface WaffoPlan {
  id: string;
  name: string;
  price: number; // in USD
  period: 'month' | 'year' | 'onetime';
  credits: number;
  productId?: string;
  checkoutUrl?: string; // Direct Waffo hosted link if set
  features: string[];
}

export const WAFFO_PLANS: Record<string, WaffoPlan> = {
  'pack-starter': {
    id: 'pack-starter',
    name: 'Starter Credits Pack',
    price: 4.99,
    period: 'onetime',
    credits: 100,
    productId: process.env.WAFFO_PRODUCT_CREDITS_100 || 'PROD_4Ggdu4ZQ0RICi3tCNI4iEe',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_STARTER_LINK || 'https://pancake.waffo.ai/store/qwen-image-editor-1aao3v6w/product/PROD_4Ggdu4ZQ0RICi3tCNI4iEe?type=onetime&currency=USD',
    features: [
      '100 standard edits (1 credit/edit) or 50 Plus edits (2 credits)',
      'Instant automatic refund on failure ($0 loss)',
      'Full high-resolution downloads included ($0 extra fee)',
      'Never Expires',
      'Full Qwen & Wanx 2.1 Model Access',
      'Commercial use subject to our Terms and applicable model-provider terms'
    ]
  },
  'credits-pack-100': {
    id: 'credits-pack-100',
    name: 'Starter Credits Pack',
    price: 4.99,
    period: 'onetime',
    credits: 100,
    productId: process.env.WAFFO_PRODUCT_CREDITS_100 || 'PROD_4Ggdu4ZQ0RICi3tCNI4iEe',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_STARTER_LINK || 'https://pancake.waffo.ai/store/qwen-image-editor-1aao3v6w/product/PROD_4Ggdu4ZQ0RICi3tCNI4iEe?type=onetime&currency=USD',
    features: [
      '100 standard edits (1 credit/edit) or 50 Plus edits (2 credits)',
      'Instant automatic refund on failure ($0 loss)',
      'Full high-resolution downloads included ($0 extra fee)',
      'Never Expires',
      'Full Qwen & Wanx 2.1 Model Access',
      'Commercial use subject to our Terms and applicable model-provider terms'
    ]
  },
  'pro-monthly': {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: 19.90,
    period: 'month',
    credits: 500,
    productId: process.env.WAFFO_PRODUCT_PRO_MONTHLY || 'PROD_0bhIkei7YAngBgCbPswItP',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_PRO_LINK || 'https://pancake.waffo.ai/store/qwen-image-editor-1aao3v6w/product/PROD_0bhIkei7YAngBgCbPswItP?type=subscription&currency=USD',
    features: [
      '500 standard edits/month (1 credit/edit) or 250 Plus edits',
      'Dedicated Fast GPU Priority Queue (Zero Wait)',
      'Instant automatic refund on failure ($0 loss)',
      'Monthly quota resets each cycle (does not roll over)',
      'Full high-resolution downloads included ($0 extra fee)',
      'Cancel anytime with 1-click',
      'Commercial use subject to our Terms and applicable model-provider terms'
    ]
  },
  'pro-yearly': {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    price: 118.80,
    period: 'year',
    credits: 6000,
    productId: process.env.WAFFO_PRODUCT_PRO_YEARLY || 'PROD_7PVW8DleskmRyJ98oLkZSJ',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_MEGA_LINK || 'https://pancake.waffo.ai/store/qwen-image-editor-1aao3v6w/product/PROD_7PVW8DleskmRyJ98oLkZSJ?type=subscription&currency=USD',
    features: [
      '6,000 standard edits/year (500/mo, 1 credit/edit)',
      'Only $9.90/month (billed annually $118.80, save 50%)',
      '👑 VIP Dedicated Priority GPU Queue',
      'Instant automatic refund on failure ($0 loss)',
      'Full high-resolution downloads included ($0 extra fee)',
      'Commercial use subject to our Terms and applicable model-provider terms'
    ]
  }
};
