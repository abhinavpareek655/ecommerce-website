# E-commerce App: Components & Flow Documentation

This document provides a comprehensive reference for all reusable components, hooks, database structure, authentication/profile flow, cart/order management, and payment integration in this e-commerce app. Use this as a guide for building similar projects or porting features.

---

## Table of Contents
1. [UI Components](#ui-components)
2. [Custom Hooks](#custom-hooks)
3. [Database Schema & Triggers](#database-schema--triggers)
4. [Authentication & Profile Flow](#authentication--profile-flow)
5. [Cart Management](#cart-management)
6. [Order Creation & Management](#order-creation--management)
7. [Payment Integration (Razorpay)](#payment-integration-razorpay)

---

## UI Components

All UI components are in `components/ui/`. They are headless, accessible, and styled with Tailwind CSS. Most are wrappers around Radix UI primitives.

### Common Components
- **Button**: `<Button variant="outline|ghost|destructive|secondary|link" size="sm|lg|icon">`
- **Input**: `<Input type="text|email|password" />`
- **Card**: `<Card>`, `<CardHeader>`, `<CardTitle>`, `<CardContent>`, `<CardFooter>`
- **Alert**: `<Alert variant="destructive|default">`, `<AlertTitle>`, `<AlertDescription>`
- **Avatar**: `<Avatar>`, `<AvatarImage src=...>`, `<AvatarFallback>`
- **Badge**: `<Badge variant="secondary|destructive|outline">`
- **Label**: `<Label htmlFor="...">`
- **Dialog**: `<Dialog>`, `<DialogTrigger>`, `<DialogContent>`, `<DialogHeader>`, `<DialogFooter>`, `<DialogTitle>`, `<DialogDescription>`
- **AlertDialog**: `<AlertDialog>`, `<AlertDialogTrigger>`, `<AlertDialogContent>`, `<AlertDialogHeader>`, `<AlertDialogFooter>`, `<AlertDialogTitle>`, `<AlertDialogDescription>`, `<AlertDialogAction>`, `<AlertDialogCancel>`
- **Tabs**: `<Tabs>`, `<TabsList>`, `<TabsTrigger>`, `<TabsContent>`
- **Table**: `<Table>`, `<TableHeader>`, `<TableBody>`, `<TableRow>`, `<TableCell>`, `<TableHead>`, `<TableFooter>`, `<TableCaption>`
- **Pagination**: `<Pagination>`, `<PaginationContent>`, `<PaginationItem>`, `<PaginationLink>`, `<PaginationPrevious>`, `<PaginationNext>`, `<PaginationEllipsis>`
- **Accordion**: `<Accordion>`, `<AccordionItem>`, `<AccordionTrigger>`, `<AccordionContent>`
- **Select**: `<Select>`, `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>`, `<SelectLabel>`, `<SelectSeparator>`
- **Checkbox**: `<Checkbox />`
- **Switch**: `<Switch />`
- **Slider**: `<Slider />`
- **Drawer**: `<Drawer>`, `<DrawerTrigger>`, `<DrawerContent>`, `<DrawerHeader>`, `<DrawerFooter>`, `<DrawerTitle>`, `<DrawerDescription>`
- **Popover**: `<Popover>`, `<PopoverTrigger>`, `<PopoverContent>`
- **Tooltip**: `<Tooltip>`, `<TooltipTrigger>`, `<TooltipContent>`
- **Breadcrumb**: `<Breadcrumb>`, `<BreadcrumbList>`, `<BreadcrumbItem>`, `<BreadcrumbLink>`, `<BreadcrumbPage>`, `<BreadcrumbSeparator>`, `<BreadcrumbEllipsis>`
- **Calendar**: `<Calendar />` (uses `react-day-picker`)
- **Command**: `<CommandDialog>`, `<CommandInput>`, `<CommandList>`, `<CommandItem>`, `<CommandGroup>`, `<CommandSeparator>`
- **Toast**: `<ToastProvider>`, `<Toast>`, `<ToastTitle>`, `<ToastDescription>`, `<ToastAction>`, `<ToastClose>`
- **Skeleton**: `<Skeleton />`
- **Sonner**: `<Toaster />` (uses `sonner` for notifications)

### Layout Components
- **Header**: Navigation, search, user menu, cart badge, theme toggle.
- **Footer**: Company info, quick links, newsletter, social icons.
- **ThemeProvider**: Wraps app for light/dark mode (uses `next-themes`).

---

## Custom Hooks

- **useAuth**: Authentication state, profile loading, sign in/up/out, profile creation.
- **useCart**: Cart state, add/remove/update/clear, syncs with Supabase for logged-in users and localStorage for guests.
- **useToast**: Toast notification system (success/error/info feedback).

---

## Database Schema & Triggers

See `scripts/01-create-tables.sql` for full schema. Key tables:

- **profiles**: User info, linked to `auth.users` (id, email, full_name, avatar_url, role)
- **categories**: Product categories (id, name, slug, ...)
- **products**: Products (id, name, slug, price, compare_price, ...)
- **product_variants**: Variants (id, product_id, name, price, ...)
- **cart_items**: User cart (id, user_id, product_id, variant_id, quantity, ...)
- **wishlist**: User wishlist (id, user_id, product_id, ...)
- **orders**: Orders (id, user_id, order_number, status, total_amount, shipping_address, billing_address, payment_status, payment_method, payment_id, ...)
- **order_items**: Items in an order (id, order_id, product_id, variant_id, quantity, price, product_name, variant_name, ...)
- **reviews**: Product reviews (id, product_id, user_id, rating, title, comment, ...)

### Profile Creation Trigger
- On user signup, a trigger (`on_auth_user_created`) and function (`handle_new_user`) auto-create a `profiles` row from `auth.users` and user metadata (full name, avatar).

### Row Level Security (RLS)
- Policies restrict access: users can only see/update their own profile, cart, orders, etc. See SQL for details.

---

## Authentication & Profile Flow

- **Sign Up**: User provides email, password, full name, avatar. Supabase Auth creates user in `auth.users`.
- **Profile Creation**: Trigger auto-inserts into `profiles` with user id, email, full name, avatar_url.
- **Sign In**: User logs in with email/password. Profile is loaded from `profiles`.
- **Profile Update**: Users can update their profile (full name, avatar, etc.) via UI and Supabase.

---

## Cart Management

- **useCart** hook manages cart state.
- **Logged-in users**: Cart is stored in Supabase `cart_items` table. All add/remove/update actions sync with backend.
- **Guests**: Cart is stored in `localStorage`. Product/variant details are fetched as needed.
- **Cart API**:
  - `addItem(product, variant?, quantity?)`
  - `removeItem(itemId)`
  - `updateQuantity(itemId, quantity)`
  - `clearCart()`
  - `totalItems`, `totalPrice`, `items`, `loading`

---

## Order Creation & Management

- **Order Placement**: On checkout, an order is created in `orders` with user, address, payment info, etc.
- **Order Items**: Each product/variant in the cart is inserted into `order_items` linked to the order.
- **Order Status**: Tracked via `status` and `payment_status` fields. RLS ensures users only see their own orders.
- **Order Listing**: `/orders` page fetches and displays all orders for the logged-in user.

---

## Payment Integration (Razorpay)

- **API Route**: `/api/create-razorpay-order` securely creates a Razorpay order using backend keys.
- **Frontend**: Loads Razorpay Checkout.js, opens modal with order details, handles payment success/failure.
- **Order Update**: On payment success, order is marked as paid and `payment_id` is stored.
- **Customization**: Razorpay modal can be styled via options.

---

## Example: Profile Creation Trigger (SQL)
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## Example: Cart Management (useCart)
```ts
const { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, loading } = useCart()
addItem(product, variant, 2)
removeItem(itemId)
updateQuantity(itemId, 3)
clearCart()
```

---

## Example: Creating a Razorpay Order (API Route)
```ts
// /api/create-razorpay-order/route.ts
export async function POST(req: NextRequest) {
  // ...
  const razorpay = new Razorpay({ key_id, key_secret })
  const order = await razorpay.orders.create({
    amount, // in paise
    currency,
    payment_capture: 1,
    notes: { source: 'shoply-ecommerce' }
  })
  return NextResponse.json(order)
}
```

---

## Reusing Components
- All UI components are headless and can be copied to other projects.
- Hooks (`useAuth`, `useCart`, `useToast`) are portable and only depend on Supabase and a few utility libs.
- Database schema and triggers can be adapted for any Supabase-based e-commerce app.

---

For more details, see the code in each referenced file. 