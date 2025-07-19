"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { supabase, type Category, type Product } from "@/lib/supabase"
import { Star, Heart, ShoppingCart, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/hooks/use-cart"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/use-auth"

export default function CategoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { addItem } = useCart()
  const { user } = useAuth()
  const [reviewDialogOpen, setReviewDialogOpen] = useState<string | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Helper to get average rating
  const getAverageRating = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  // Add to cart handler
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

  // Add review handler
  const handleSubmitReview = async (e: React.FormEvent, productId: string) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      })
      return
    }
    setSubmittingReview(true)
    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        user_id: user.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      })
      if (error) throw error
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      })
      setReviewForm({ rating: 5, title: "", comment: "" })
      setReviewDialogOpen(null)
      // Reload products to show new review
      loadCategoryAndProducts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    if (slug) {
      loadCategoryAndProducts()
    }
    // eslint-disable-next-line
  }, [slug])

  const loadCategoryAndProducts = async () => {
    setLoading(true)
    try {
      // Fetch category by slug
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single()
      if (categoryError || !categoryData) {
        setCategory(null)
        setProducts([])
        setLoading(false)
        return
      }
      setCategory(categoryData)
      // Fetch products for this category
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", categoryData.id)
        .eq("status", "active")
      console.log("[DEBUG] productsData:", productsData)
      console.log("[DEBUG] productsError:", productsError)
      setProducts(productsError ? [] : productsData || [])
    } catch (e) {
      console.log("[DEBUG] Exception:", e)
      setCategory(null)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Loading...</h1>
        </div>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="container py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">Category not found</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">The category you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container p-8">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
            <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">{category.description}</p>
        </div>
        <div className="flex items-center border rounded-md">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("grid")}> <Grid className="h-4 w-4" /> </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" onClick={() => setViewMode("list")}> <List className="h-4 w-4" /> </Button>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="text-center text-muted-foreground">No products found in this category.</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const averageRating = getAverageRating(product.reviews || [])
            return (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Link href={`/products/${product.slug}`}>
                      <Image
                        src={product.images?.[0] || "/placeholder.svg?height=300&width=300"}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {product.featured && <Badge className="absolute top-3 left-3">Featured</Badge>}
                    {product.compare_price && product.compare_price > product.price && (
                      <Badge variant="destructive" className="absolute top-3 right-3">Sale</Badge>
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
                                className={`h-3 w-3 ${i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
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
                        <span className="font-bold text-lg">${product.price}</span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ${product.compare_price}
                          </span>
                        )}
                      </div>
                      <Button size="sm" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 flex justify-end">
                    {user ? (
                      <Dialog open={reviewDialogOpen === product.id} onOpenChange={open => setReviewDialogOpen(open ? product.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Add Review</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Write a Review for {product.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={e => handleSubmitReview(e, product.id)} className="space-y-4">
                            <div className="space-y-2">
                              <label className="font-medium">Rating</label>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                                    className="p-1"
                                  >
                                    <Star
                                      className={`h-6 w-6 ${i < reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="font-medium">Title</label>
                              <input
                                type="text"
                                value={reviewForm.title}
                                onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Review title"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-medium">Comment</label>
                              <Textarea
                                value={reviewForm.comment}
                                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                placeholder="Share your thoughts about this product..."
                                rows={4}
                              />
                            </div>
                            <Button type="submit" disabled={submittingReview}>
                              {submittingReview ? "Submitting..." : "Submit Review"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center w-full">
                        <span>You must </span>
                        <Link href="/auth/signin" className="text-yellow-600 hover:text-yellow-500 underline">sign in</Link>
                        <span> to add a review.</span>
                      </div>
                    )}
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
                          src={product.images?.[0] || "/placeholder.svg?height=200&width=200"}
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
                                    className={`h-4 w-4 ${i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
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
                        {product.tags?.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="space-x-2">
                          <span className="font-bold text-2xl">${product.price}</span>
                          {product.compare_price && product.compare_price > product.price && (
                            <span className="text-lg text-muted-foreground line-through">
                              ${product.compare_price}
                            </span>
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
                  <div className="flex justify-end mt-4">
                    {user ? (
                      <Dialog open={reviewDialogOpen === product.id} onOpenChange={open => setReviewDialogOpen(open ? product.id : null)}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Add Review</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Write a Review for {product.name}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={e => handleSubmitReview(e, product.id)} className="space-y-4">
                            <div className="space-y-2">
                              <label className="font-medium">Rating</label>
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, i) => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                                    className="p-1"
                                  >
                                    <Star
                                      className={`h-6 w-6 ${i < reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="font-medium">Title</label>
                              <input
                                type="text"
                                value={reviewForm.title}
                                onChange={e => setReviewForm({ ...reviewForm, title: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md"
                                placeholder="Review title"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="font-medium">Comment</label>
                              <Textarea
                                value={reviewForm.comment}
                                onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                placeholder="Share your thoughts about this product..."
                                rows={4}
                              />
                            </div>
                            <Button type="submit" disabled={submittingReview}>
                              {submittingReview ? "Submitting..." : "Submit Review"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center w-full">
                        <span>You must </span>
                        <Link href="/auth/signin" className="text-yellow-600 hover:text-yellow-500 underline">sign in</Link>
                        <span> to add a review.</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 