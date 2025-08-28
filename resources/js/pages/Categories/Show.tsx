import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, DollarSign, Edit, Package, Power, Trash2, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string;
    icon: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    products: Array<{
        id: number;
        name: string;
        sku: string;
        price: string;
        is_active: boolean;
        category: {
            id: number;
            name: string;
        };
    }>;
}

interface Stats {
    total_products: number;
    active_products: number;
    total_sales: number;
}

interface PageProps extends Record<string, unknown> {
    category: Category;
    stats: Stats;
}

export default function ShowCategory() {
    const { category, stats } = usePage<PageProps>().props;
    const [deleteDialog, setDeleteDialog] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categories',
            href: '/categories',
        },
        {
            title: category.name,
            href: `/categories/${category.id}`,
        },
    ];

    const handleToggleStatus = () => {
        router.patch(
            `/categories/${category.id}/toggle-status`,
            {},
            {
                preserveState: true,
            },
        );
    };

    const handleDelete = () => {
        router.delete(`/categories/${category.id}`, {
            preserveState: true,
        });
        setDeleteDialog(false);
    };

    const formatCurrency = (value: any): string => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) || num === null || num === undefined ? '0.00' : num.toFixed(2);
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusVariant = (isActive: boolean) => {
        return isActive ? 'default' : 'secondary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name} />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/categories">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <div className="mb-2 flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full border" style={{ backgroundColor: category.color }} />
                                <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
                                <Badge variant={getStatusVariant(category.is_active)}>{category.is_active ? 'Active' : 'Inactive'}</Badge>
                            </div>
                            {category.description && <p className="text-muted-foreground">{category.description}</p>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={`/categories/${category.id}/edit`}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="outline" onClick={handleToggleStatus}>
                            <Power className="mr-2 h-4 w-4" />
                            {category.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="destructive" onClick={() => setDeleteDialog(true)} disabled={stats.total_products > 0}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                                    <p className="text-2xl font-bold">{stats.total_products}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                                    <p className="text-2xl font-bold">{stats.active_products}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
                                    <p className="text-2xl font-bold">${formatCurrency(stats.total_sales)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Category Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                                    <p className="text-sm">{category.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Slug</p>
                                    <p className="font-mono text-sm">{category.slug}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Color</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 rounded border" style={{ backgroundColor: category.color }} />
                                        <p className="font-mono text-sm">{category.color}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Icon</p>
                                    <p className="text-sm">{category.icon || 'None'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                                    <p className="text-sm">{formatDate(category.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Updated</p>
                                    <p className="text-sm">{formatDate(category.updated_at)}</p>
                                </div>
                            </div>
                            {category.description && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                                    <p className="text-sm">{category.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Products */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Recent Products</span>
                                <Link href={`/products?category=${category.id}`}>
                                    <Button variant="outline" size="sm">
                                        View All
                                    </Button>
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {category.products.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Package className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                                    <p className="text-muted-foreground">No products in this category</p>
                                    <Link href="/products/create">
                                        <Button variant="outline" className="mt-2" size="sm">
                                            Add Product
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {category.products.map((product) => (
                                        <div key={product.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="font-medium">{product.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    SKU: {product.sku} • ${formatCurrency(parseFloat(product.price))}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getStatusVariant(product.is_active)}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Link href={`/products/${product.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{category.name}"?
                            {stats.total_products > 0 && (
                                <span className="font-medium text-destructive">
                                    {' '}
                                    This category has {stats.total_products} products and cannot be deleted.
                                </span>
                            )}
                            {stats.total_products === 0 && ' This action cannot be undone.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(false)}>
                            Cancel
                        </Button>
                        {stats.total_products === 0 && (
                            <Button variant="destructive" onClick={handleDelete}>
                                Delete
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
