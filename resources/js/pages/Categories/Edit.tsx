import { useState } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import AppLayout from '@/layouts/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { type BreadcrumbItem } from '@/types'
import { ArrowLeft, Save } from 'lucide-react'

interface Category {
    id: number
    name: string
    slug: string
    description: string | null
    color: string
    icon: string | null
    is_active: boolean
}

interface PageProps extends Record<string, unknown> {
    category: Category
}

const predefinedColors = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#EAB308', // Yellow
    '#22C55E', // Green
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6B7280', // Gray
    '#1F2937', // Dark Gray
]

export default function EditCategory() {
    const { category } = usePage<PageProps>().props
    
    const [formData, setFormData] = useState({
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon || '',
        is_active: category.is_active,
    })
    
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categories',
            href: '/categories',
        },
        {
            title: category.name,
            href: `/categories/${category.id}`,
        },
        {
            title: 'Edit',
            href: `/categories/${category.id}/edit`,
        },
    ]

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        
        router.patch(`/categories/${category.id}`, formData, {
            onError: (errors) => {
                setErrors(errors)
                setIsSubmitting(false)
            },
            onSuccess: () => {
                setIsSubmitting(false)
            },
        })
    }

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }))
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${category.name}`} />

            <div className="p-6">
                <div className="max-w-2xl">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/categories">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
                            <p className="text-muted-foreground">
                                Update category information
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Category Name *</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder="Enter category name"
                                        className={errors.name ? 'border-destructive' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                        placeholder="Enter category description (optional)"
                                        rows={3}
                                        className={`w-full px-3 py-2 border border-input rounded-md text-sm ${errors.description ? 'border-destructive' : ''}`}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description}</p>
                                    )}
                                </div>

                                {/* Color */}
                                <div className="space-y-2">
                                    <Label>Category Color *</Label>
                                    <div className="space-y-3">
                                        {/* Color Preview */}
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="w-8 h-8 rounded-full border border-border"
                                                style={{ backgroundColor: formData.color }}
                                            />
                                            <Input
                                                type="text"
                                                value={formData.color}
                                                onChange={(e) => handleInputChange('color', e.target.value)}
                                                placeholder="#6B7280"
                                                className={`w-32 ${errors.color ? 'border-destructive' : ''}`}
                                            />
                                            <input
                                                type="color"
                                                value={formData.color}
                                                onChange={(e) => handleInputChange('color', e.target.value)}
                                                className="w-10 h-10 rounded border border-input bg-background"
                                            />
                                        </div>
                                        
                                        {/* Predefined Colors */}
                                        <div>
                                            <p className="text-sm text-muted-foreground mb-2">Quick colors:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {predefinedColors.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => handleInputChange('color', color)}
                                                        className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                                                            formData.color === color 
                                                                ? 'border-primary shadow-md' 
                                                                : 'border-border hover:border-primary'
                                                        }`}
                                                        style={{ backgroundColor: color }}
                                                        title={color}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {errors.color && (
                                        <p className="text-sm text-destructive">{errors.color}</p>
                                    )}
                                </div>

                                {/* Icon */}
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <Input
                                        id="icon"
                                        value={formData.icon}
                                        onChange={(e) => handleInputChange('icon', e.target.value)}
                                        placeholder="Enter icon name (optional)"
                                        className={errors.icon ? 'border-destructive' : ''}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Icon name for UI display (e.g., "shopping-cart", "tag")
                                    </p>
                                    {errors.icon && (
                                        <p className="text-sm text-destructive">{errors.icon}</p>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="space-y-1">
                                        <Label>Active Status</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Active categories are visible in the POS and product management
                                        </p>
                                    </div>
                                    <Checkbox
                                        checked={formData.is_active}
                                        onCheckedChange={(checked: boolean) => handleInputChange('is_active', checked)}
                                    />
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button 
                                        type="submit" 
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Link href="/categories">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    )
}
