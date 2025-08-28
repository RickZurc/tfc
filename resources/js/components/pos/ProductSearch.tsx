import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ProductSearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export default function ProductSearch({ searchQuery, onSearchChange }: ProductSearchProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                    <Input
                        placeholder="Search products by name or SKU..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
