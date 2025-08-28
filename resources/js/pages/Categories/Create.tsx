import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { IconSelector } from '@/components/ui/icon-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Categories',
        href: '/categories',
    },
    {
        title: 'Create Category',
        href: '/categories/create',
    },
];

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
];

export default function CreateCategory() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#6B7280',
        icon: '',
        is_active: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post('/categories', formData, {
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <div className="p-6">
                <div className="max-w-2xl">
                    {/* Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <Link href="/categories">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create Category</h1>
                            <p className="text-muted-foreground">Add a new category to organize your products</p>
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
                                    {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
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
                                        className={`w-full rounded-md border border-input px-3 py-2 text-sm ${errors.description ? 'border-destructive' : ''}`}
                                    />
                                    {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                </div>

                                {/* Color */}
                                <div className="space-y-2">
                                    <Label>Category Color *</Label>
                                    <div className="space-y-3">
                                        {/* Color Preview */}
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full border border-border" style={{ backgroundColor: formData.color }} />
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
                                                className="h-10 w-10 rounded border border-input bg-background"
                                            />
                                        </div>

                                        {/* Predefined Colors */}
                                        <div>
                                            <p className="mb-2 text-sm text-muted-foreground">Quick colors:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {predefinedColors.map((color) => (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        onClick={() => handleInputChange('color', color)}
                                                        className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${
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
                                    {errors.color && <p className="text-sm text-destructive">{errors.color}</p>}
                                </div>

                                {/* Icon */}
                                <div className="space-y-2">
                                    <Label htmlFor="icon">Icon</Label>
                                    <IconSelector
                                        value={formData.icon}
                                        onValueChange={(value) => handleInputChange('icon', value)}
                                        placeholder="Choose an icon..."
                                        className={errors.icon ? 'border-destructive' : ''}
                                    />
                                    <p className="text-sm text-muted-foreground">Select an icon to represent this category</p>
                                    {errors.icon && <p className="text-sm text-destructive">{errors.icon}</p>}
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between rounded-md border p-3">
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
                                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                                        <Save className="mr-2 h-4 w-4" />
                                        {isSubmitting ? 'Creating...' : 'Create Category'}
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
    );
}
