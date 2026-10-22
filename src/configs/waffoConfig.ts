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
      'Up to 100 standard edits (1 credit/task, 2 for Plus)',
      'Automatic refund on failure ($0 loss)',
      'Free high-resolution downloads ($0 extra fee)',
      'Never Expires',
      'Full Qwen & Wanx 2.1 Model Access',
      'Commercial usage permitted per Terms'
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
      'Up to 100 standard edits (1 credit/task, 2 for Plus)',
      'Automatic refund on failure ($0 loss)',
      'Free high-resolution downloads ($0 extra fee)',
      'Never Expires',
      'Full Qwen & Wanx 2.1 Model Access',
      'Commercial usage permitted per Terms'
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
      'Up to 500 standard edits/month (1 credit/task, 2 for Plus)',
      'Automatic refund on failure ($0 loss)',
      'Free high-resolution downloads ($0 extra fee)',
      'Dedicated Fast GPU Priority Queue',
      'Cancel anytime with 1-click',
      'Commercial usage permitted per Terms'
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
      'Up to 6,000 standard edits/year (500/mo, 1 credit/task)',
      'Only $9.90/month (billed annually $118.80, save 50%)',
      'Automatic refund on failure ($0 loss)',
      'Free high-resolution downloads ($0 extra fee)',
      '👑 VIP Dedicated Priority GPU Queue',
      'Commercial usage permitted per Terms'
    ]
  }
};
