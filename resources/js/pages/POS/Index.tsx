import React, { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus,
  CreditCard,
  DollarSign,
  Calculator
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface Product {
  id: number;
  name: string;
  price: number;
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

export default function POSIndex() {
  const { categories, products } = usePage<PageProps>().props;
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'digital'>('cash');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<string>('0');

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === null || product.category.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1, total: product.price }];
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
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discount = parseFloat(discountAmount) || 0;
  const total = subtotal - discount;
  const change = Math.max(0, (parseFloat(amountPaid) || 0) - total);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
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
          amount_paid: parseFloat(amountPaid) || 0,
          discount_amount: discount,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setCart([]);
        setAmountPaid('');
        setDiscountAmount('0');
        alert(`Order completed successfully! Order #${result.order.order_number}`);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'Failed to process order'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process order. Please try again.');
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Point of Sale" />

      <div className="p-6">
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
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm">Discount:</label>
                        <Input
                          type="number"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          className="w-20 h-8"
                          min="0"
                          step="0.01"
                        />
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
                      />
                      {change > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-2 mt-2">
                          <p className="text-sm font-medium text-green-800">
                            Change: ${formatCurrency(change)}
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      disabled={cart.length === 0 || !amountPaid || parseFloat(amountPaid) < total}
                    >
                      Complete Sale
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
