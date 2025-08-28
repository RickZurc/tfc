import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface CartStatusBarProps {
    cartItemCount: number;
    onSaveToServer: () => void;
}

export default function CartStatusBar({ cartItemCount, onSaveToServer }: CartStatusBarProps) {
    if (cartItemCount === 0) return null;

    return (
        <div className="mb-4 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 p-3">
            <div className="flex items-center gap-2">
                <Save className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">Cart automatically saved ({cartItemCount} items)</span>
            </div>
            <Button size="sm" variant="outline" onClick={onSaveToServer} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Save className="mr-1 h-3 w-3" />
                Backup to Server
            </Button>
        </div>
    );
}
