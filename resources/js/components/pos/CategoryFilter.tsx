import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CategoryFilterProps } from '@/types/pos';
import { DynamicIcon } from '@/components/ui/dynamic-icon';


export default function CategoryFilter({ categories, selectedCategory, onCategoryChange }: CategoryFilterProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-wrap gap-2">
                    <Button variant={selectedCategory === null ? 'default' : 'outline'} size="sm" onClick={() => onCategoryChange(null)}>
                        All Categories
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category.id}
                            variant={selectedCategory === category.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onCategoryChange(category.id)}
                            style={{ backgroundColor: selectedCategory === category.id ? category.color : undefined }}
                        >
                            <DynamicIcon name={category.icon} size={16} />
                            {category.name}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
