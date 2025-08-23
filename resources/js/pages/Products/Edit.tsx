import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { type BreadcrumbItem } from '@/types'
import { ArrowLeft, Save, Package, DollarSign, Barcode, Settings } from 'lucide-react'

interface Category {
    id: number
    name: string
    color: string
}

interface Product {
    id: number
    name: string
    category_id: number
    price: string
    cost_price: string | null
    sku: string
    barcode: string | null
    description: string | null
    unit: string | null
    weight: string | null
    dimensions: string | null
    track_stock: boolean
    stock_quantity: number | null
    min_stock_level: number | null
    max_stock_level: number | null
    is_active: boolean
    tax_rate: string
}

interface Props {
    product: Product
    categories: Category[]
}

interface FormData {
    name: string
    category_id: string
    price: string
    cost_price: string
    sku: string
    barcode: string
    description: string
    unit: string
    weight: string
    dimensions: string
    track_stock: boolean
    stock_quantity: string
    min_stock_level: string
    max_stock_level: string
    is_active: boolean
    tax_rate: string
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
    {
        title: 'Edit',
        href: `/products/${product.id}/edit`,
    },
]

export default function ProductEdit({ product, categories }: Props) {
    const [formData, setFormData] = useState<FormData>({
        name: product.name,
        category_id: product.category_id.toString(),
        price: product.price,
        cost_price: product.cost_price || '',
        sku: product.sku,
        barcode: product.barcode || '',
        description: product.description || '',
        unit: product.unit || '',
        weight: product.weight || '',
        dimensions: product.dimensions || '',
        track_stock: product.track_stock,
        stock_quantity: product.stock_quantity?.toString() || '',
        min_stock_level: product.min_stock_level?.toString() || '',
        max_stock_level: product.max_stock_level?.toString() || '',
        is_active: product.is_active,
        tax_rate: product.tax_rate
    })

    const [errors, setErrors] = useState<Record<string, string>>({})
    const [processing, setProcessing] = useState(false)

    const handleChange = (field: keyof FormData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setProcessing(true)

        // Convert form data to the format expected by Laravel
        const submitData = {
            ...formData,
            category_id: formData.category_id ? parseInt(formData.category_id) : null,
            price: formData.price ? parseFloat(formData.price) : null,
            cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
            weight: formData.weight ? parseFloat(formData.weight) : null,
            stock_quantity: formData.track_stock && formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
            min_stock_level: formData.track_stock && formData.min_stock_level ? parseInt(formData.min_stock_level) : null,
            max_stock_level: formData.track_stock && formData.max_stock_level ? parseInt(formData.max_stock_level) : null,
            tax_rate: formData.tax_rate ? parseFloat(formData.tax_rate) : 0,
            _method: 'PUT'
        }

        router.post(route('products.update', product.id), submitData, {
            onFinish: () => setProcessing(false),
            onError: (errors) => setErrors(errors),
        })
    }

    return (
        <AppLayout breadcrumbs={getBreadcrumbs(product)}>
            <Head title={`Edit ${product.name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4 overflow-x-auto">
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
                            <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
                            <p className="text-muted-foreground">
                                Update product information for {product.name}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Basic Information */}
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Basic Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Product Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            placeholder="Enter product name"
                                            className={errors.name ? 'border-destructive' : ''}
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-destructive mt-1">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="category_id">Category *</Label>
                                        <Select value={formData.category_id} onValueChange={(value) => handleChange('category_id', value)}>
                                            <SelectTrigger className={errors.category_id ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-3 h-3 rounded-full" 
                                                                style={{ backgroundColor: category.color }}
                                                            />
                                                            {category.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.category_id && (
                                            <p className="text-sm text-destructive mt-1">{errors.category_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleChange('description', e.target.value)}
                                            placeholder="Enter product description"
                                            className="w-full min-h-[80px] px-3 py-2 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-destructive mt-1">{errors.description}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5" />
                                        Pricing & Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="price">Sale Price *</Label>
                                            <Input
                                                id="price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.price}
                                                onChange={(e) => handleChange('price', e.target.value)}
                                                placeholder="0.00"
                                                className={errors.price ? 'border-destructive' : ''}
                                            />
                                            {errors.price && (
                                                <p className="text-sm text-destructive mt-1">{errors.price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="cost_price">Cost Price</Label>
                                            <Input
                                                id="cost_price"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.cost_price}
                                                onChange={(e) => handleChange('cost_price', e.target.value)}
                                                placeholder="0.00"
                                                className={errors.cost_price ? 'border-destructive' : ''}
                                            />
                                            {errors.cost_price && (
                                                <p className="text-sm text-destructive mt-1">{errors.cost_price}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                            <Input
                                                id="tax_rate"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="100"
                                                value={formData.tax_rate}
                                                onChange={(e) => handleChange('tax_rate', e.target.value)}
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="unit">Unit</Label>
                                            <Input
                                                id="unit"
                                                value={formData.unit}
                                                onChange={(e) => handleChange('unit', e.target.value)}
                                                placeholder="e.g. pcs, kg, liter"
                                                className={errors.unit ? 'border-destructive' : ''}
                                            />
                                            {errors.unit && (
                                                <p className="text-sm text-destructive mt-1">{errors.unit}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Barcode className="h-5 w-5" />
                                        Product Identification
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="sku">SKU</Label>
                                            <Input
                                                id="sku"
                                                value={formData.sku}
                                                onChange={(e) => handleChange('sku', e.target.value)}
                                                placeholder="Product SKU"
                                                className={errors.sku ? 'border-destructive' : ''}
                                            />
                                            {errors.sku && (
                                                <p className="text-sm text-destructive mt-1">{errors.sku}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="barcode">Barcode</Label>
                                            <Input
                                                id="barcode"
                                                value={formData.barcode}
                                                onChange={(e) => handleChange('barcode', e.target.value)}
                                                placeholder="Enter barcode"
                                                className={errors.barcode ? 'border-destructive' : ''}
                                            />
                                            {errors.barcode && (
                                                <p className="text-sm text-destructive mt-1">{errors.barcode}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <Label htmlFor="weight">Weight (kg)</Label>
                                            <Input
                                                id="weight"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={formData.weight}
                                                onChange={(e) => handleChange('weight', e.target.value)}
                                                placeholder="0.00"
                                                className={errors.weight ? 'border-destructive' : ''}
                                            />
                                            {errors.weight && (
                                                <p className="text-sm text-destructive mt-1">{errors.weight}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="dimensions">Dimensions</Label>
                                            <Input
                                                id="dimensions"
                                                value={formData.dimensions}
                                                onChange={(e) => handleChange('dimensions', e.target.value)}
                                                placeholder="e.g. 10x5x2 cm"
                                                className={errors.dimensions ? 'border-destructive' : ''}
                                            />
                                            {errors.dimensions && (
                                                <p className="text-sm text-destructive mt-1">{errors.dimensions}</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Settings className="h-5 w-5" />
                                        Product Settings
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => handleChange('is_active', Boolean(checked))}
                                        />
                                        <Label htmlFor="is_active" className="text-sm font-medium">
                                            Active Product
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Inactive products will not be available for sale in the POS system
                                    </p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Inventory Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="track_stock"
                                            checked={formData.track_stock}
                                            onCheckedChange={(checked) => handleChange('track_stock', Boolean(checked))}
                                        />
                                        <Label htmlFor="track_stock" className="text-sm font-medium">
                                            Track Stock Levels
                                        </Label>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Enable inventory tracking for this product
                                    </p>

                                    {formData.track_stock && (
                                        <div className="space-y-4 pt-4 border-t">
                                            <div>
                                                <Label htmlFor="stock_quantity">Current Stock</Label>
                                                <Input
                                                    id="stock_quantity"
                                                    type="number"
                                                    min="0"
                                                    value={formData.stock_quantity}
                                                    onChange={(e) => handleChange('stock_quantity', e.target.value)}
                                                    placeholder="0"
                                                    className={errors.stock_quantity ? 'border-destructive' : ''}
                                                />
                                                {errors.stock_quantity && (
                                                    <p className="text-sm text-destructive mt-1">{errors.stock_quantity}</p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                                                <Input
                                                    id="min_stock_level"
                                                    type="number"
                                                    min="0"
                                                    value={formData.min_stock_level}
                                                    onChange={(e) => handleChange('min_stock_level', e.target.value)}
                                                    placeholder="0"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Alert when stock falls below this level
                                                </p>
                                            </div>

                                            <div>
                                                <Label htmlFor="max_stock_level">Maximum Stock Level</Label>
                                                <Input
                                                    id="max_stock_level"
                                                    type="number"
                                                    min="0"
                                                    value={formData.max_stock_level}
                                                    onChange={(e) => handleChange('max_stock_level', e.target.value)}
                                                    placeholder="0"
                                                />
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Optional maximum stock level for reordering
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Actions Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button 
                                        type="submit" 
                                        className="w-full flex items-center gap-2" 
                                        disabled={processing}
                                    >
                                        <Save className="h-4 w-4" />
                                        {processing ? 'Updating...' : 'Update Product'}
                                    </Button>
                                    <Link href={route('products.show', product.id)} className="w-full">
                                        <Button type="button" variant="outline" className="w-full">
                                            View Product
                                        </Button>
                                    </Link>
                                    <Link href={route('products.index')} className="w-full">
                                        <Button type="button" variant="ghost" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    )
}
