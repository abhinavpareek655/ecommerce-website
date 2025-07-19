"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import Script from "next/script";

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID"; 

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems, loading } = useCart()

  if (loading) {
    return (
      <div className="container p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <div className="text-center space-y-6">
          <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground">Looks like you haven't added any items to your cart yet.</p>
          </div>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Razorpay handler
  const handleRazorpay = async (e: React.FormEvent) => {
    e.preventDefault();
    // setLoading(true); // This state is not defined in this file, so commenting out
    // setError(""); // This state is not defined in this file, so commenting out

    // Validate form fields here if needed

    // 1. Create a payment order on your backend (recommended) or here for demo
    // For demo, we'll use a random order_id and amount in paise
    const amount = Math.round(totalPrice * 100); // Razorpay expects amount in paise
    const order_id = "order_" + Math.random().toString(36).slice(2);

    // 2. Open Razorpay modal
    const options = {
      key: RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "Ecommerce",
      description: "Order Payment",
      order_id, // In production, get this from your backend
      handler: async function (response: any) {
        // 3. On payment success, create order in Supabase
        try {
          // Assuming supabase, user, shipping, billing, setSuccess, setError, setLoading are available in the scope
          // where this function is called. For this example, we'll just log success.
          console.log("Razorpay payment successful!");
          console.log("Order ID:", order_id);
          console.log("Amount:", amount);
          console.log("Response:", response);

          // In a real application, you would send order_id and amount to your backend
          // to create the order in Supabase and get the actual order_id.
          // For this example, we'll simulate the Supabase call.

          // Simulate Supabase call for demonstration
          // await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

          // Example of how you might integrate with your backend
          // const response = await fetch('/api/create-order', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'application/json',
          //   },
          //   body: JSON.stringify({ order_id, amount }),
          // });
          // if (!response.ok) {
          //   throw new Error('Failed to create order in Supabase');
          // }
          // const data = await response.json();
          // console.log('Order created in Supabase:', data);

          // For this example, we'll just clear the cart on successful payment
          // In a real app, you'd update the order status in Supabase
          // and potentially redirect to a success page.
          // await clearCart(); // This function is not defined in this file
          // setSuccess(true); // This state is not defined in this file
          // setError("Order placed successfully!"); // This state is not defined in this file
        } catch (err: any) {
          // setError(err.message || "Failed to place order."); // This state is not defined in this file
          console.error("Razorpay payment failed:", err);
        } finally {
          // setLoading(false); // This state is not defined in this file
        }
      },
      prefill: {
        // Assuming shipping and billing objects are available in the scope
        // where this function is called.
        name: "John Doe", // Placeholder
        email: "john@example.com", // Placeholder
      },
      theme: {
        color: "#facc15", // yellow-400
      },
    };

    // @ts-ignore
    const rzp = new window.Razorpay(options);
    rzp.open();
    // setLoading(false); // This state is not defined in this file
  };

  return (
    <div className="container p-8">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {totalItems} {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.products
              const variant = item.product_variants
              const price = variant?.price || product?.price || 0
              const comparePrice = variant?.compare_price || product?.compare_price

              return (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          src={product?.images?.[0] || "/placeholder.svg?height=150&width=150"}
                          alt={product?.name || "Product"}
                          width={150}
                          height={150}
                          className="w-full h-32 object-cover"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <div>
                          <Link
                            href={`/products/${product?.slug}`}
                            className="font-semibold hover:text-primary transition-colors"
                          >
                            {product?.name}
                          </Link>
                          {variant && <p className="text-sm text-muted-foreground">{variant.name}</p>}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">${price}</span>
                          {comparePrice && comparePrice > price && (
                            <span className="text-sm text-muted-foreground line-through">${comparePrice}</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between items-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="text-right">
                          <p className="font-semibold">${(price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    {totalPrice >= 50 ? (
                      <span>
                        <span className="line-through text-muted-foreground mr-2">$9.99</span>
                        <span className="text-green-600 font-semibold">Free</span>
                      </span>
                    ) : (
                      <span>$9.99</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${(totalPrice + (totalPrice >= 50 ? 0 : 9.99) + totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/products">Continue Shopping</Link>
                  </Button>
                </div>

                {totalPrice < 50 && (
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
    </div>
  )
}
