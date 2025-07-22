#!/bin/bash

echo "🔍 RAZORPAY CONFIGURATION CHECKER"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ CRITICAL: .env.local file not found!"
    echo ""
    echo "SOLUTION:"
    echo "1. Copy .env.local.example to .env.local:"
    echo "   cp .env.local.example .env.local"
    echo ""
    echo "2. Edit .env.local and add your actual Razorpay keys"
    echo "3. Get keys from: https://dashboard.razorpay.com/app/keys"
    echo ""
    exit 1
fi

echo "✅ .env.local file found"
echo ""

# Source the environment file
source .env.local

# Check environment variables
echo "🔧 CHECKING ENVIRONMENT VARIABLES:"
echo "================================="

if [ -z "$NEXT_PUBLIC_RAZORPAY_KEY_ID" ]; then
    echo "❌ NEXT_PUBLIC_RAZORPAY_KEY_ID is missing"
else
    echo "✅ NEXT_PUBLIC_RAZORPAY_KEY_ID is set"
    
    if [[ $NEXT_PUBLIC_RAZORPAY_KEY_ID == rzp_live_* ]]; then
        echo "�� LIVE mode detected"
    elif [[ $NEXT_PUBLIC_RAZORPAY_KEY_ID == rzp_test_* ]]; then
        echo "🟡 TEST mode detected"
    else
        echo "❌ Invalid key format (should start with rzp_live_ or rzp_test_)"
    fi
fi

if [ -z "$RAZORPAY_KEY_ID" ]; then
    echo "❌ RAZORPAY_KEY_ID is missing"
else
    echo "✅ RAZORPAY_KEY_ID is set"
fi

if [ -z "$RAZORPAY_KEY_SECRET" ]; then
    echo "❌ RAZORPAY_KEY_SECRET is missing"
else
    echo "✅ RAZORPAY_KEY_SECRET is set"
fi

# Check if keys match
if [ "$NEXT_PUBLIC_RAZORPAY_KEY_ID" != "$RAZORPAY_KEY_ID" ]; then
    echo "❌ NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_ID don't match!"
    echo "   Both should have the same value"
else
    echo "✅ Key IDs match correctly"
fi

echo ""
echo "🎯 LIVE PAYMENT CHECKLIST:"
echo "========================="
echo "□ Razorpay account KYC completed"
echo "□ Business verification done"
echo "□ Settlement account verified"
echo "□ Using live keys (rzp_live_*)"
echo "□ Development server restarted after env changes"
echo "□ Test with small amounts first"
echo ""

echo "🔧 COMMON PAYMENT FAILURE CAUSES:"
echo "================================"
echo "• Customer payment method issues (insufficient funds, expired card)"
echo "• Bank/card issuer declining transaction"
echo "• Customer cancelling payment"
echo "• Network connectivity problems"
echo "• Transaction limits exceeded"
echo "• 3D Secure authentication failure"
echo ""

echo "📞 SUPPORT:"
echo "==========="
echo "Razorpay Support: https://dashboard.razorpay.com/app/tickets"
echo "Phone: 1800-120-4169"
echo ""

echo "Setup check completed!"
