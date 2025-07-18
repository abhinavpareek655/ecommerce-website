"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Star, Heart, ShoppingCart, Minus, Plus, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase, type Product, type ProductVariant, type Review } from "@/lib/supabase"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "@/hooks/use-toast"
import MobileSlideshow from "@/components/ui/MobileSlideshow"

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({ rating: 5, title: "", comment: "" })
  const [loading, setLoading] = useState(true)

  const { addItem } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    if (slug) {
      loadProduct()
    }
  }, [slug])

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          categories (*),
          product_variants (*),
          reviews (
            *,
            profiles (full_name)
          )
        `)
        .eq("slug", slug)
        .eq("status", "active")
        .single()

      if (error) throw error

      setProduct(data)
      setReviews(data.reviews || [])

      // Set default variant if available
      if (data.product_variants && data.product_variants.length > 0) {
        setSelectedVariant(data.product_variants[0])
      }
    } catch (error) {
      console.error("Error loading product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    try {
      await addItem(product, selectedVariant || undefined, quantity)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      })
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !product) {
      toast({
        title: "Sign in required",
        description: "Please sign in to leave a review.",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("reviews").insert({
        product_id: product.id,
        user_id: user.id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
      })

      if (error) throw error

      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      })

      setNewReview({ rating: 5, title: "", comment: "" })
      loadProduct() // Reload to show new review
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review.",
        variant: "destructive",
      })
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return sum / reviews.length
  }

  const getCurrentPrice = () => {
    return selectedVariant?.price || product?.price || 0
  }

  const getComparePrice = () => {
    return selectedVariant?.compare_price || product?.compare_price
  }

  const getInventoryQuantity = () => {
    return selectedVariant?.inventory_quantity || product?.inventory_quantity || 0
  }

  if (loading) {
    return (
      <div className="container p-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-muted h-96 rounded-lg animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-muted h-20 rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-muted h-8 rounded animate-pulse" />
            <div className="bg-muted h-4 rounded animate-pulse" />
            <div className="bg-muted h-12 rounded animate-pulse" />
            <div className="bg-muted h-32 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <p className="text-muted-foreground mt-2">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const averageRating = getAverageRating()
  const currentPrice = getCurrentPrice()
  const comparePrice = getComparePrice()
  const inventoryQuantity = getInventoryQuantity()

  return (
    <div className="container p-8">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <MobileSlideshow
            slides={product.images.map((img, idx) => ({
              image: img || "/placeholder.svg",
              alt: `${product.name} ${idx + 1}`
            }))}
            autoPlayInterval={4000}
            imageClassName="object-contain bg-white"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.short_description}</p>

            {/* Rating */}
            {averageRating > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {averageRating.toFixed(1)} ({reviews.length} reviews)
                </span>
              </div>
            )}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold">${currentPrice}</span>
              {comparePrice && comparePrice > currentPrice && (
                <span className="text-xl text-muted-foreground line-through">${comparePrice}</span>
              )}
              {comparePrice && comparePrice > currentPrice && (
                <Badge variant="destructive">
                  {Math.round(((comparePrice - currentPrice) / comparePrice) * 100)}% OFF
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {inventoryQuantity > 0 ? `${inventoryQuantity} in stock` : "Out of stock"}
            </p>
          </div>

          {/* Variants */}
          {product.product_variants && product.product_variants.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Options</h3>
              <RadioGroup
                value={selectedVariant?.id}
                onValueChange={(value) => {
                  const variant = product.product_variants?.find((v) => v.id === value)
                  setSelectedVariant(variant || null)
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  {product.product_variants.map((variant) => (
                    <div key={variant.id}>
                      <RadioGroupItem value={variant.id} id={variant.id} className="peer sr-only" />
                      <Label
                        htmlFor={variant.id}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                      >
                        <span className="font-medium">{variant.name}</span>
                        {variant.price && variant.price !== product.price && (
                          <span className="text-sm text-muted-foreground">${variant.price}</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {variant.inventory_quantity > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="font-semibold">Quantity</h3>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(inventoryQuantity, quantity + 1))}
                disabled={quantity >= inventoryQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={inventoryQuantity === 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-4 w-4 mr-2" />
              Wishlist
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="space-y-6">
              {/* Reviews Summary */}
              {reviews.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-3xl font-bold">{averageRating.toFixed(1)}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < Math.floor(averageRating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Add Review Form */}
              {user && (
                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                              className="p-1"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  i < newReview.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="review-title">Title</Label>
                        <input
                          id="review-title"
                          type="text"
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Review title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="review-comment">Comment</Label>
                        <Textarea
                          id="review-comment"
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Share your thoughts about this product..."
                          rows={4}
                        />
                      </div>
                      <Button type="submit">Submit Review</Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{review.profiles?.full_name || "Anonymous"}</span>
                              {review.verified_purchase && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(review.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.title && <h4 className="font-semibold">{review.title}</h4>}
                        {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {reviews.length === 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Shipping Information</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Free shipping on orders over $50</li>
                      <li>• Standard shipping: 3-5 business days</li>
                      <li>• Express shipping: 1-2 business days</li>
                      <li>• International shipping available</li>
                    </ul>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2">Return Policy</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• 30-day return policy</li>
                      <li>• Items must be in original condition</li>
                      <li>• Free returns for defective items</li>
                      <li>• Return shipping costs may apply</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
