"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Grid, List, Filter, Star, Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { supabase, type Product, type Category } from "@/lib/supabase"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/hooks/use-toast"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("featured")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { addItem } = useCart()

  const itemsPerPage = 12

  useEffect(() => {
    loadCategories()
    loadProducts()
  }, [currentPage, sortBy, selectedCategories, priceRange, searchQuery])

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase.from("categories").select("*").order("name")

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadProducts = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from("products")
        .select(
          `
          *,
          categories (*),
          product_variants (*),
          reviews (rating)
        `,
          { count: "exact" },
        )
        .eq("status", "active")
        .gte("price", priceRange[0])
        .lte("price", priceRange[1])

      // Apply category filter
      if (selectedCategories.length > 0) {
        query = query.in("category_id", selectedCategories)
      }

      // Apply search filter
      if (searchQuery) {
        query = query.textSearch("name", searchQuery)
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          query = query.order("price", { ascending: true })
          break
        case "price-high":
          query = query.order("price", { ascending: false })
          break
        case "name":
          query = query.order("name", { ascending: true })
          break
        case "newest":
          query = query.order("created_at", { ascending: false })
          break
        default:
          query = query.order("featured", { ascending: false }).order("created_at", { ascending: false })
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      setProducts(data || [])
      setTotalPages(Math.ceil((count || 0) / itemsPerPage))
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
    setCurrentPage(1)
  }

  const handleAddToCart = async (product: Product) => {
    try {
      await addItem(product)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      })
    }
  }

  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-semibold">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
              />
              <Label htmlFor={category.id} className="text-sm font-normal">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-semibold">Price Range</h3>
        <div className="space-y-4">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            min={0}
            max={1000}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Discover our amazing collection of products</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Search */}
            <Input
              placeholder="Search products..."
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-64"
            />

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center border rounded-md">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}>
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Filter */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden bg-transparent">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Card>
              <CardContent className="p-6">
                <FilterSidebar />
              </CardContent>
            </Card>
          </div>

          {/* Products */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => {
                      const averageRating = getAverageRating(product.reviews || [])
                      return (
                        <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-0">
                            <div className="relative overflow-hidden rounded-t-lg">
                              <Link href={`/products/${product.slug}`}>
                                <Image
                                  src={product.images[0] || "/placeholder.svg?height=300&width=300"}
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
                                <Link href={`/products/${product.slug}`}>
                                  <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                                    {product.name}
                                  </h3>
                                </Link>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {product.short_description}
                                </p>
                                {averageRating > 0 && (
                                  <div className="flex items-center space-x-1">
                                    <div className="flex items-center">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`h-3 w-3 ${
                                            i < Math.floor(averageRating)
                                              ? "fill-yellow-400 text-yellow-400"
                                              : "text-muted-foreground"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      ({product.reviews?.length || 0})
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="space-x-2">
                                  <span className="font-bold text-lg">₹{product.price}</span>
                                  {product.compare_price && product.compare_price > product.price && (
                                    <span className="text-sm text-muted-foreground line-through">₹{product.compare_price}</span>
                                  )}
                                </div>
                                <Button size="sm" onClick={() => handleAddToCart(product)}>
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => {
                      const averageRating = getAverageRating(product.reviews || [])
                      return (
                        <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="grid md:grid-cols-4 gap-6">
                              <div className="relative overflow-hidden rounded-lg">
                                <Link href={`/products/${product.slug}`}>
                                  <Image
                                    src={product.images[0] || "/placeholder.svg?height=200&width=200"}
                                    alt={product.name}
                                    width={200}
                                    height={200}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </Link>
                              </div>
                              <div className="md:col-span-2 space-y-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <Link href={`/products/${product.slug}`}>
                                      <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                        {product.name}
                                      </h3>
                                    </Link>
                                    {averageRating > 0 && (
                                      <div className="flex items-center space-x-1">
                                        <div className="flex items-center">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`h-4 w-4 ${
                                                i < Math.floor(averageRating)
                                                  ? "fill-yellow-400 text-yellow-400"
                                                  : "text-muted-foreground"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                          ({product.reviews?.length || 0} reviews)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {product.featured && <Badge>Featured</Badge>}
                                    {product.compare_price && product.compare_price > product.price && (
                                      <Badge variant="destructive">Sale</Badge>
                                    )}
                                  </div>
                                </div>
                                <p className="text-muted-foreground">{product.description}</p>
                                <div className="flex flex-wrap gap-1">
                                  {product.tags.slice(0, 3).map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="space-x-2">
                                    <span className="font-bold text-2xl">₹{product.price}</span>
                                    {product.compare_price && product.compare_price > product.price && (
                                      <span className="text-lg text-muted-foreground line-through">₹{product.compare_price}</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {product.inventory_quantity > 0 ? "In Stock" : "Out of Stock"}
                                  </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    onClick={() => handleAddToCart(product)}
                                    disabled={product.inventory_quantity === 0}
                                  >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Heart className="h-4 w-4 mr-2" />
                                    Wishlist
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
