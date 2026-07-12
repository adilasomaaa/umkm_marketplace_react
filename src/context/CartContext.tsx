import React, { createContext, useContext, useState, useEffect } from 'react';
import { keranjangService } from '../services/KeranjangService';

interface CartContextType {
  cartCount: number;
  fetchCartCount: () => Promise<void>;
  addToCart: (tokoId: number, produkId: number, quantiti: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateCartQty: (id: number, quantiti: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartCount, setCartCount] = useState<number>(() => {
    const saved = localStorage.getItem('cart-count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const fetchCartCount = async () => {
    try {
      const items = await keranjangService.index();
      const totalQty = items.reduce((sum: number, item: any) => sum + item.quantiti, 0);
      setCartCount(totalQty);
      localStorage.setItem('cart-count', totalQty.toString());
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };

  const addToCart = async (tokoId: number, produkId: number, quantiti: number) => {
    await keranjangService.add({ tokoId, produkId, quantiti });
    await fetchCartCount();
  };

  const removeFromCart = async (id: number) => {
    await keranjangService.delete(id);
    await fetchCartCount();
  };

  const updateCartQty = async (id: number, quantiti: number) => {
    await keranjangService.update(id, { quantiti });
    await fetchCartCount();
  };

  useEffect(() => {
    const token = localStorage.getItem('x-cart-token');
    if (token) {
      fetchCartCount();
    }
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, fetchCartCount, addToCart, removeFromCart, updateCartQty }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
