export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  favorite_vibe: string;
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  product_count?: number;
}

export interface Vibe {
  id: number;
  name: string;
  slug: string;
  icon: string;
  tagline?: string;
  description?: string;
  color_gradient: string;
  accent_color?: string;
  product_count?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  discount: number;
  stock: number;
  category_id: number;
  vibe_id: number;
  category_name?: string;
  category_slug?: string;
  vibe_name?: string;
  vibe_slug?: string;
  vibe_icon?: string;
  vibe_gradient?: string;
  tags: string[];
  image: string;
  images: string[];
  rating: number;
  review_count: number;
  why_like: string[];
  is_featured: boolean;
  created_at: string;
}

export interface CartItem {
  cart_item_id: number;
  quantity: number;
  created_at: string;
  product_id: number;
  name: string;
  slug: string;
  price: number;
  original_price?: number;
  discount: number;
  stock: number;
  image: string;
  vibe_name?: string;
  vibe_icon?: string;
  vibe_gradient?: string;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  shippingMessage: string;
  finalTotal: number;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  vibe_name?: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  shipping_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  customer_name?: string;
  customer_email?: string;
  customer_avatar?: string;
  tracking?: {
    currentStepIndex: number;
    steps: { step: number; name: string; desc: string }[];
  };
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  user_vibe?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  title: string;
  subtitle: string;
  options: {
    label: string;
    value: string;
    icon: string;
    description: string;
    vibeSlug?: string;
  }[];
}

export interface QuizRecommendationResult {
  message: string;
  result: string;
  dominantVibe: Vibe;
  secondaryVibe?: Vibe;
  scoreBreakdown: Record<string, number>;
  products: Product[];
}
