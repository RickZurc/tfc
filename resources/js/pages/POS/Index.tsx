import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePersistedCart } from '@/hooks/usePersistedCart';
import { Product } from '@/types/pos';

// POS Components
import ProductSearch from '@/components/pos/ProductSearch';
import CategoryFilter from '@/components/pos/CategoryFilter';
import ProductGrid from '@/components/pos/ProductGrid';
import CartStatusBar from '@/components/pos/CartStatusBar';
import CartDisplay from '@/components/pos/CartDisplay';
import CartRestoreDialog from '@/components/pos/CartRestoreDialog';
import OutOfStockDialog from '@/components/pos/OutOfStockDialog';
import SaleCompletionModal from '@/components/pos/SaleCompletionModal';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  products: Product[];
}

interface CartItem extends Product {
  quantity: number;
  total: number;
  price: number; // Ensure cart items have numeric price
}

interface PageProps extends Record<string, unknown> {
  categories: Category[];
  products: Product[];
}

type PaymentMethod = 'cash' | 'card' | 'digital';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Point of Sale',
    href: '/pos',
  },
];

export default function POSIndex() {
  const { categories, products } = usePage<PageProps>().props;
  
  // Use the persisted cart hook
  const {
    cart,
    discountAmount,
    discountType,
    paymentMethod,
    customerId,
    isLoading,
    setCart,
    setDiscountAmount,
    setDiscountType,
    setPaymentMethod,
    setCustomerId,
    clearCart,
    clearStoredCart,
    saveCartToServer,
    getCartInfo,
  } = usePersistedCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [saleCompleted, setSaleCompleted] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [paymentError, setPaymentError] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [showCartRestoreDialog, setShowCartRestoreDialog] = useState(false);
  const [cartBackupInfo, setCartBackupInfo] = useState<any>(null);
  const [showOutOfStockDialog, setShowOutOfStockDialog] = useState(false);
  const [outOfStockProduct, setOutOfStockProduct] = useState<string>('');

  // Check for server backup on component mount
  useEffect(() => {
    checkForServerBackup();
  }, []);

  const checkForServerBackup = async () => {
    if (cart.length > 0) return; // Don't check if we already have items

    try {
      const response = await fetch('/api/pos/cart-info');
      const result = await response.json();
      
      if (result.success && result.has_backup) {
        setCartBackupInfo(result.info);
        setShowCartRestoreDialog(true);
      }
    } catch (error) {
      console.error('Failed to check for cart backup:', error);
    }
  };

  const restoreFromServerBackup = async () => {
    try {
      const response = await fetch('/api/pos/restore-cart');
      const result = await response.json();
      
      if (result.success && result.data) {
        const backupData = result.data;
        setCart(backupData.items || []);
        setDiscountAmount(backupData.discountAmount || '0');
        setDiscountType(backupData.discountType || 'numerical');
        setPaymentMethod(backupData.paymentMethod || 'cash');
        setCustomerId(backupData.customerId);
        
      }
    } catch (error) {
      console.error('Failed to restore cart from server:', error);
    } finally {
      setShowCartRestoreDialog(false);
    }
  };

  const startFresh = () => {
    // Clear the cart completely
    clearCart();
    
    // Reset all form fields
    setDiscountAmount('0');
    setDiscountType('numerical');
    setPaymentMethod('cash');
    setCustomerId(undefined);
    setAmountPaid('');
    
    // Close the restore dialog
    setShowCartRestoreDialog(false);
    
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || product.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    // Check if product is out of stock
    if (product.track_stock && product.stock_quantity <= 0) {
      setOutOfStockProduct(product.name);
      setShowOutOfStockDialog(true);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      // Use current_price if available (discounted), otherwise use regular price
      const price = product.current_price ?? parseFloat(product.price.toString());
      
      if (existingItem) {
        // Check if adding another quantity would exceed stock
        if (product.track_stock && (existingItem.quantity + 1) > product.stock_quantity) {
          setOutOfStockProduct(product.name);
          setShowOutOfStockDialog(true);
          return prevCart; // Don't add to cart
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * price }
            : item
        );
      } else {
        // Check stock for new item
        if (product.track_stock && product.stock_quantity < 1) {
          setOutOfStockProduct(product.name);
          setShowOutOfStockDialog(true);
          return prevCart; // Don't add to cart
        }
        
        const cartItem: CartItem = { 
          ...product, 
          price, 
          quantity: 1, 
          total: price 
        };
        return [...prevCart, cartItem];
      }
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    // Find the product to check stock
    const product = products.find(p => p.id === productId);
    if (product && (product as any).track_stock && quantity > product.stock_quantity) {
      setOutOfStockProduct(product.name);
      setShowOutOfStockDialog(true);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity, total: quantity * parseFloat(item.price.toString()) }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountValue = parseFloat(discountAmount) || 0;
  
  // Validate discount based on type
  const validatedDiscountValue = discountType === 'percentage' 
    ? Math.min(Math.max(0, discountValue), 100) // Clamp percentage between 0-100
    : Math.max(0, discountValue); // Ensure numerical discount is non-negative
    
  const discount = discountType === 'percentage' 
    ? (subtotal * validatedDiscountValue) / 100 
    : validatedDiscountValue;
  const total = Math.max(0, subtotal - discount); // Ensure total doesn't go below 0
  const amountPaidNum = parseFloat(amountPaid) || 0;
  const change = Math.max(0, amountPaidNum - total);
  const isPaymentSufficient = amountPaidNum >= total;

  // Clear payment error when amount paid changes and becomes sufficient
  React.useEffect(() => {
    if (isPaymentSufficient && paymentError) {
      setPaymentError('');
    }
    if (amountPaidNum > 0 && amountPaidNum < total) {
      setPaymentError(`Insufficient payment. $${formatCurrency(total - amountPaidNum)} short.`);
    } else if (paymentError && isPaymentSufficient) {
      setPaymentError('');
    }
  }, [amountPaidNum, total, isPaymentSufficient, paymentError]);

  const handlePrintReceipt = () => {
    if (!completedOrder) return;
    
    // Create a printable receipt
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${completedOrder.order_number}</title>
            <style>
              body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 10px; }
              .row { display: flex; justify-content: space-between; margin: 5px 0; }
              .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; margin-top: 10px; }
              .center { text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>RECEIPT</h2>
              <p>Order #${completedOrder.order_number}</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
            <div class="row">
              <span>Subtotal:</span>
              <span>$${formatCurrency(completedOrder.subtotal || completedOrder.originalSubtotal)}</span>
            </div>
            <div class="row">
              <span>Discount:</span>
              <span>-$${formatCurrency(completedOrder.discount_amount || completedOrder.originalDiscount)}</span>
            </div>
            <div class="row total">
              <span>TOTAL:</span>
              <span>$${formatCurrency(completedOrder.total_amount)}</span>
            </div>
            <div class="row">
              <span>Amount Paid:</span>
              <span>$${formatCurrency(completedOrder.amount_paid)}</span>
            </div>
            ${(completedOrder.change_amount || 0) > 0 ? `
            <div class="row">
              <span>Change:</span>
              <span>$${formatCurrency(completedOrder.change_amount)}</span>
            </div>
            ` : ''}
            <div class="row">
              <span>Payment:</span>
              <span>${completedOrder.payment_method.toUpperCase()}</span>
            </div>
            <div class="center" style="margin-top: 20px;">
              <p>Thank you for your business!</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    // Clear previous errors
    setPaymentError('');
    setValidationErrors({});
    
    // Frontend validation - check if payment is sufficient
    if (!isPaymentSufficient) {
      setPaymentError(`Insufficient payment. Total is $${formatCurrency(total)}, but only $${formatCurrency(amountPaidNum)} was provided.`);
      return;
    }
    
    try {
      const response = await fetch('/pos/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          })),
          payment_method: paymentMethod,
          amount_paid: amountPaidNum,
          discount_amount: discount,
          discount_type: discountType,
          discount_input: parseFloat(discountAmount) || 0,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Store cart information before clearing
        const orderSummary = {
          ...result.order,
          itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
          originalSubtotal: subtotal,
          originalDiscount: discount,
          change_amount: result.change_amount
        };
        
        setCompletedOrder(orderSummary);
        
        // Clear cart completely (including localStorage)
        clearCart();
        
        // Reset all form fields
        setAmountPaid('');
        setDiscountAmount('0');
        setDiscountType('numerical');
        setPaymentMethod('cash');
        setCustomerId(undefined);
        setPaymentError('');
        setValidationErrors({});
        setSaleCompleted(true);

        // Clear server backup as well
        try {
          await fetch('/api/pos/clear-cart', { method: 'DELETE' });
          console.log('Cart and server backup cleared after successful sale');
        } catch (error) {
          console.error('Failed to clear server backup:', error);
        }
      } else {
        // Handle validation errors or payment insufficient error
        if (result.errors) {
          setValidationErrors(result.errors);
        }
        if (result.message) {
          setPaymentError(result.message);
        }
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setPaymentError('Failed to process order. Please try again.');
    }
  };

  // Manual save to server
  const handleSaveToServer = async () => {
    if (cart.length === 0) return;
    
    try {
      await saveCartToServer();
      // You could show a toast notification here
      console.log('Cart manually saved to server');
    } catch (error) {
      console.error('Failed to save cart to server:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Point of Sale" />
        <div className="p-6 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p>Loading cart...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Point of Sale" />

      <div className="p-6">
        {/* Cart Status Bar */}
        <CartStatusBar 
          cartItemCount={cart.length}
          onSaveToServer={handleSaveToServer}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <ProductSearch 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filteredProducts={filteredProducts}
              onAddToCart={addToCart}
            />

            {/* Category Filter */}
            <CategoryFilter 
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Products Grid */}
            <ProductGrid 
              products={filteredProducts}
              onAddToCart={addToCart}
            />
          </div>

          {/* Cart & Checkout */}
          <div className="space-y-4">
            <CartDisplay 
              cart={cart}
              subtotal={subtotal}
              discountAmount={discountAmount}
              discountType={discountType}
              discount={discount}
              total={total}
              paymentMethod={paymentMethod}
              amountPaid={amountPaid}
              change={change}
              isPaymentSufficient={isPaymentSufficient}
              amountPaidNum={amountPaidNum}
              paymentError={paymentError}
              validationErrors={validationErrors}
              onUpdateQuantity={updateQuantity}
              onRemoveFromCart={removeFromCart}
              onDiscountAmountChange={setDiscountAmount}
              onDiscountTypeChange={setDiscountType}
              onPaymentMethodChange={setPaymentMethod}
              onAmountPaidChange={setAmountPaid}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Cart Restore Dialog */}
      <CartRestoreDialog 
        isOpen={showCartRestoreDialog}
        cartBackupInfo={cartBackupInfo}
        onClose={() => setShowCartRestoreDialog(false)}
        onStartFresh={startFresh}
        onRestore={restoreFromServerBackup}
      />

      {/* Out of Stock Dialog */}
      <OutOfStockDialog 
        isOpen={showOutOfStockDialog}
        productName={outOfStockProduct}
        onClose={() => setShowOutOfStockDialog(false)}
      />

      {/* Sale Completion Modal */}
      <SaleCompletionModal 
        isOpen={saleCompleted}
        completedOrder={completedOrder}
        onClose={() => setSaleCompleted(false)}
        onPrintReceipt={handlePrintReceipt}
      />
    </AppLayout>
  );
}
