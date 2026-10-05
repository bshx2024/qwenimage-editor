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
  'pro-monthly': {
    id: 'pro-monthly',
    name: 'Pro Monthly',
    price: 19.90,
    period: 'month',
    credits: 500,
    productId: process.env.WAFFO_PRODUCT_PRO_MONTHLY || 'PROD_0bhIkei7YAngBgCbPswItP',
    checkoutUrl: process.env.NEXT_PUBLIC_WAFFO_PRO_LINK || 'https://pancake.waffo.ai/store/qwen-image-editor-1aao3v6w/product/PROD_0bhIkei7YAngBgCbPswItP?type=subscription&currency=USD',
    features: [
      '500 AI Edit & Generation Credits / mo',
      'Ultra HD Resolution & Inpainting',
      'Commercial Usage License',
      'Priority Fast GPU Queue',
      'No Watermarks'
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
      '6,000 AI Credits / year ($9.90/mo billed yearly)',
      'Save 50% Compared to Monthly',
      'Ultra HD Resolution & Inpainting',
      'Commercial Usage License',
      'VIP Priority Fast Queue'
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
      'Full Editing & Inpainting Tools'
    ]
  }
};
