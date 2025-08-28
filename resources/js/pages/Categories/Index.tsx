import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { type BreadcrumbItem } from '@/types'
import { 
    Plus, 
    Search, 
    MoreHorizontal, 
    Edit, 
    Trash2, 
    Eye, 
    Power,
    Package2,
    Filter,
    RefreshCw,
    Tag
} from 'lucide-react'

interface Category {
    id: number
    name: string
    slug: string
    description: string | null
    color: string
    icon: string | null
    is_active: boolean
    products_count: number
    created_at: string
    updated_at: string
}

interface PageProps extends Record<string, unknown> {
    categories: {
        data: Category[]
        links: any[]
        current_page: number
        last_page: number
        per_page: number
        total: number
    }
    filters: {
        search?: string
        status?: string
    }
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
]

export default function CategoriesIndex() {
    const { categories, filters } = usePage<PageProps>().props
    const [searchQuery, setSearchQuery] = useState(filters.search || '')
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all')
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; category: Category | null }>({
        open: false,
        category: null
    })

    const handleSearch = () => {
        router.get('/categories', {
            search: searchQuery || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const handleStatusChange = (value: string) => {
        setStatusFilter(value)
        router.get('/categories', {
            search: searchQuery || undefined,
            status: value !== 'all' ? value : undefined,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleReset = () => {
        setSearchQuery('')
        setStatusFilter('all')
        router.get('/categories', {}, {
            preserveState: true,
            replace: true,
        })
    }

    const handleToggleStatus = (category: Category) => {
        router.patch(`/categories/${category.id}/toggle-status`, {}, {
            preserveState: true,
        })
    }

    const handleDelete = (category: Category) => {
        router.delete(`/categories/${category.id}`, {
            preserveState: true,
        })
        setDeleteDialog({ open: false, category: null })
    }

    const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all'

    const getStatusVariant = (isActive: boolean) => {
        return isActive ? 'default' : 'secondary'
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Categories" />

            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                        <p className="text-muted-foreground">
                            Manage product categories and organize your inventory
                        </p>
                    </div>
                    <Link href="/categories/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-2">
                                    Active
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    placeholder="Search categories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="pl-10"
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button onClick={handleSearch} className="flex-1">
                                    <Search className="h-4 w-4 mr-2" />
                                    Search
                                </Button>
                                <Button variant="outline" onClick={handleReset}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.data.length === 0 ? (
                        <div className="col-span-full">
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Package2 className="w-12 h-12 mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">No categories found</h3>
                                    <p className="text-muted-foreground text-center mb-4">
                                        {hasActiveFilters 
                                            ? 'No categories match your current filters' 
                                            : 'Get started by creating your first category'}
                                    </p>
                                    {hasActiveFilters ? (
                                        <Button variant="outline" onClick={handleReset}>
                                            Clear filters
                                        </Button>
                                    ) : (
                                        <Link href="/categories/create">
                                            <Button>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Category
                                            </Button>
                                        </Link>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        categories.data.map((category) => (
                            <Card key={category.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: category.color }}
                                                />
                                                <div 
                                                    className="p-2 rounded-md"
                                                    style={{ backgroundColor: `${category.color}20` }}
                                                >
                                                    <DynamicIcon 
                                                        name={category.icon}
                                                        className="h-4 w-4" 
                                                        style={{ color: category.color }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">{category.name}</h3>
                                                <Badge variant={getStatusVariant(category.is_active)} className="mt-1">
                                                    {category.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <Link href={`/categories/${category.id}`}>
                                                    <DropdownMenuItem>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        View Details
                                                    </DropdownMenuItem>
                                                </Link>
                                                <Link href={`/categories/${category.id}/edit`}>
                                                    <DropdownMenuItem>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                                                    <Power className="h-4 w-4 mr-2" />
                                                    {category.is_active ? 'Deactivate' : 'Activate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    className="text-destructive"
                                                    onClick={() => setDeleteDialog({ open: true, category })}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {category.description && (
                                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                            {category.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-muted-foreground">
                                                {category.products_count} {category.products_count === 1 ? 'product' : 'products'}
                                            </span>
                                        </div>
                                        <Link href={`/categories/${category.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {categories.links && categories.data.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex gap-1">
                            {categories.links.map((link: any, index: number) => (
                                <Button
                                    key={index}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url)}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, category: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            {deleteDialog.category && (
                                <>
                                    Are you sure you want to delete "{deleteDialog.category.name}"?
                                    {deleteDialog.category.products_count > 0 && (
                                        <span className="text-destructive font-medium">
                                            {' '}This category has {deleteDialog.category.products_count} products and cannot be deleted.
                                        </span>
                                    )}
                                    {deleteDialog.category.products_count === 0 && ' This action cannot be undone.'}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ open: false, category: null })}>
                            Cancel
                        </Button>
                        {deleteDialog.category && deleteDialog.category.products_count === 0 && (
                            <Button 
                                variant="destructive"
                                onClick={() => deleteDialog.category && handleDelete(deleteDialog.category)}
                            >
                                Delete
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    )
}
