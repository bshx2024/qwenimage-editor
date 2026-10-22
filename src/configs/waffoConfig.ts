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
      '100 One-time AI Credits',
      'Never Expires',
      'Full Qwen & Wanx 2.1 Model Access',
      'High-Resolution Download',
      'Commercial Usage License'
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
      '100 One-time AI Credits',
      'Never Expires',
      'Full Qwen & Wanx 2.1 Model Access',
      'Commercial Usage License'
    ]
  },
  'pack-standard': {
    id: 'pack-standard',
    name: 'Standard Credits Pack',
    price: 29.90,
    period: 'onetime',
    credits: 350,
    productId: process.env.WAFFO_PRODUCT_CREDITS_350 || process.env.WAFFO_PRODUCT_PRO_MONTHLY || 'PROD_0bhIkei7YAngBgCbPswItP',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_STANDARD_LINK || process.env.NEXT_PUBLIC_WAFFO_PRO_LINK,
    features: [
      '350 One-time AI Credits',
      'Only $0.085 per credit',
      'Never Expires',
      'Fast GPU Priority Queue',
      'Ultra HD Resolution & Inpainting',
      'Commercial Usage License'
    ]
  },
  'pack-pro': {
    id: 'pack-pro',
    name: 'Pro Credits Pack',
    price: 69.90,
    period: 'onetime',
    credits: 1000,
    productId: process.env.WAFFO_PRODUCT_CREDITS_1000 || process.env.WAFFO_PRODUCT_PRO_YEARLY || 'PROD_7PVW8DleskmRyJ98oLkZSJ',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_PRO_PACK_LINK || process.env.NEXT_PUBLIC_WAFFO_MEGA_LINK,
    features: [
      '1,000 One-time AI Credits',
      'Only $0.069 per credit (Save 30%)',
      'Never Expires',
      'VIP Dedicated Fast Processing',
      'Lifetime Cloud Vault Storage',
      'Commercial Usage License'
    ]
  },
  'pro-monthly': {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: 19.90,
    period: 'month',
    credits: 250,
    productId: process.env.WAFFO_PRODUCT_PRO_MONTHLY || 'PROD_0bhIkei7YAngBgCbPswItP',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_PRO_LINK || 'https://pancake.waffo.ai/store/qwen-image-editor-1aao3v6w/product/PROD_0bhIkei7YAngBgCbPswItP?type=subscription&currency=USD',
    features: [
      '250 AI Credits / month',
      'Ultra HD Resolution & Inpainting',
      'Commercial Usage License',
      'Fast GPU Priority Queue'
    ]
  },
  'pro-yearly': {
    id: 'pro-yearly',
    name: 'Pro Yearly',
    price: 118.80,
    period: 'year',
    credits: 3600,
    productId: process.env.WAFFO_PRODUCT_PRO_YEARLY || 'PROD_7PVW8DleskmRyJ98oLkZSJ',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_MEGA_LINK || 'https://pancake.waffo.ai/store/qwen-image-editor-1aao3v6w/product/PROD_7PVW8DleskmRyJ98oLkZSJ?type=subscription&currency=USD',
    features: [
      '3,600 AI Credits / year ($9.90/mo)',
      'Save 50% Compared to Monthly',
      'VIP Dedicated Fast Queue',
      'Commercial Usage License'
    ]
  }
};
