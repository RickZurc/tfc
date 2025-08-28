import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
    track_stock: boolean;
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
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
                <Card key={product.id} className="cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md">
                    <CardContent className="p-4" onClick={() => onAddToCart(product)}>
                        <div className="space-y-3">
                            <div>
                                <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                                <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-primary">${formatCurrency(product.price)}</span>
                                <Badge
                                    variant={product.track_stock ? (product.stock_quantity > 10 ? 'default' : 'destructive') : 'secondary'}
                                    className="text-xs"
                                >
                                    {product.track_stock ? `${product.stock_quantity} left` : '∞'}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: product.category.color }} />
                                <span className="text-xs text-muted-foreground">{product.category.name}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
