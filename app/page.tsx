"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, ArrowRight } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"
import { useEffect, useState } from "react";
import { supabase, type Product } from "@/lib/supabase";
import MobileSlideshow from "@/components/ui/MobileSlideshow"
import { toast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("status", "active")
        .limit(4); // or however many you want to show

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

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

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background p-8">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  New Collection Available
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">Discover Amazing Products</h1>
                <p className="text-xl text-muted-foreground max-w-md">
                  Shop the latest trends and find everything you need in one place. Quality products, great prices, fast
                  shipping.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <MobileSlideshow
                slides={[
                  { image: "https://mir-s3-cdn-cf.behance.net/project_modules/hd/84589835172167.56ec20e07a472.png", alt: "Hero Slide 1" },
                  { image: "https://media.licdn.com/dms/image/v2/D4E12AQGCmU6lCJwRtg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1737891571244?e=2147483647&v=beta&t=xCz3GruyQoy4bvHpdi0XSOqorwWGq5_ouIgOTzqsXqQ", alt: "Hero Slide 2" },
                  { image: "https://i.ytimg.com/vi/GDlkCkcIqTs/maxresdefault.jpg", alt: "Hero Slide 3" },
                  { image: "https://image-us.samsung.com/us/smartphones/galaxy-z-flip7/images/Gallery/SCOMB7Q7-282-B7_Static_KV_PC_800x600.jpg?$product-details-jpg$", alt: "Hero Slide 4" },
                  { image: "https://newspaperads.ads2publish.com/wp-content/uploads/2017/10/sony-the-next-big-thing-is-small-the-sony-6000-mirroriess-camera-so-compact-it-can-take-you-anywhere-ad-deccan-chronicle-hyderabad-06-10-2017.png", alt: "Hero Slide 5" },
                ]}
                autoPlayInterval={3000}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container px-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of categories and find exactly what you're looking for.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: "Electronics", image: "https://www.shutterstock.com/image-illustration/collection-consumer-electronics-flying-air-600nw-738107467.jpg", href: "/categories/electronics" },
              { name: "Clothing", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8c_q2rwvnVYE2x4ZjkiWnb_7iWoSoQsouFQ&s", href: "/categories/clothing" },
              {
                name: "Home & Garden",
                image: "https://www.ugaoo.com/cdn/shop/articles/garden_tools.jpg?v=1689148680",
                href: "/categories/home-garden",
              },
              { name: "Sports", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHSQ96Vzp-kbBc1sjUHVMLp27BPXlkbdyAyw&s", href: "/categories/sports-outdoors" },
              { name: "Books", image: "https://images.theconversation.com/files/45159/original/rptgtpxd-1396254731.jpg?ixlib=rb-4.1.0&q=45&auto=format&w=754&fit=clip", href: "/categories/books" },
            ].map((category) => (
              <Link key={category.name} href={category.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4 text-center space-y-3">
                    <div className="relative overflow-hidden rounded-lg">
                      <Image
                        src={category.image || "/placeholder.svg"}
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
        </div>
      </section>

      {/* Featured Products */}
      <section className="container px-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground">Handpicked products just for you</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Show skeletons or loading state
              [...Array(4)].map((_, i) => (
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
              ))
            ) : (
              products.map((product) => (
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
                      </ Link>
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
                        {/* Add rating and reviews if you fetch them */}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-x-2">
                          <span className="font-bold text-lg">₹{product.price}</span>
                          {product.compare_price && (
                            <span className="text-sm text-muted-foreground line-through">${product.compare_price}</span>
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
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 px-8">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Free Shipping</h3>
              <p className="text-muted-foreground">Free shipping on all orders over ₹50. Fast and reliable delivery.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Quality Guarantee</h3>
              <p className="text-muted-foreground">We stand behind our products with a 30-day money-back guarantee.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <Star className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">24/7 Support</h3>
              <p className="text-muted-foreground">Our customer support team is here to help you anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
