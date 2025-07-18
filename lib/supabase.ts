import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  compare_price?: number
  category_id: string
  images: string[]
  tags: string[]
  status: "active" | "draft" | "archived"
  featured: boolean
  inventory_quantity: number
  track_inventory: boolean
  created_at: string
  updated_at: string
  categories?: Category
  product_variants?: ProductVariant[]
  reviews?: Review[]
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price?: number
  compare_price?: number
  inventory_quantity: number
  options: Record<string, string>
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  created_at: string
}

export interface CartItem {
  id: string
  user_id?: string
  product_id: string
  variant_id?: string
  quantity: number
  created_at: string
  updated_at: string
  products?: Product
  product_variants?: ProductVariant
}

export interface WishlistItem {
  id: string
  user_id: string
  product_id: string
  created_at: string
  products?: Product
}

export interface Review {
  id: string
  product_id: string
  user_id: string
  rating: number
  title?: string
  comment?: string
  verified_purchase: boolean
  created_at: string
  profiles?: {
    full_name: string
  }
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total_amount: number
  shipping_address: any
  billing_address: any
  payment_status: "pending" | "paid" | "failed" | "refunded"
  payment_method?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  quantity: number
  price: number
  product_name: string
  variant_options: Record<string, string>
}

export interface Profile {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  role: "customer" | "admin"
  created_at: string
  updated_at: string
}
