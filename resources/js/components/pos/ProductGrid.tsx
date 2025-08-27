import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Helper function to safely format currency
const formatCurrency = (value: any): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? '0.00' : num.toFixed(2);
};

interface Product {
  id: number;
  name: string;
  price: string | number;
  sku: string;
  stock_quantity: number;
  category: {
    id: number;
    name: string;
    color: string;
  };
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function ProductGrid({ products, onAddToCart }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map(product => (
        <Card key={product.id} className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <CardContent className="p-4" onClick={() => onAddToCart(product)}>
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-primary">
                  ${formatCurrency(product.price)}
                </span>
                <Badge 
                  variant={product.stock_quantity > 10 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {product.stock_quantity} left
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: product.category.color }}
                />
                <span className="text-xs text-muted-foreground">{product.category.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
