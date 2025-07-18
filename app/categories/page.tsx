"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { supabase, type Category } from "@/lib/supabase"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("categories").select("*").order("name")
      if (!error) setCategories(data || [])
      setLoading(false)
    }
    fetchCategories()
  }, [])

  return (
    <div className="container py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">Shop by Category</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our wide range of categories and find exactly what you're looking for.
        </p>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4 text-center space-y-3">
                <div className="bg-muted h-32 w-full rounded-lg" />
                <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-4 text-center space-y-3">
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name}
                      width={200}
                      height={200}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 