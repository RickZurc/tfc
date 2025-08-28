import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Calculator, CheckCircle, CreditCard, DollarSign } from 'lucide-react';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

type PaymentMethod = 'cash' | 'card' | 'digital';

interface CheckoutSectionProps {
    paymentMethod: PaymentMethod;
    amountPaid: string;
    total: number;
    change: number;
    isPaymentSufficient: boolean;
    amountPaidNum: number;
    paymentError: string;
    validationErrors: Record<string, string[]>;
    cartLength: number;
    onPaymentMethodChange: (method: PaymentMethod) => void;
    onAmountPaidChange: (amount: string) => void;
    onCheckout: () => void;
}

export default function CheckoutSection({
    paymentMethod,
    amountPaid,
    total,
    change,
    isPaymentSufficient,
    amountPaidNum,
    paymentError,
    validationErrors,
    cartLength,
    onPaymentMethodChange,
    onAmountPaidChange,
    onCheckout,
}: CheckoutSectionProps) {
    return (
        <>
            <Separator />

            {/* Payment Method */}
            <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method:</label>
                <div className="flex gap-2">
                    <Button size="sm" variant={paymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => onPaymentMethodChange('cash')}>
                        <DollarSign className="mr-1 h-4 w-4" />
                        Cash
                    </Button>
                    <Button size="sm" variant={paymentMethod === 'card' ? 'default' : 'outline'} onClick={() => onPaymentMethodChange('card')}>
                        <CreditCard className="mr-1 h-4 w-4" />
                        Card
                    </Button>
                    <Button size="sm" variant={paymentMethod === 'digital' ? 'default' : 'outline'} onClick={() => onPaymentMethodChange('digital')}>
                        <Calculator className="mr-1 h-4 w-4" />
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
                    className={`${paymentError || validationErrors.amount_paid ? 'border-red-500' : ''} ${
                        !isPaymentSufficient && amountPaidNum > 0 ? 'border-yellow-500' : ''
                    } ${isPaymentSufficient && amountPaidNum > 0 ? 'border-green-500' : ''}`}
                />

                {/* Payment Error Display */}
                {paymentError && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-2">
                        <p className="text-sm text-red-800">{paymentError}</p>
                    </div>
                )}

                {/* Validation Errors */}
                {validationErrors.amount_paid && (
                    <div className="rounded-md border border-red-200 bg-red-50 p-2">
                        {validationErrors.amount_paid.map((error, index) => (
                            <p key={index} className="text-sm text-red-800">
                                {error}
                            </p>
                        ))}
                    </div>
                )}

                {/* Change Display */}
                {change > 0 && (
                    <div className="rounded-md border border-green-200 bg-green-50 p-2">
                        <p className="text-sm font-medium text-green-800">Change: ${formatCurrency(change)}</p>
                    </div>
                )}

                {/* Insufficient Payment Warning */}
                {!isPaymentSufficient && amountPaidNum > 0 && !paymentError && (
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-2">
                        <p className="text-sm font-medium text-yellow-800">Need ${formatCurrency(total - amountPaidNum)} more</p>
                    </div>
                )}

                {/* Payment Status Indicator */}
                {amountPaidNum > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                        {isPaymentSufficient ? (
                            <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">Payment sufficient</span>
                            </>
                        ) : (
                            <>
                                <div className="h-4 w-4 rounded-full bg-yellow-500" />
                                <span className="font-medium text-yellow-600">Insufficient payment</span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <Button
                onClick={onCheckout}
                className={`w-full ${!isPaymentSufficient && amountPaidNum > 0 ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                disabled={cartLength === 0 || !amountPaid || !isPaymentSufficient}
            >
                {cartLength === 0
                    ? 'Cart is Empty'
                    : !amountPaid
                      ? 'Enter Payment Amount'
                      : !isPaymentSufficient
                        ? `Need $${formatCurrency(total - amountPaidNum)} More`
                        : 'Complete Sale'}
            </Button>
        </>
    );
}
