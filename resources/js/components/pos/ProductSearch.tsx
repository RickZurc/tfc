import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Product } from '@/types/pos';

interface ProductSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredProducts: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductSearch({ searchQuery, onSearchChange, filteredProducts, onAddToCart }: ProductSearchProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '' && filteredProducts.length === 1) {
      // If there's exactly one filtered product, add it to cart
      onAddToCart(filteredProducts[0]);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
          {searchQuery.trim() !== '' && filteredProducts.length === 1 && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
              Press Enter to add
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
