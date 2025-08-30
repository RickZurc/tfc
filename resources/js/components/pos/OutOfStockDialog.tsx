import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface OutOfStockDialogProps {
  isOpen: boolean;
  productName: string;
  onClose: () => void;
}

export default function OutOfStockDialog({
  isOpen,
  productName,
  onClose,
}: OutOfStockDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <DialogTitle className="text-xl font-bold text-red-800">
            Product Out of Stock
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            The product "{productName}" is currently out of stock and cannot be added to the cart.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <Button 
            onClick={onClose}
            className="w-full"
            variant="default"
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
