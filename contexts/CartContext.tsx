
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartContextType, CartItem, Service, Course, Project } from '../types';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load from local storage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('namaa_cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Save to local storage on change
    localStorage.setItem('namaa_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Service | Course | Project, type: 'service' | 'course' | 'project') => {
    setItems((prev) => {
      // Prevent duplicates
      if (prev.some((i) => i.id === item.id)) {
        setIsOpen(true); // Open cart if item exists
        return prev;
      }

      // Calculate current effective price (handling discounts)
      const now = new Date();
      const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      
      const isDiscountActive = item.discountPrice && 
        (!item.discountStartDate || todayStr >= item.discountStartDate) &&
        (!item.discountEndDate || todayStr <= item.discountEndDate);

      const price = isDiscountActive && item.discountPrice ? item.discountPrice : item.price;

      const newItem: CartItem = {
        id: item.id,
        type,
        titleEn: item.titleEn,
        titleAr: item.titleAr,
        price: price,
        originalPrice: item.price,
        // Handle variations in image/icon based on type
        thumbnailUrl: 'thumbnailUrl' in item ? item.thumbnailUrl : undefined,
        icon: 'icon' in item ? item.icon : undefined
      };

      setIsOpen(true); // Open cart on add
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount: items.length,
        totalAmount,
        isOpen,
        setIsOpen
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
