"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"
import { supabase } from "@/lib/supabase"
import Script from "next/script";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID";

export default function CheckoutPage() {
  const { user } = useAuth()
  const { items, totalPrice, clearCart } = useCart()
  const [shipping, setShipping] = useState({ name: "", address: "", city: "", zip: "" })
  const [billing, setBilling] = useState({ name: "", address: "", city: "", zip: "" })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

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
    if (type === "shipping") setShipping({ ...shipping, [field]: value })
    else setBilling({ ...billing, [field]: value })
  }

  const handleRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    // Validate form fields here if needed
    const amount = Math.round(totalPrice * 100); // Razorpay expects amount in paise
    const order_id = "order_" + Math.random().toString(36).slice(2);
    const options = {
      key: RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "Ecommerce",
      description: "Order Payment",
      order_id,
      handler: async function (response: any) {
        try {
          const { data, error } = await supabase.from("orders").insert({
            user_id: user.id,
            order_number: order_id,
            status: "paid",
            total_amount: totalPrice,
            shipping_address: shipping,
            billing_address: billing,
            payment_status: "paid",
            payment_method: "razorpay",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }).select().single();
          if (error) throw error;
          for (const item of items) {
            const price = item.product_variants?.price ?? item.products?.price ?? 0;
            await supabase.from("order_items").insert({
              order_id: data.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              price,
              product_name: item.product_variants?.name || item.products?.name || "",
              variant_options: item.product_variants?.options || {},
            });
          }
          await clearCart();
          setSuccess(true);
        } catch (err: any) {
          setError(err.message || "Failed to place order.");
        } finally {
          setLoading(false);
        }
      },
      prefill: {
        name: shipping.name,
        email: user.email,
      },
      theme: {
        color: "#facc15",
      },
    };
    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Order placed successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Thank you for your purchase. You can view your order history below.</p>
            <Button asChild className="w-full">
              <Link href="/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="container py-12 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="mb-6 divide-y">
              {items.map((item) => (
                <li key={item.id} className="py-2 flex justify-between items-center">
                  <span>
                    {item.products?.name}
                    {item.product_variants?.name ? ` (${item.product_variants.name})` : ""} x {item.quantity}
                  </span>
                  <span>${((item.product_variants?.price ?? item.products?.price ?? 0) * item.quantity).toFixed(2)}</span>
                </li>
              ))}
              <li className="py-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </li>
            </ul>
            <form onSubmit={handleRazorpay} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Full Name" value={shipping.name} onChange={e => handleInput("shipping", "name", e.target.value)} required />
                  <Input placeholder="Address" value={shipping.address} onChange={e => handleInput("shipping", "address", e.target.value)} required />
                  <Input placeholder="City" value={shipping.city} onChange={e => handleInput("shipping", "city", e.target.value)} required />
                  <Input placeholder="ZIP Code" value={shipping.zip} onChange={e => handleInput("shipping", "zip", e.target.value)} required />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Billing Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input placeholder="Full Name" value={billing.name} onChange={e => handleInput("billing", "name", e.target.value)} required />
                  <Input placeholder="Address" value={billing.address} onChange={e => handleInput("billing", "address", e.target.value)} required />
                  <Input placeholder="City" value={billing.city} onChange={e => handleInput("billing", "city", e.target.value)} required />
                  <Input placeholder="ZIP Code" value={billing.zip} onChange={e => handleInput("billing", "zip", e.target.value)} required />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Payment Method</h2>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                    />
                    Razorpay
                  </label>
                  {/* Add more payment options here if needed */}
                </div>
              </div>
              {error && <div className="text-red-500 text-center">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Pay & Place Order"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 