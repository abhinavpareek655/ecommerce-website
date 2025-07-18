-- Insert sample categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Electronics', 'electronics', 'Latest electronic gadgets and devices', '/placeholder.svg?height=200&width=200'),
('Clothing', 'clothing', 'Fashion and apparel for all occasions', '/placeholder.svg?height=200&width=200'),
('Home & Garden', 'home-garden', 'Everything for your home and garden', '/placeholder.svg?height=200&width=200'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear', '/placeholder.svg?height=200&width=200'),
('Books', 'books', 'Books and educational materials', '/placeholder.svg?height=200&width=200');

-- Insert sample products
INSERT INTO public.products (name, slug, description, short_description, price, compare_price, category_id, images, tags, featured, inventory_quantity) VALUES
(
  'Wireless Bluetooth Headphones',
  'wireless-bluetooth-headphones',
  'Premium wireless headphones with noise cancellation, 30-hour battery life, and crystal-clear audio quality. Perfect for music lovers and professionals.',
  'Premium wireless headphones with noise cancellation',
  199.99,
  249.99,
  (SELECT id FROM public.categories WHERE slug = 'electronics'),
  ARRAY['/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400'],
  ARRAY['wireless', 'bluetooth', 'headphones', 'audio'],
  true,
  50
),
(
  'Organic Cotton T-Shirt',
  'organic-cotton-t-shirt',
  'Comfortable and sustainable organic cotton t-shirt. Made from 100% organic cotton with a relaxed fit. Available in multiple colors and sizes.',
  'Comfortable organic cotton t-shirt',
  29.99,
  39.99,
  (SELECT id FROM public.categories WHERE slug = 'clothing'),
  ARRAY['/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400'],
  ARRAY['organic', 'cotton', 't-shirt', 'sustainable'],
  true,
  100
),
(
  'Smart Home Security Camera',
  'smart-home-security-camera',
  '1080p HD security camera with night vision, motion detection, and smartphone app integration. Easy to install and monitor your home remotely.',
  '1080p HD security camera with smart features',
  89.99,
  119.99,
  (SELECT id FROM public.categories WHERE slug = 'electronics'),
  ARRAY['/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400'],
  ARRAY['security', 'camera', 'smart-home', 'surveillance'],
  false,
  25
),
(
  'Yoga Mat Premium',
  'yoga-mat-premium',
  'High-quality yoga mat with superior grip and cushioning. Made from eco-friendly materials, perfect for all types of yoga and exercise.',
  'Premium eco-friendly yoga mat',
  49.99,
  69.99,
  (SELECT id FROM public.categories WHERE slug = 'sports-outdoors'),
  ARRAY['/placeholder.svg?height=400&width=400'],
  ARRAY['yoga', 'mat', 'exercise', 'eco-friendly'],
  false,
  30
),
(
  'Modern Table Lamp',
  'modern-table-lamp',
  'Sleek and modern table lamp with adjustable brightness and USB charging port. Perfect for bedside tables, desks, or living rooms.',
  'Modern table lamp with USB charging',
  79.99,
  99.99,
  (SELECT id FROM public.categories WHERE slug = 'home-garden'),
  ARRAY['/placeholder.svg?height=400&width=400', '/placeholder.svg?height=400&width=400'],
  ARRAY['lamp', 'modern', 'lighting', 'usb'],
  true,
  40
);

-- Insert product variants
INSERT INTO public.product_variants (product_id, name, sku, price, options, inventory_quantity) VALUES
-- T-shirt variants
(
  (SELECT id FROM public.products WHERE slug = 'organic-cotton-t-shirt'),
  'Small - Black',
  'OCT-S-BLK',
  29.99,
  '{"size": "S", "color": "Black"}',
  20
),
(
  (SELECT id FROM public.products WHERE slug = 'organic-cotton-t-shirt'),
  'Medium - Black',
  'OCT-M-BLK',
  29.99,
  '{"size": "M", "color": "Black"}',
  25
),
(
  (SELECT id FROM public.products WHERE slug = 'organic-cotton-t-shirt'),
  'Large - Black',
  'OCT-L-BLK',
  29.99,
  '{"size": "L", "color": "Black"}',
  20
),
(
  (SELECT id FROM public.products WHERE slug = 'organic-cotton-t-shirt'),
  'Small - White',
  'OCT-S-WHT',
  29.99,
  '{"size": "S", "color": "White"}',
  15
),
(
  (SELECT id FROM public.products WHERE slug = 'organic-cotton-t-shirt'),
  'Medium - White',
  'OCT-M-WHT',
  29.99,
  '{"size": "M", "color": "White"}',
  20
),
-- Headphones variants
(
  (SELECT id FROM public.products WHERE slug = 'wireless-bluetooth-headphones'),
  'Black',
  'WBH-BLK',
  199.99,
  '{"color": "Black"}',
  25
),
(
  (SELECT id FROM public.products WHERE slug = 'wireless-bluetooth-headphones'),
  'White',
  'WBH-WHT',
  199.99,
  '{"color": "White"}',
  25
);
