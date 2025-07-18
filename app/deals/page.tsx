"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { supabase, type Product } from "@/lib/supabase"

export default function DealsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .gt("compare_price", 0)
      const deals = (data || []).filter(
        (product) => Number(product.compare_price) > Number(product.price)
      )
      setProducts(deals)
      setLoading(false)
    }
    fetchDeals()
  }, [])

  return (
    <div className="container py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Best Deals & Offers</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover the hottest deals and save big on top products!
        </p>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-0">
                <div className="bg-muted h-64 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="bg-muted h-4 rounded" />
                  <div className="bg-muted h-4 rounded w-2/3" />
                  <div className="bg-muted h-6 rounded w-1/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No deals available at the moment. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <Link href={`/products/${product.slug}`}>
                    <Image
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <Badge variant="destructive" className="absolute top-3 left-3">Deal</Badge>
                  {product.compare_price && product.compare_price > product.price && (
                    <Badge variant="secondary" className="absolute top-3 right-3">
                      Save ₹{(Number(product.compare_price) - Number(product.price)).toLocaleString()}
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-x-2">
                      <span className="font-bold text-lg">₹{product.price}</span>
                      {product.compare_price && (
                        <span className="text-sm text-muted-foreground line-through">₹{product.compare_price}</span>
                      )}
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/products/${product.slug}`}>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 