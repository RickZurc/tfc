import React from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartStatusBarProps {
  cartItemCount: number;
  onSaveToServer: () => void;
}

export default function CartStatusBar({ cartItemCount, onSaveToServer }: CartStatusBarProps) {
  if (cartItemCount === 0) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Save className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-800">
          Cart automatically saved ({cartItemCount} items)
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onSaveToServer}
        className="text-blue-600 border-blue-600 hover:bg-blue-50"
      >
        <Save className="h-3 w-3 mr-1" />
        Backup to Server
      </Button>
    </div>
  );
}
