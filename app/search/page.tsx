"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart } from "lucide-react"
import { supabase, type Product } from "@/lib/supabase"

function fuzzyMatch(str: string, query: string) {
  return str.toLowerCase().includes(query.toLowerCase())
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [products, setProducts] = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
      setProducts(data || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (!query) {
      setFiltered([])
      return
    }
    // Fuzzy search: name, description, tags
    const q = query.trim().toLowerCase()
    let results = products.filter(
      (p) =>
        fuzzyMatch(p.name, q) ||
        fuzzyMatch(p.description || "", q) ||
        (p.tags && p.tags.some((tag) => fuzzyMatch(tag, q)))
    )
    // If no results, show popular/random products as fallback
    if (results.length === 0) {
      results = products
        .filter((p) => p.featured)
        .concat(products)
        .slice(0, 8)
    }
    setFiltered(results)
  }, [query, products])

  return (
    <div className="container py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Search Products</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find products by name, description, or tags. Use the search bar in the header.
        </p>
      </div>
      {!query ? (
        <div className="text-center py-12 text-muted-foreground">
          Use the search bar in the header to find products.
        </div>
      ) : loading ? (
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
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
                  {product.featured && <Badge className="absolute top-3 left-3">Featured</Badge>}
                  {product.compare_price && product.compare_price > product.price && (
                    <Badge variant="destructive" className="absolute top-3 right-3">
                      Sale
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