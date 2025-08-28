import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Filter, MoreHorizontal, Package, Plus, Power, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

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
    stock_quantity: number | null;
    min_stock_level: number | null;
    track_stock: boolean;
    is_active: boolean;
    category: Category;
    created_at: string;
}

interface Props {
    products: {
        data: Product[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category?: string;
        status?: string;
        stock?: string;
        sort?: string;
        direction?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Products',
        href: '/products',
    },
];

export default function ProductsIndex({ products, categories, filters }: Props) {
    const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [stockFilter, setStockFilter] = useState(filters.stock || 'all');

    // Dialog states
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        type: 'single' | 'bulk';
        product?: Product;
        count?: number;
    }>({
        open: false,
        type: 'single',
    });

    const handleSearch = () => {
        router.get(
            route('products.index'),
            {
                search: searchTerm,
                category: categoryFilter === 'all' ? '' : categoryFilter,
                status: statusFilter === 'all' ? '' : statusFilter,
                stock: stockFilter === 'all' ? '' : stockFilter,
            },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setStatusFilter('all');
        setStockFilter('all');
        router.get(route('products.index'));
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === products.data.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(products.data.map((p) => p.id));
        }
    };

    const toggleSelectProduct = (productId: number) => {
        setSelectedProducts((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
    };

    const handleBulkAction = (action: string) => {
        if (selectedProducts.length === 0) return;

        if (action === 'delete') {
            setDeleteDialog({
                open: true,
                type: 'bulk',
                count: selectedProducts.length,
            });
            return;
        }

        router.post(
            route('products.bulk-action'),
            {
                action,
                products: selectedProducts,
            },
            {
                onSuccess: () => setSelectedProducts([]),
            },
        );
    };

    const toggleProductStatus = (product: Product) => {
        router.patch(route('products.toggle-status', product.id));
    };

    const deleteProduct = (product: Product) => {
        setDeleteDialog({
            open: true,
            type: 'single',
            product: product,
        });
    };

    const confirmDelete = () => {
        console.log('confirmDelete called', deleteDialog);

        if (deleteDialog.type === 'single' && deleteDialog.product) {
            console.log('Single delete for product:', deleteDialog.product.id);
            router.delete(route('products.destroy', deleteDialog.product.id), {
                onSuccess: () => {
                    console.log('Single delete success');
                    setDeleteDialog({ open: false, type: 'single' });
                },
                onError: (errors) => {
                    console.error('Single delete error:', errors);
                },
            });
        } else if (deleteDialog.type === 'bulk') {
            console.log('Bulk delete for products:', selectedProducts);
            router.post(
                route('products.bulk-action'),
                {
                    action: 'delete',
                    products: selectedProducts,
                },
                {
                    onSuccess: () => {
                        console.log('Bulk delete success');
                        setSelectedProducts([]);
                        setDeleteDialog({ open: false, type: 'bulk' });
                    },
                    onError: (errors) => {
                        console.error('Bulk delete error:', errors);
                    },
                },
            );
        }
    };

    const formatCurrency = (amount: string) => {
        const num = parseFloat(amount || '0');
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(num);
    };

    const getStockStatus = (product: Product) => {
        if (!product.track_stock) return null;

        if (product.stock_quantity === 0) {
            return { status: 'out', label: 'Out of Stock', variant: 'destructive' as const };
        }

        if (product.min_stock_level && product.stock_quantity && product.stock_quantity <= product.min_stock_level) {
            return { status: 'low', label: 'Low Stock', variant: 'secondary' as const };
        }

        return { status: 'good', label: 'In Stock', variant: 'default' as const };
    };

    const hasActiveFilters = searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || stockFilter !== 'all';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground">Manage your product catalog and inventory</p>
                    </div>
                    <Link href={route('products.create')}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                {/* Statistics Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                            <Package className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{products.total}</div>
                            <p className="text-xs text-muted-foreground">Products in catalog</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                            <Power className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{products.data.filter((p) => p.is_active).length}</div>
                            <p className="text-xs text-muted-foreground">Available for sale</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
                            <Package className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">
                                {
                                    products.data.filter((p) => {
                                        const stock = getStockStatus(p);
                                        return stock?.status === 'low' || stock?.status === 'out';
                                    }).length
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">Need restocking</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Categories</CardTitle>
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{categories.length}</div>
                            <p className="text-xs text-muted-foreground">Product categories</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        placeholder="Search products..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={stockFilter} onValueChange={setStockFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Stock" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Stock</SelectItem>
                                    <SelectItem value="in">In Stock</SelectItem>
                                    <SelectItem value="low">Low Stock</SelectItem>
                                    <SelectItem value="out">Out of Stock</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={handleSearch} className="w-full">
                                Apply Filters
                            </Button>
                        </div>

                        {hasActiveFilters && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {searchTerm && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Search: {searchTerm}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                                    </Badge>
                                )}
                                {categoryFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Category: {categories.find((c) => c.id.toString() === categoryFilter)?.name}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter('all')} />
                                    </Badge>
                                )}
                                {statusFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Status: {statusFilter}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter('all')} />
                                    </Badge>
                                )}
                                {stockFilter !== 'all' && (
                                    <Badge variant="secondary" className="flex items-center gap-1">
                                        Stock: {stockFilter}
                                        <X className="h-3 w-3 cursor-pointer" onClick={() => setStockFilter('all')} />
                                    </Badge>
                                )}
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bulk Actions */}
                {selectedProducts.length > 0 && (
                    <Card>
                        <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">{selectedProducts.length} product(s) selected</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('activate')}>
                                        Activate
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => handleBulkAction('deactivate')}>
                                        Deactivate
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleBulkAction('delete')}>
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="p-2 text-left">
                                            <Checkbox
                                                checked={selectedProducts.length === products.data.length && products.data.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="p-2 text-left">Product</th>
                                        <th className="p-2 text-left">SKU</th>
                                        <th className="p-2 text-left">Category</th>
                                        <th className="p-2 text-left">Price</th>
                                        <th className="p-2 text-left">Stock</th>
                                        <th className="p-2 text-left">Status</th>
                                        <th className="p-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.data.map((product) => {
                                        const stockStatus = getStockStatus(product);
                                        return (
                                            <tr key={product.id} className="border-b hover:bg-muted/50">
                                                <td className="p-2">
                                                    <Checkbox
                                                        checked={selectedProducts.includes(product.id)}
                                                        onCheckedChange={() => toggleSelectProduct(product.id)}
                                                    />
                                                </td>
                                                <td className="p-2">
                                                    <div>
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Created {new Date(product.created_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-2">
                                                    <code className="rounded bg-muted px-2 py-1 text-sm">{product.sku}</code>
                                                </td>
                                                <td className="p-2">
                                                    <Badge
                                                        variant="outline"
                                                        style={{ borderColor: product.category.color, color: product.category.color }}
                                                    >
                                                        {product.category.name}
                                                    </Badge>
                                                </td>
                                                <td className="p-2">
                                                    <span className="font-medium">{formatCurrency(product.price)}</span>
                                                </td>
                                                <td className="p-2">
                                                    {product.track_stock ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm">{product.stock_quantity ?? 0} units</div>
                                                            {stockStatus && (
                                                                <Badge variant={stockStatus.variant} className="text-xs">
                                                                    {stockStatus.label}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline">Not tracked</Badge>
                                                    )}
                                                </td>
                                                <td className="p-2">
                                                    <Button
                                                        variant={product.is_active ? 'default' : 'secondary'}
                                                        size="sm"
                                                        onClick={() => toggleProductStatus(product)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Power className="h-3 w-3" />
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </Button>
                                                </td>
                                                <td className="p-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('products.show', product.id)}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link href={route('products.edit', product.id)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => deleteProduct(product)} className="text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {products.data.length === 0 && (
                            <div className="py-8 text-center">
                                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <h3 className="mb-2 text-lg font-medium">No products found</h3>
                                <p className="mb-4 text-muted-foreground">
                                    {hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Get started by adding your first product'}
                                </p>
                                {!hasActiveFilters && (
                                    <Link href={route('products.create')}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Product
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {products.links && products.links.length > 3 && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">
                            {products.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{deleteDialog.type === 'single' ? 'Delete Product' : 'Delete Products'}</DialogTitle>
                        <DialogDescription>
                            {deleteDialog.type === 'single' && deleteDialog.product ? (
                                <>
                                    Are you sure you want to delete "<strong>{deleteDialog.product.name}</strong>"?
                                    <br />
                                    This action cannot be undone.
                                </>
                            ) : (
                                <>
                                    Are you sure you want to delete <strong>{deleteDialog.count} product(s)</strong>?
                                    <br />
                                    This action cannot be undone.
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, type: 'single' })}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete {deleteDialog.type === 'bulk' ? `${deleteDialog.count} Products` : 'Product'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
