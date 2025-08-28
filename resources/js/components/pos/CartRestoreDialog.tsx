import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RotateCcw } from 'lucide-react';

interface CartBackupInfo {
    item_count: number;
    saved_at: string;
    discount_amount?: string;
}

interface CartRestoreDialogProps {
    isOpen: boolean;
    cartBackupInfo: CartBackupInfo | null;
    onClose: () => void;
    onStartFresh: () => void;
    onRestore: () => void;
}

export default function CartRestoreDialog({ isOpen, cartBackupInfo, onClose, onStartFresh, onRestore }: CartRestoreDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                        <RotateCcw className="h-8 w-8 text-blue-600" />
                    </div>
                    <DialogTitle className="text-center">Restore Previous Cart?</DialogTitle>
                    <DialogDescription className="text-center">
                        We found a previously saved cart with {cartBackupInfo?.item_count} items. Would you like to restore it?
                    </DialogDescription>
                </DialogHeader>

                {cartBackupInfo && (
                    <div className="space-y-2 py-4">
                        <div className="space-y-1 rounded-lg bg-gray-50 p-3">
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
                    <Button variant="outline" onClick={onStartFresh}>
                        Start Fresh
                    </Button>
                    <Button onClick={onRestore}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Restore Cart
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
