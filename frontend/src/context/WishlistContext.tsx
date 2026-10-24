import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  items: Product[];
  wishlistCount: number;
  loading: boolean;
  isWishlisted: (productId: number) => boolean;
  toggleWishlist: (productId: number) => Promise<void>;
  moveToCart: (productId: number) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(false);

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setSavedIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const data = await api.getWishlist();
      setItems(data.items);
      setSavedIds(new Set(data.items.map(p => p.id)));
    } catch (err) {
      console.error('Error refreshing wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [isAuthenticated]);

  const isWishlisted = (productId: number) => {
    return savedIds.has(productId);
  };

  const toggleWishlist = async (productId: number) => {
    if (!isAuthenticated) {
      toast.error('Please log in to save to your vibe shelf ❤️', { icon: '🔒' });
      return;
    }
    try {
      const res = await api.toggleWishlist(productId);
      if (res.saved) {
        toast.success(res.message || 'Saved to your vibe shelf ❤️');
        setSavedIds(prev => new Set([...prev, productId]));
      } else {
        toast.success(res.message || 'Removed from your vibe shelf.');
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }
      await refreshWishlist();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update wishlist');
    }
  };

  const moveToCart = async (productId: number) => {
    try {
      const res = await api.moveWishlistToCart(productId);
      toast.success(res.message || 'Moved to your vibe cart 🛒');
      await Promise.all([refreshWishlist(), refreshCart()]);
    } catch (err: any) {
      toast.error(err.message || 'Failed to move product to cart');
    }
  };

  const removeFromWishlist = async (productId: number) => {
    try {
      await api.removeFromWishlist(productId);
      toast.success('Removed from your vibe shelf.');
      await refreshWishlist();
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove from wishlist');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        wishlistCount: items.length,
        loading,
        isWishlisted,
        toggleWishlist,
        moveToCart,
        removeFromWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
