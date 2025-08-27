import { useState, useEffect, useCallback } from 'react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
  sku: string;
  stock_quantity: number;
  category: {
    id: number;
    name: string;
    color: string;
  };
}

interface CartState {
  items: CartItem[];
  discountAmount: string;
  discountType: 'percentage' | 'numerical';
  paymentMethod: 'cash' | 'card' | 'digital';
  customerId?: number;
  savedAt: string;
}

const CART_STORAGE_KEY = 'pos_cart_state';
const CART_EXPIRY_HOURS = 24; // Cart expires after 24 hours

export function usePersistedCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [discountType, setDiscountType] = useState<'percentage' | 'numerical'>('numerical');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [customerId, setCustomerId] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage on component mount
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to localStorage whenever cart state changes
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage();
    }
  }, [cart, discountAmount, discountType, paymentMethod, customerId, isLoading]);

  const loadCartFromStorage = useCallback(() => {
    try {
      const storedData = localStorage.getItem(CART_STORAGE_KEY);
      if (storedData) {
        const cartState: CartState = JSON.parse(storedData);
        
        // Check if cart has expired
        const savedAt = new Date(cartState.savedAt);
        const expiryTime = new Date(savedAt.getTime() + CART_EXPIRY_HOURS * 60 * 60 * 1000);
        
        if (new Date() > expiryTime) {
          // Cart has expired, clear it
          localStorage.removeItem(CART_STORAGE_KEY);
          console.log('Cart expired and cleared');
        } else {
          // Restore cart state
          setCart(cartState.items || []);
          setDiscountAmount(cartState.discountAmount || '0');
          setDiscountType(cartState.discountType || 'numerical');
          setPaymentMethod(cartState.paymentMethod || 'cash');
          setCustomerId(cartState.customerId);
          console.log('Cart restored from storage:', cartState.items.length, 'items');
        }
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      // Clear corrupted data
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCartToStorage = useCallback(() => {
    try {
      const cartState: CartState = {
        items: cart,
        discountAmount,
        discountType,
        paymentMethod,
        customerId,
        savedAt: new Date().toISOString(),
      };
      
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
      console.log('Cart saved to storage:', cart.length, 'items');
    } catch (error) {
      console.error('Error saving cart to storage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.code === 22) {
        // Storage quota exceeded, clear old data and try again
        localStorage.clear();
        try {
          const cartState: CartState = {
            items: cart,
            discountAmount,
            discountType,
            paymentMethod,
            customerId,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
        } catch (retryError) {
          console.error('Failed to save cart even after clearing storage:', retryError);
        }
      }
    }
  }, [cart, discountAmount, discountType, paymentMethod, customerId]);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscountAmount('0');
    setDiscountType('numerical');
    setPaymentMethod('cash');
    setCustomerId(undefined);
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('Cart cleared');
  }, []);

  const clearStoredCart = useCallback(() => {
    localStorage.removeItem(CART_STORAGE_KEY);
    console.log('Stored cart cleared');
  }, []);

  // Get cart info for debugging
  const getCartInfo = useCallback(() => {
    const storedData = localStorage.getItem(CART_STORAGE_KEY);
    if (storedData) {
      const cartState: CartState = JSON.parse(storedData);
      return {
        itemCount: cartState.items?.length || 0,
        savedAt: cartState.savedAt,
        isExpired: new Date() > new Date(new Date(cartState.savedAt).getTime() + CART_EXPIRY_HOURS * 60 * 60 * 1000),
      };
    }
    return null;
  }, []);

  // Auto-save to server (optional for backup)
  const saveCartToServer = useCallback(async () => {
    if (cart.length === 0) return;
    
    try {
      await fetch('/api/pos/save-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          items: cart,
          discountAmount,
          discountType,
          paymentMethod,
          customerId,
        }),
      });
      console.log('Cart backed up to server');
    } catch (error) {
      console.error('Failed to backup cart to server:', error);
    }
  }, [cart, discountAmount, discountType, paymentMethod, customerId]);

  return {
    // State
    cart,
    discountAmount,
    discountType,
    paymentMethod,
    customerId,
    isLoading,
    
    // Setters
    setCart,
    setDiscountAmount,
    setDiscountType,
    setPaymentMethod,
    setCustomerId,
    
    // Actions
    clearCart,
    clearStoredCart,
    saveCartToServer,
    getCartInfo,
    
    // Storage info
    storageKey: CART_STORAGE_KEY,
    expiryHours: CART_EXPIRY_HOURS,
  };
}
