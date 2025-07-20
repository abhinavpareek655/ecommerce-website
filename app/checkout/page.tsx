"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { supabase } from "@/lib/supabase"
import Script from "next/script"
import { AlertCircle, CheckCircle, CreditCard, Smartphone } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID"

// Declare Razorpay type for TypeScript
declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const router = useRouter()
  
  const [shipping, setShipping] = useState({ 
    name: user?.user_metadata?.full_name || "", 
    address: "", 
    city: "", 
    zip: "",
    phone: ""
  })
  const [billing, setBilling] = useState({ 
    name: user?.user_metadata?.full_name || "", 
    address: "", 
    city: "", 
    zip: "",
    phone: ""
  })
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign in to checkout</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!items.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Your cart is empty</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/products">Shop Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInput = (type: "shipping" | "billing", field: string, value: string) => {
    if (type === "shipping") {
      setShipping({ ...shipping, [field]: value })
    } else {
      setBilling({ ...billing, [field]: value })
    }
    // Clear error when user starts typing
    if (formErrors[`${type}_${field}`]) {
      setFormErrors(prev => ({ ...prev, [`${type}_${field}`]: "" }))
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    // Validate shipping information
    if (!shipping.name.trim()) errors.shipping_name = "Name is required"
    if (!shipping.address.trim()) errors.shipping_address = "Address is required"
    if (!shipping.city.trim()) errors.shipping_city = "City is required"
    if (!shipping.zip.trim()) errors.shipping_zip = "ZIP code is required"
    if (!shipping.phone.trim()) errors.shipping_phone = "Phone number is required"
    
    // Validate billing information
    if (!billing.name.trim()) errors.billing_name = "Name is required"
    if (!billing.address.trim()) errors.billing_address = "Address is required"
    if (!billing.city.trim()) errors.billing_city = "City is required"
    if (!billing.zip.trim()) errors.billing_zip = "ZIP code is required"
    if (!billing.phone.trim()) errors.billing_phone = "Phone number is required"
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const createOrder = async (paymentResponse: any) => {
    try {
      // Create the order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: `ORD-${Date.now()}`,
          status: "processing", // Changed from "paid" to "processing"
          total_amount: totalPrice,
          shipping_address: shipping,
          billing_address: billing,
          payment_status: "paid",
          payment_method: paymentMethod,
          payment_id: paymentResponse.razorpay_payment_id || null, // Make it optional
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (orderError) {
        console.error("Order creation error:", orderError)
        throw orderError
      }

      // Create order items
      for (const item of items) {
        const price = item.product_variants?.price ?? item.products?.price ?? 0
        const { error: itemError } = await supabase.from("order_items").insert({
          order_id: orderData.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
          price,
          product_name: item.products?.name || "",
          variant_options: item.product_variants?.options || {},
        })
        
        if (itemError) {
          console.error("Order item creation error:", itemError)
          throw itemError
        }
      }

      // Clear cart
      await clearCart()
      setSuccess(true)
    } catch (err: any) {
      console.error("Order creation error:", err)
      throw new Error("Failed to create order. Please contact support.")
    }
  }

  // Remove test payment logic and payment method selection
  // Only keep Razorpay payment logic

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Calculate total amount including shipping and tax
      const shippingCost = totalPrice >= 50 ? 0 : 9.99
      const tax = totalPrice * 0.08
      const total = totalPrice + shippingCost + tax
      
      const amount = Math.round(total * 100) // Convert to paise
      // 1. Create Razorpay order on backend
      const orderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'INR' })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create Razorpay order');
      }
      const order_id = orderData.id;
      
      // 2. Open Razorpay modal with real order_id
      if (typeof window !== 'undefined' && !(window as any).Razorpay) {
        throw new Error("Payment gateway not loaded. Please refresh the page and try again.")
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "Shoply",
        description: "Order Payment",
        image: "http://shoply-abhi.vercel.app/Ecom-logo.svg",
        order_id,
        handler: async function (response: any) {
          console.log("Payment successful:", response)
          try {
            await createOrder(response)
          } catch (err: any) {
            console.error("Order creation error:", err)
            setError(err.message || "Payment successful but order creation failed")
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: shipping.name || "Test User",
          email: user.email || "test@example.com",
          contact: shipping.phone || "9999999999",
        },
        notes: {
          address: shipping.address || "Test Address",
          city: shipping.city || "Test City",
          zip: shipping.zip || "123456",
        },
        theme: {
          color: "#fff",
        },
        modal: {
          ondismiss: function() {
            console.log("Payment modal dismissed")
            setLoading(false)
          }
        }
      }

      console.log("Initializing Razorpay with options:", options)

      const rzp = new (window as any).Razorpay(options)
      
      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error)
        setError(`Payment failed: ${response.error.description || response.error.reason || 'Unknown error'}`)
        setLoading(false)
      })

      rzp.on('payment.cancelled', function () {
        console.log("Payment cancelled by user")
        setError("Payment was cancelled")
        setLoading(false)
      })

      rzp.on('payment.error', function (response: any) {
        console.error("Payment error:", response)
        setError(`Payment error: ${response.error.description || 'Unknown error'}`)
        setLoading(false)
      })

      rzp.open()
    } catch (err: any) {
      console.error("Payment initialization error:", err)
      setError(err.message || "Failed to initialize payment. Please try again.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>Order placed successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Thank you for your purchase. You will receive a confirmation email shortly.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/orders">View Orders</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const shippingCost = totalPrice >= 50 ? 0 : 9.99
  const tax = totalPrice * 0.08
  const total = totalPrice + shippingCost + tax

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="container py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div className="flex-1">
                        <p className="font-medium">
                          {item.products?.name}
                          {item.product_variants?.name && (
                            <span className="text-muted-foreground"> ({item.product_variants.name})</span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold">
                      ₹{((item.product_variants?.price ?? item.products?.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  
                  <div className="space-y-2 pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-semibold">Free</span>
                        ) : (
                          `$${shippingCost.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div className="space-y-6">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-name">Full Name *</Label>
                      <Input
                        id="shipping-name"
                        value={shipping.name}
                        onChange={e => handleInput("shipping", "name", e.target.value)}
                        className={formErrors.shipping_name ? "border-red-500" : ""}
                      />
                      {formErrors.shipping_name && (
                        <p className="text-sm text-red-500">{formErrors.shipping_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-phone">Phone *</Label>
                      <Input
                        id="shipping-phone"
                        type="tel"
                        value={shipping.phone}
                        onChange={e => handleInput("shipping", "phone", e.target.value)}
                        className={formErrors.shipping_phone ? "border-red-500" : ""}
                      />
                      {formErrors.shipping_phone && (
                        <p className="text-sm text-red-500">{formErrors.shipping_phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shipping-address">Address *</Label>
                    <Input
                      id="shipping-address"
                      value={shipping.address}
                      onChange={e => handleInput("shipping", "address", e.target.value)}
                      className={formErrors.shipping_address ? "border-red-500" : ""}
                    />
                    {formErrors.shipping_address && (
                      <p className="text-sm text-red-500">{formErrors.shipping_address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping-city">City *</Label>
                      <Input
                        id="shipping-city"
                        value={shipping.city}
                        onChange={e => handleInput("shipping", "city", e.target.value)}
                        className={formErrors.shipping_city ? "border-red-500" : ""}
                      />
                      {formErrors.shipping_city && (
                        <p className="text-sm text-red-500">{formErrors.shipping_city}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shipping-zip">ZIP Code *</Label>
                      <Input
                        id="shipping-zip"
                        value={shipping.zip}
                        onChange={e => handleInput("shipping", "zip", e.target.value)}
                        className={formErrors.shipping_zip ? "border-red-500" : ""}
                      />
                      {formErrors.shipping_zip && (
                        <p className="text-sm text-red-500">{formErrors.shipping_zip}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing-name">Full Name *</Label>
                      <Input
                        id="billing-name"
                        value={billing.name}
                        onChange={e => handleInput("billing", "name", e.target.value)}
                        className={formErrors.billing_name ? "border-red-500" : ""}
                      />
                      {formErrors.billing_name && (
                        <p className="text-sm text-red-500">{formErrors.billing_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-phone">Phone *</Label>
                      <Input
                        id="billing-phone"
                        type="tel"
                        value={billing.phone}
                        onChange={e => handleInput("billing", "phone", e.target.value)}
                        className={formErrors.billing_phone ? "border-red-500" : ""}
                      />
                      {formErrors.billing_phone && (
                        <p className="text-sm text-red-500">{formErrors.billing_phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-address">Address *</Label>
                    <Input
                      id="billing-address"
                      value={billing.address}
                      onChange={e => handleInput("billing", "address", e.target.value)}
                      className={formErrors.billing_address ? "border-red-500" : ""}
                    />
                    {formErrors.billing_address && (
                      <p className="text-sm text-red-500">{formErrors.billing_address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billing-city">City *</Label>
                      <Input
                        id="billing-city"
                        value={billing.city}
                        onChange={e => handleInput("billing", "city", e.target.value)}
                        className={formErrors.billing_city ? "border-red-500" : ""}
                      />
                      {formErrors.billing_city && (
                        <p className="text-sm text-red-500">{formErrors.billing_city}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="billing-zip">ZIP Code *</Label>
                      <Input
                        id="billing-zip"
                        value={billing.zip}
                        onChange={e => handleInput("billing", "zip", e.target.value)}
                        className={formErrors.billing_zip ? "border-red-500" : ""}
                      />
                      {formErrors.billing_zip && (
                        <p className="text-sm text-red-500">{formErrors.billing_zip}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              {/* Remove payment method selection UI, just show Razorpay info */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img src="https://d6xcmfyh68wv8.cloudfront.net/newsroom-content/uploads/2024/05/Razorpay-Logo.jpg" alt="Razorpay" className="h-12 w-16 object-contain" />
                    <span className="font-medium">Pay securely with Razorpay</span>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Payment Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? "Processing Payment..." : `Pay ₹${total.toFixed(2)}`}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 