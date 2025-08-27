import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  DollarSign, 
  CreditCard, 
  Calculator, 
  CheckCircle 
} from 'lucide-react';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

type PaymentMethod = 'cash' | 'card' | 'digital';

interface CartDisplayProps {
  cart: CartItem[];
  subtotal: number;
  discountAmount: string;
  discountType: 'numerical' | 'percentage';
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: string;
  change: number;
  isPaymentSufficient: boolean;
  amountPaidNum: number;
  paymentError: string;
  validationErrors: Record<string, string[]>;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveFromCart: (productId: number) => void;
  onDiscountAmountChange: (amount: string) => void;
  onDiscountTypeChange: (type: 'numerical' | 'percentage') => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onAmountPaidChange: (amount: string) => void;
  onCheckout: () => void;
}

export default function CartDisplay({ 
  cart, 
  subtotal,
  discountAmount,
  discountType,
  discount,
  total,
  paymentMethod,
  amountPaid,
  change,
  isPaymentSufficient,
  amountPaidNum,
  paymentError,
  validationErrors,
  onUpdateQuantity, 
  onRemoveFromCart,
  onDiscountAmountChange,
  onDiscountTypeChange,
  onPaymentMethodChange,
  onAmountPaidChange,
  onCheckout,
}: CartDisplayProps) {
  return (
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
            {/* Cart Items */}
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
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onRemoveFromCart(item.id)}
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
                      onClick={() => onDiscountTypeChange('numerical')}
                      className="text-xs px-2 py-1 h-6"
                    >
                      $
                    </Button>
                    <Button
                      size="sm"
                      variant={discountType === 'percentage' ? 'default' : 'outline'}
                      onClick={() => onDiscountTypeChange('percentage')}
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
                    onChange={(e) => onDiscountAmountChange(e.target.value)}
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
                  onClick={() => onPaymentMethodChange('cash')}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Cash
                </Button>
                <Button
                  size="sm"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => onPaymentMethodChange('card')}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Card
                </Button>
                <Button
                  size="sm"
                  variant={paymentMethod === 'digital' ? 'default' : 'outline'}
                  onClick={() => onPaymentMethodChange('digital')}
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
                onChange={(e) => onAmountPaidChange(e.target.value)}
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
              onClick={onCheckout}
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
  );
}
