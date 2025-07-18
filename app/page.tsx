import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, ShoppingCart, Heart, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container py-24 lg:py-32">
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
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="Hero Product"
                width={600}
                height={600}
                className="rounded-2xl shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="container">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our wide range of categories and find exactly what you're looking for.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              { name: "Electronics", image: "/placeholder.svg?height=200&width=200", href: "/categories/electronics" },
              { name: "Clothing", image: "/placeholder.svg?height=200&width=200", href: "/categories/clothing" },
              {
                name: "Home & Garden",
                image: "/placeholder.svg?height=200&width=200",
                href: "/categories/home-garden",
              },
              { name: "Sports", image: "/placeholder.svg?height=200&width=200", href: "/categories/sports-outdoors" },
              { name: "Books", image: "/placeholder.svg?height=200&width=200", href: "/categories/books" },
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
      <section className="container">
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
            {[
              {
                id: "1",
                name: "Wireless Bluetooth Headphones",
                price: 199.99,
                comparePrice: 249.99,
                image: "/placeholder.svg?height=300&width=300",
                rating: 4.5,
                reviews: 128,
                badge: "Best Seller",
              },
              {
                id: "2",
                name: "Organic Cotton T-Shirt",
                price: 29.99,
                comparePrice: 39.99,
                image: "/placeholder.svg?height=300&width=300",
                rating: 4.3,
                reviews: 89,
                badge: "Eco-Friendly",
              },
              {
                id: "3",
                name: "Smart Home Security Camera",
                price: 89.99,
                comparePrice: 119.99,
                image: "/placeholder.svg?height=300&width=300",
                rating: 4.7,
                reviews: 156,
                badge: "New",
              },
              {
                id: "4",
                name: "Modern Table Lamp",
                price: 79.99,
                comparePrice: 99.99,
                image: "/placeholder.svg?height=300&width=300",
                rating: 4.4,
                reviews: 73,
                badge: "Sale",
              },
            ].map((product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3">{product.badge}</Badge>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(product.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">({product.reviews})</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-x-2">
                        <span className="font-bold text-lg">${product.price}</span>
                        {product.comparePrice && (
                          <span className="text-sm text-muted-foreground line-through">${product.comparePrice}</span>
                        )}
                      </div>
                      <Button size="sm">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50">
        <div className="container py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto">
                <ShoppingCart className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Free Shipping</h3>
              <p className="text-muted-foreground">Free shipping on all orders over $50. Fast and reliable delivery.</p>
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
