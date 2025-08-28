import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Receipt } from 'lucide-react';

// Helper function to safely format currency
const formatCurrency = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface CompletedOrder {
    order_number: string;
    itemCount: number;
    subtotal?: number;
    originalSubtotal?: number;
    discount_amount?: number;
    originalDiscount?: number;
    total_amount: number;
    amount_paid: number;
    change_amount?: number;
    payment_method: string;
}

interface SaleCompletionModalProps {
    isOpen: boolean;
    completedOrder: CompletedOrder | null;
    onClose: () => void;
    onPrintReceipt: () => void;
}

export default function SaleCompletionModal({ isOpen, completedOrder, onClose, onPrintReceipt }: SaleCompletionModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <DialogTitle className="text-2xl font-bold text-green-800">Sale Completed Successfully!</DialogTitle>
                    <DialogDescription className="text-center text-gray-600">
                        Your transaction has been processed and saved successfully.
                    </DialogDescription>
                </DialogHeader>

                {completedOrder && (
                    <div className="space-y-4 py-4">
                        {/* Order Summary */}
                        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Order Number:</span>
                                <span className="text-sm font-semibold text-gray-900">{completedOrder.order_number}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Items:</span>
                                <span className="text-sm font-semibold text-gray-900">{completedOrder.itemCount} items</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                                <span className="text-sm font-semibold text-gray-900">
                                    ${formatCurrency(completedOrder.subtotal || completedOrder.originalSubtotal || 0)}
                                </span>
                            </div>
                            {((completedOrder.discount_amount || 0) > 0 || (completedOrder.originalDiscount || 0) > 0) && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Discount:</span>
                                    <span className="text-sm font-semibold text-red-600">
                                        -${formatCurrency(completedOrder.discount_amount || completedOrder.originalDiscount || 0)}
                                    </span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                                <span className="text-lg font-bold text-gray-900">${formatCurrency(completedOrder.total_amount)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Amount Paid:</span>
                                <span className="text-sm font-semibold text-gray-900">${formatCurrency(completedOrder.amount_paid)}</span>
                            </div>
                            {(completedOrder.change_amount || 0) > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-600">Change:</span>
                                    <span className="text-sm font-semibold text-green-600">${formatCurrency(completedOrder.change_amount || 0)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                                <span className="text-sm font-semibold text-gray-900 capitalize">{completedOrder.payment_method}</span>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onPrintReceipt} className="flex-1 sm:flex-none">
                        <Receipt className="mr-2 h-4 w-4" />
                        Print Receipt
                    </Button>
                    <Button onClick={onClose} className="flex-1 sm:flex-none">
                        New Sale
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
