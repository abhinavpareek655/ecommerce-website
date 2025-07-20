# Razorpay Setup Guide

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration (you should already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Razorpay Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key
```

## Getting Razorpay Keys

1. **Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)**
2. **Go to Settings > API Keys**
3. **Generate a new key pair**
4. **Use the test keys for development**

## Test Cards for Development

- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **Name**: Any name

## UPI Testing

- **UPI ID**: success@razorpay (for successful payments)
- **UPI ID**: failure@razorpay (for failed payments)

## Restart Your Development Server

After adding the environment variables, restart your development server:

```bash
pnpm dev
```

## Testing the Integration

1. Add items to cart
2. Go to checkout
3. Fill in shipping/billing information
4. Click "Pay $X.XX" for real Razorpay payment
5. Use test card/UPI details above

The payment should now work with real Razorpay integration! 