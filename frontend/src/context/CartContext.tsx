import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface CartContextType {
  items: CartItem[];
  summary: CartSummary | null;
  itemCount: number;
  loading: boolean;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSummary(null);
      return;
    }
    try {
      setLoading(true);
      const data = await api.getCart();
      setItems(data.items);
      setSummary(data.summary);
    } catch (err) {
      console.error('Error refreshing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add products to your vibe cart 🛒', {
        icon: '🔒'
      });
      return;
    }
    try {
      const res = await api.addToCart(productId, quantity);
      toast.success(res.message || 'Added to your vibe 🛒');
      await refreshCart();
    } catch (err: any) {
      toast.error(err.message || 'Failed to add item to cart');
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      await api.updateCartQuantity(cartItemId, quantity);
      await refreshCart();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  const removeFromCart = async (cartItemId: number) => {
    try {
      await api.removeFromCart(cartItemId);
      toast.success('Removed from cart');
      await refreshCart();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      await refreshCart();
    } catch (err: any) {
      toast.error(err.message || 'Failed to clear cart');
    }
  };

  const itemCount = summary?.totalItems || items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        summary,
        itemCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
