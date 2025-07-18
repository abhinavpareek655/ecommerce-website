"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { supabase, type CartItem, type Product, type ProductVariant } from "@/lib/supabase"
import { useAuth } from "./use-auth"
import { toast } from "@/hooks/use-toast"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  totalItems: number
  totalPrice: number
  loading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Load cart items
  useEffect(() => {
    loadCart()
  }, [user])

  const loadCart = async () => {
    setLoading(true)
    try {
      if (user) {
        // Load from Supabase for authenticated users
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            *,
            products (*),
            product_variants (*)
          `)
          .eq("user_id", user.id)

        if (error) throw error
        setItems(data || [])
      } else {
        // Load from localStorage for guests
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
          const cartData = JSON.parse(savedCart)
          // Fetch product details for cart items
          if (cartData.length > 0) {
            const productIds = cartData.map((item: any) => item.product_id)
            const { data: products } = await supabase
              .from("products")
              .select(`
                *,
                product_variants (*)
              `)
              .in("id", productIds)

            const enrichedItems = cartData.map((item: any) => {
              const product = products?.find((p) => p.id === item.product_id)
              const variant = product?.product_variants?.find((v: any) => v.id === item.variant_id)
              return {
                ...item,
                products: product,
                product_variants: variant,
              }
            })
            setItems(enrichedItems)
          }
        }
      }
    } catch (error) {
      console.error("Error loading cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const addItem = async (product: Product, variant?: ProductVariant, quantity = 1) => {
    try {
      if (user) {
        // Add to Supabase for authenticated users
        const { data, error } = await supabase
          .from("cart_items")
          .upsert(
            {
              user_id: user.id,
              product_id: product.id,
              variant_id: variant?.id,
              quantity,
            },
            {
              onConflict: "user_id,product_id,variant_id",
            },
          )
          .select(`
            *,
            products (*),
            product_variants (*)
          `)

        if (error) throw error
        await loadCart() // Reload cart
      } else {
        // Add to localStorage for guests
        const cartItem = {
          id: `temp-${Date.now()}`,
          product_id: product.id,
          variant_id: variant?.id,
          quantity,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          products: product,
          product_variants: variant,
        }

        const existingIndex = items.findIndex(
          (item) => item.product_id === product.id && item.variant_id === variant?.id,
        )

        let newItems
        if (existingIndex >= 0) {
          newItems = [...items]
          newItems[existingIndex].quantity += quantity
        } else {
          newItems = [...items, cartItem]
        }

        setItems(newItems)
        localStorage.setItem(
          "cart",
          JSON.stringify(
            newItems.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              created_at: item.created_at,
              updated_at: item.updated_at,
            })),
          ),
        )
      }

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      })
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      if (user) {
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId)

        if (error) throw error
        await loadCart()
      } else {
        const newItems = items.filter((item) => item.id !== itemId)
        setItems(newItems)
        localStorage.setItem(
          "cart",
          JSON.stringify(
            newItems.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              created_at: item.created_at,
              updated_at: item.updated_at,
            })),
          ),
        )
      }

      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      })
    } catch (error) {
      console.error("Error removing from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      })
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    try {
      if (user) {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity, updated_at: new Date().toISOString() })
          .eq("id", itemId)

        if (error) throw error
        await loadCart()
      } else {
        const newItems = items.map((item) =>
          item.id === itemId ? { ...item, quantity, updated_at: new Date().toISOString() } : item,
        )
        setItems(newItems)
        localStorage.setItem(
          "cart",
          JSON.stringify(
            newItems.map((item) => ({
              id: item.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              created_at: item.created_at,
              updated_at: item.updated_at,
            })),
          ),
        )
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update item quantity.",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    try {
      if (user) {
        const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)

        if (error) throw error
      } else {
        localStorage.removeItem("cart")
      }
      setItems([])
    } catch (error) {
      console.error("Error clearing cart:", error)
    }
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product_variants?.price || item.products?.price || 0
    return sum + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
