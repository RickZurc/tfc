import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus,
  CreditCard,
  DollarSign,
  Calculator,
  CheckCircle,
  Receipt,
  Save,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePersistedCart } from '@/hooks/usePersistedCart';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface Product {
  id: number;
  name: string;
  price: string | number; // Laravel returns decimals as strings
  sku: string;
  stock_quantity: number;
  category: {
    id: number;
    name: string;
    color: string;
  };
}

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

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Point of Sale',
    href: '/pos',
  },
];

export default function POSIndexWithPersistence() {
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
        
        console.log('Cart restored from server backup');
      }
    } catch (error) {
      console.error('Failed to restore cart from server:', error);
    } finally {
      setShowCartRestoreDialog(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || product.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      const price = parseFloat(product.price.toString()); // Ensure price is a number
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * price }
            : item
        );
      } else {
        return [...prevCart, { ...product, price, quantity: 1, total: price }];
      }
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
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
  useEffect(() => {
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
        setAmountPaid('');
        setPaymentError('');
        setValidationErrors({});
        setSaleCompleted(true);

        // Clear server backup as well
        try {
          await fetch('/api/pos/clear-cart', { method: 'DELETE' });
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
        {cart.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Cart automatically saved ({cart.length} items)
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveToServer}
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Save className="h-3 w-3 mr-1" />
              Backup to Server
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products by name or SKU..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(null)}
                  >
                    All Categories
                  </Button>
                  {categories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      style={{ backgroundColor: selectedCategory === category.id ? category.color : undefined }}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                  <CardContent className="p-4" onClick={() => addToCart(product)}>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">
                          ${formatCurrency(product.price)}
                        </span>
                        <Badge 
                          variant={product.stock_quantity > 10 ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {product.stock_quantity} left
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: product.category.color }}
                        />
                        <span className="text-xs text-muted-foreground">{product.category.name}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart & Checkout */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart ({cart.length} items)
                  {cart.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      Auto-saved
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${formatCurrency(item.price)} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Payment Details */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(subtotal)}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Discount:</label>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={discountType === 'numerical' ? 'default' : 'outline'}
                              onClick={() => setDiscountType('numerical')}
                              className="text-xs px-2 py-1 h-6"
                            >
                              $
                            </Button>
                            <Button
                              size="sm"
                              variant={discountType === 'percentage' ? 'default' : 'outline'}
                              onClick={() => setDiscountType('percentage')}
                              className="text-xs px-2 py-1 h-6"
                            >
                              %
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            className="w-20 h-8"
                            min="0"
                            max={discountType === 'percentage' ? '100' : undefined}
                            step="0.01"
                            placeholder={discountType === 'percentage' ? '0-100' : '0.00'}
                          />
                          <span className="text-sm text-muted-foreground">
                            {discountType === 'percentage' ? '%' : '$'}
                          </span>
                          {discount > 0 && (
                            <span className="text-sm text-green-600">
                              (-${formatCurrency(discount)})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between font-bold text-lg border-t pt-3">
                        <span>Total:</span>
                        <span className="text-primary">${formatCurrency(total)}</span>
                      </div>
                    </div>

                    <Separator />

                    {/* Payment Method */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Method:</label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('cash')}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Cash
                        </Button>
                        <Button
                          size="sm"
                          variant={paymentMethod === 'card' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          Card
                        </Button>
                        <Button
                          size="sm"
                          variant={paymentMethod === 'digital' ? 'default' : 'outline'}
                          onClick={() => setPaymentMethod('digital')}
                        >
                          <Calculator className="h-4 w-4 mr-1" />
                          Digital
                        </Button>
                      </div>
                    </div>

                    {/* Amount Paid */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount Paid:</label>
                      <Input
                        type="number"
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className={`${
                          paymentError || validationErrors.amount_paid ? 'border-red-500' : ''
                        } ${
                          !isPaymentSufficient && amountPaidNum > 0 ? 'border-yellow-500' : ''
                        } ${
                          isPaymentSufficient && amountPaidNum > 0 ? 'border-green-500' : ''
                        }`}
                      />
                      
                      {/* Payment Error Display */}
                      {paymentError && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2">
                          <p className="text-sm text-red-800">{paymentError}</p>
                        </div>
                      )}
                      
                      {/* Validation Errors */}
                      {validationErrors.amount_paid && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-2">
                          {validationErrors.amount_paid.map((error, index) => (
                            <p key={index} className="text-sm text-red-800">{error}</p>
                          ))}
                        </div>
                      )}
                      
                      {/* Change Display */}
                      {change > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-2">
                          <p className="text-sm font-medium text-green-800">
                            Change: ${formatCurrency(change)}
                          </p>
                        </div>
                      )}
                      
                      {/* Insufficient Payment Warning */}
                      {!isPaymentSufficient && amountPaidNum > 0 && !paymentError && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2">
                          <p className="text-sm font-medium text-yellow-800">
                            Need ${formatCurrency(total - amountPaidNum)} more
                          </p>
                        </div>
                      )}
                      
                      {/* Payment Status Indicator */}
                      {amountPaidNum > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          {isPaymentSufficient ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">Payment sufficient</span>
                            </>
                          ) : (
                            <>
                              <div className="h-4 w-4 rounded-full bg-yellow-500" />
                              <span className="text-yellow-600 font-medium">Insufficient payment</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className={`w-full ${
                        !isPaymentSufficient && amountPaidNum > 0 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : ''
                      }`}
                      disabled={cart.length === 0 || !amountPaid || !isPaymentSufficient}
                    >
                      {cart.length === 0 
                        ? 'Cart is Empty'
                        : !amountPaid 
                        ? 'Enter Payment Amount'
                        : !isPaymentSufficient 
                        ? `Need $${formatCurrency(total - amountPaidNum)} More`
                        : 'Complete Sale'
                      }
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cart Restore Dialog */}
      <Dialog open={showCartRestoreDialog} onOpenChange={setShowCartRestoreDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <RotateCcw className="h-8 w-8 text-blue-600" />
            </div>
            <DialogTitle className="text-center">
              Restore Previous Cart?
            </DialogTitle>
            <DialogDescription className="text-center">
              We found a previously saved cart with {cartBackupInfo?.item_count} items.
              Would you like to restore it?
            </DialogDescription>
          </DialogHeader>

          {cartBackupInfo && (
            <div className="py-4 space-y-2">
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Items:</span>
                  <span>{cartBackupInfo.item_count}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Saved:</span>
                  <span>{new Date(cartBackupInfo.saved_at).toLocaleString()}</span>
                </div>
                {cartBackupInfo.discount_amount && cartBackupInfo.discount_amount !== '0' && (
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Discount:</span>
                    <span>${cartBackupInfo.discount_amount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCartRestoreDialog(false)}
            >
              Start Fresh
            </Button>
            <Button onClick={restoreFromServerBackup}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restore Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sale Completion Modal */}
      <Dialog open={saleCompleted} onOpenChange={setSaleCompleted}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 animate-pulse">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-green-800">
              Sale Completed Successfully!
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Your transaction has been processed and saved successfully.
            </DialogDescription>
          </DialogHeader>

          {completedOrder && (
            <div className="space-y-4 py-4">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Order Number:</span>
                  <span className="text-sm font-semibold text-gray-900">{completedOrder.order_number}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Items:</span>
                  <span className="text-sm font-semibold text-gray-900">{completedOrder.itemCount} items</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                  <span className="text-sm font-semibold text-gray-900">${formatCurrency(completedOrder.subtotal || completedOrder.originalSubtotal)}</span>
                </div>
                {(completedOrder.discount_amount || completedOrder.originalDiscount) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Discount:</span>
                    <span className="text-sm font-semibold text-red-600">-${formatCurrency(completedOrder.discount_amount || completedOrder.originalDiscount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-900">${formatCurrency(completedOrder.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Amount Paid:</span>
                  <span className="text-sm font-semibold text-gray-900">${formatCurrency(completedOrder.amount_paid)}</span>
                </div>
                {(completedOrder.change_amount || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Change:</span>
                    <span className="text-sm font-semibold text-green-600">${formatCurrency(completedOrder.change_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{completedOrder.payment_method}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handlePrintReceipt}
              className="flex-1 sm:flex-none"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={() => setSaleCompleted(false)}
              className="flex-1 sm:flex-none"
            >
              New Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
