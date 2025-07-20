"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { supabase, type Order } from "@/lib/supabase"

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      setOrders(data || [])
      setLoading(false)
    }
    fetchOrders()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sign in to view your orders</CardTitle>
            <CardDescription>You must be signed in to see your order history.</CardDescription>
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

  return (
    <div className="container p-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      {loading ? (
        <div>Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-muted-foreground py-24">
          <h2 className="text-xl font-semibold mb-2">No orders found</h2>
          <p>You haven't placed any orders yet.</p>
          <Button asChild className="mt-6">
            <Link href="/products">Shop Now</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>Order #{order.order_number}</CardTitle>
                <CardDescription>
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge>{order.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total:</span>
                  <span className="font-semibold">₹{order.total_amount.toFixed(2)}</span>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-4 w-full">
                  <Link href={`/orders/${order.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 