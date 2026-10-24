import { 
  User, Product, Category, Vibe, CartItem, CartSummary, 
  Order, Review, QuizRecommendationResult 
} from '../types';

const BASE_URL = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('vibecart_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data as T;
}

export const api = {
  // Auth
  async register(body: { name: string; email: string; password: string; favorite_vibe?: string }) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse<{ message: string; token: string; user: User }>(res);
  },

  async login(body: { email: string; password: string }) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse<{ message: string; token: string; user: User }>(res);
  },

  async getProfile() {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ user: User; stats: { totalOrders: number; wishlistCount: number } }>(res);
  },

  async updateProfile(data: Partial<User>) {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; user: User }>(res);
  },

  // Products
  async getProducts(params?: Record<string, string | number | boolean | undefined>) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== '') query.append(key, String(val));
      });
    }
    const res = await fetch(`${BASE_URL}/products?${query.toString()}`);
    return handleResponse<{ products: Product[]; total: number; limit: number; offset: number }>(res);
  },

  async getProductById(id: string | number) {
    const res = await fetch(`${BASE_URL}/products/${id}`);
    return handleResponse<{ product: Product; reviews: Review[] }>(res);
  },

  async getSimilarProducts(id: string | number) {
    const res = await fetch(`${BASE_URL}/products/${id}/similar`);
    return handleResponse<{ products: Product[] }>(res);
  },

  // Categories & Vibes
  async getCategories() {
    const res = await fetch(`${BASE_URL}/categories`);
    return handleResponse<{ categories: Category[] }>(res);
  },

  async getVibes() {
    const res = await fetch(`${BASE_URL}/vibes`);
    return handleResponse<{ vibes: Vibe[] }>(res);
  },

  async recommendVibe(body: { activity?: string; aesthetic?: string; energy?: string; priority?: string }) {
    const res = await fetch(`${BASE_URL}/vibes/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return handleResponse<QuizRecommendationResult>(res);
  },

  // Cart
  async getCart() {
    const res = await fetch(`${BASE_URL}/cart`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ items: CartItem[]; summary: CartSummary }>(res);
  },

  async addToCart(productId: number, quantity: number = 1) {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, quantity })
    });
    return handleResponse<{ message: string; productName?: string }>(res);
  },

  async updateCartQuantity(cartItemId: number, quantity: number) {
    const res = await fetch(`${BASE_URL}/cart/${cartItemId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity })
    });
    return handleResponse<{ message: string }>(res);
  },

  async removeFromCart(cartItemId: number) {
    const res = await fetch(`${BASE_URL}/cart/${cartItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  async clearCart() {
    const res = await fetch(`${BASE_URL}/cart`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  // Wishlist
  async getWishlist() {
    const res = await fetch(`${BASE_URL}/wishlist`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ items: Product[]; count: number; emptyMessage: string }>(res);
  },

  async toggleWishlist(productId: number) {
    const res = await fetch(`${BASE_URL}/wishlist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    return handleResponse<{ saved: boolean; message: string }>(res);
  },

  async removeFromWishlist(id: number) {
    const res = await fetch(`${BASE_URL}/wishlist/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  },

  async moveWishlistToCart(productId: number) {
    const res = await fetch(`${BASE_URL}/wishlist/move-to-cart`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId })
    });
    return handleResponse<{ message: string; productName: string }>(res);
  },

  // Orders
  async createOrder(orderData: any) {
    const res = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData)
    });
    return handleResponse<{ message: string; orderNumber: string; order: Order }>(res);
  },

  async getOrders() {
    const res = await fetch(`${BASE_URL}/orders`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ orders: Order[] }>(res);
  },

  async getOrderById(id: string | number) {
    const res = await fetch(`${BASE_URL}/orders/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ order: Order }>(res);
  },

  // Reviews
  async addReview(productId: number, rating: number, comment: string) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, rating, comment })
    });
    return handleResponse<{ message: string; review: Review; productRating: number; productReviewCount: number }>(res);
  },

  // Admin
  async getAdminDashboard() {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  async getAdminOrders(params?: { status?: string; search?: string }) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${BASE_URL}/admin/orders?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ orders: Order[] }>(res);
  },

  async updateOrderStatus(orderId: number, status: string) {
    const res = await fetch(`${BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse<{ message: string; order: Order }>(res);
  },

  async getAdminUsers() {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ users: any[] }>(res);
  },

  async adminCreateProduct(data: any) {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; product: Product }>(res);
  },

  async adminUpdateProduct(id: number, data: any) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<{ message: string; product: Product }>(res);
  },

  async adminDeleteProduct(id: number) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<{ message: string }>(res);
  }
};
