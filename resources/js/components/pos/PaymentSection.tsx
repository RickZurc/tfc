import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface PaymentSectionProps {
  subtotal: number;
  discountAmount: string;
  discountType: 'numerical' | 'percentage';
  discount: number;
  total: number;
  onDiscountAmountChange: (amount: string) => void;
  onDiscountTypeChange: (type: 'numerical' | 'percentage') => void;
}

export default function PaymentSection({
  subtotal,
  discountAmount,
  discountType,
  discount,
  total,
  onDiscountAmountChange,
  onDiscountTypeChange,
}: PaymentSectionProps) {
  return (
    <>
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
    </>
  );
}
