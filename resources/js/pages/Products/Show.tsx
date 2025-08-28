import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Activity, ArrowLeft, Calendar, DollarSign, Edit, Info, Package, ShoppingCart, TrendingUp } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    color: string;
}

interface Product {
    id: number;
    name: string;
    sku: string;
    price: string;
    cost_price: string | null;
    barcode: string | null;
    description: string | null;
    unit: string | null;
    weight: string | null;
    dimensions: string | null;
    track_stock: boolean;
    stock_quantity: number | null;
    min_stock_level: number | null;
    max_stock_level: number | null;
    is_active: boolean;
    tax_rate: string;
    category: Category;
    created_at: string;
    updated_at: string;
}

interface Customer {
    id: number;
    name: string;
}

interface Order {
    id: number;
    total_amount: string;
    status: string;
    created_at: string;
    customer: Customer | null;
}

interface OrderItem {
    id: number;
    quantity: number;
    unit_price: string;
    total_price: string;
    order: Order;
}

interface Props {
    product: Product;
    recentOrders: OrderItem[];
    statistics: {
        totalSold: number;
        totalRevenue: string;
    };
}

const getBreadcrumbs = (product: Product): BreadcrumbItem[] => [
    {
        title: 'Products',
        href: '/products',
    },
    {
        title: product.name,
        href: `/products/${product.id}`,
    },
];

export default function ProductShow({ product, recentOrders, statistics }: Props) {
    const formatCurrency = (amount: string) => {
        const num = parseFloat(amount || '0');
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(num);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStockStatus = () => {
        if (!product.track_stock) return null;

        if (product.stock_quantity === 0) {
            return { status: 'out', label: 'Out of Stock', variant: 'destructive' as const };
        }

        if (product.min_stock_level && product.stock_quantity && product.stock_quantity <= product.min_stock_level) {
            return { status: 'low', label: 'Low Stock', variant: 'secondary' as const };
        }

        return { status: 'good', label: 'In Stock', variant: 'default' as const };
    };

    const stockStatus = getStockStatus();

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(product)}>
            <Head title={product.name} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('products.index')}>
                            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Products
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
                            <p className="text-muted-foreground">Product Details • SKU: {product.sku}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Active' : 'Inactive'}</Badge>
                        <Link href={route('products.edit', product.id)}>
                            <Button className="flex items-center gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Product
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Price</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(product.price)}</div>
                            {product.cost_price && <p className="text-xs text-muted-foreground">Cost: {formatCurrency(product.cost_price)}</p>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.totalSold}</div>
                            <p className="text-xs text-muted-foreground">Units sold</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(statistics.totalRevenue)}</div>
                            <p className="text-xs text-muted-foreground">Revenue generated</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            {product.track_stock ? (
                                <>
                                    <div className="text-2xl font-bold">{product.stock_quantity ?? 0}</div>
                                    {stockStatus && (
                                        <Badge variant={stockStatus.variant} className="text-xs">
                                            {stockStatus.label}
                                        </Badge>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="text-2xl font-bold text-muted-foreground">∞</div>
                                    <p className="text-xs text-muted-foreground">Not tracked</p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Product Information */}
                    <div className="space-y-6 lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Info className="h-5 w-5" />
                                    Product Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                                        <p className="text-sm">{product.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Category</label>
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: product.category.color }} />
                                            <span className="text-sm">{product.category.name}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">SKU</label>
                                        <code className="rounded bg-muted px-2 py-1 text-sm">{product.sku}</code>
                                    </div>
                                    {product.barcode && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Barcode</label>
                                            <code className="rounded bg-muted px-2 py-1 text-sm">{product.barcode}</code>
                                        </div>
                                    )}
                                    {product.unit && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Unit</label>
                                            <p className="text-sm">{product.unit}</p>
                                        </div>
                                    )}
                                    {product.weight && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Weight</label>
                                            <p className="text-sm">{product.weight} kg</p>
                                        </div>
                                    )}
                                    {product.dimensions && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                                            <p className="text-sm">{product.dimensions}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Tax Rate</label>
                                        <p className="text-sm">{product.tax_rate}%</p>
                                    </div>
                                </div>

                                {product.description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                                        <p className="mt-1 text-sm">{product.description}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Orders */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Recent Sales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentOrders.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentOrders.map((orderItem) => (
                                            <div key={orderItem.id} className="flex items-center justify-between rounded-lg border p-3">
                                                <div>
                                                    <p className="font-medium">Order #{orderItem.order.id}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {orderItem.order.customer?.name || 'Guest'} • {formatDate(orderItem.order.created_at)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {orderItem.quantity} × {formatCurrency(orderItem.unit_price)}
                                                    </p>
                                                    <p className="text-sm font-bold text-green-600">{formatCurrency(orderItem.total_price)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center">
                                        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                        <h3 className="mb-2 text-lg font-medium">No sales yet</h3>
                                        <p className="text-muted-foreground">This product hasn't been sold yet</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Pricing Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5" />
                                    Pricing Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Sale Price</span>
                                    <span className="font-medium">{formatCurrency(product.price)}</span>
                                </div>
                                {product.cost_price && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Cost Price</span>
                                            <span className="font-medium">{formatCurrency(product.cost_price)}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t pt-2">
                                            <span className="text-sm text-muted-foreground">Profit Margin</span>
                                            <span className="font-medium text-green-600">
                                                {(
                                                    ((parseFloat(product.price) - parseFloat(product.cost_price)) / parseFloat(product.price)) *
                                                    100
                                                ).toFixed(1)}
                                                %
                                            </span>
                                        </div>
                                    </>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Tax Rate</span>
                                    <span className="font-medium">{product.tax_rate}%</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Information */}
                        {product.track_stock && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Stock Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Current Stock</span>
                                        <span className="font-medium">{product.stock_quantity ?? 0}</span>
                                    </div>
                                    {product.min_stock_level && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Min Level</span>
                                            <span className="font-medium">{product.min_stock_level}</span>
                                        </div>
                                    )}
                                    {product.max_stock_level && (
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Max Level</span>
                                            <span className="font-medium">{product.max_stock_level}</span>
                                        </div>
                                    )}
                                    {stockStatus && (
                                        <div className="border-t pt-2">
                                            <Badge variant={stockStatus.variant} className="w-full justify-center">
                                                {stockStatus.label}
                                            </Badge>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Product Dates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Product History
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <p className="text-sm font-medium">{formatDate(product.created_at)}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Last Updated</span>
                                    <p className="text-sm font-medium">{formatDate(product.updated_at)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href={route('products.edit', product.id)} className="w-full">
                                    <Button className="flex w-full items-center gap-2">
                                        <Edit className="h-4 w-4" />
                                        Edit Product
                                    </Button>
                                </Link>
                                <Link href={route('products.index')} className="w-full">
                                    <Button variant="outline" className="w-full">
                                        Back to Products
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
