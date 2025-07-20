import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'INR' } = body;

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Use environment variables for Razorpay keys
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('Razorpay keys not configured');
      return NextResponse.json({ 
        error: 'Payment gateway not configured. Please contact support.' 
      }, { status: 500 });
    }

    // Import Razorpay dynamically
    let Razorpay: any;
    try {
      const razorpayModule = await import('razorpay');
      Razorpay = razorpayModule.default;
    } catch (importError) {
      console.error('Failed to import Razorpay:', importError);
      return NextResponse.json({ 
        error: 'Payment gateway not available' 
      }, { status: 500 });
    }

    const razorpay = new Razorpay({ 
      key_id, 
      key_secret 
    });

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount, // in paise
      currency,
      payment_capture: 1,
      notes: {
        source: 'shoply-ecommerce'
      }
    });

    console.log('Razorpay order created:', order.id);
    return NextResponse.json(order);

  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    
    if (error.error) {
      // Razorpay specific error
      return NextResponse.json({ 
        error: error.error.description || error.error.reason || 'Payment gateway error' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create payment order. Please try again.' 
    }, { status: 500 });
  }
} 