import { useState, useMemo } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

interface IconSelectorProps {
    value?: string
    onValueChange: (value: string) => void
    placeholder?: string
    className?: string
}

// Get all Lucide icon names (excluding internal React components)
const getAllIconNames = (): string[] => {
    return Object.keys(LucideIcons)
        .filter(name => {
            // Exclude internal components and utilities
            if (name === 'default' || name === 'createLucideIcon' || name === 'Icon') {
                return false
            }
            
            // Include icons that are objects (React components) and PascalCase
            const isObject = typeof (LucideIcons as unknown as Record<string, unknown>)[name] === 'object'
            const isPascalCase = name[0] === name[0].toUpperCase()
            
            // Exclude the "Icon" suffixed versions (we want the base name)
            const isIconSuffix = name.endsWith('Icon')
            
            const isValid = isObject && isPascalCase && !isIconSuffix
            
            return isValid
        })
        .sort()
}

export function IconSelector({ value, onValueChange, placeholder = "Select an icon...", className }: IconSelectorProps) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    
    const allIcons = useMemo(() => getAllIconNames(), [])
    
    const filteredIcons = useMemo(() => {
        if (!searchValue) return allIcons.slice(0, 100) // Show first 100 by default for performance
        
        return allIcons.filter(iconName =>
            iconName.toLowerCase().includes(searchValue.toLowerCase())
        ).slice(0, 50) // Limit search results for performance
    }, [allIcons, searchValue])

    const selectedIcon = value && allIcons.includes(value) ? value : ''

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    <div className="flex items-center gap-2">
                        {selectedIcon ? (
                            <>
                                <DynamicIcon name={selectedIcon} className="h-4 w-4" />
                                <span>{selectedIcon}</span>
                            </>
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                <div className="flex flex-col">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            placeholder="Search icons..."
                            className="border-0 px-0 py-1 h-8 focus-visible:ring-0"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                        />
                    </div>
                    
                    {/* Icon List */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {/* Clear selection option */}
                        <div
                            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                            onClick={() => {
                                onValueChange('')
                                setOpen(false)
                            }}
                        >
                            <div className="h-4 w-4 flex items-center justify-center">
                                {!selectedIcon && <Check className="h-4 w-4" />}
                            </div>
                            <span className="text-muted-foreground italic">No icon</span>
                        </div>
                        
                        {/* Icon options */}
                        {filteredIcons.length === 0 && searchValue ? (
                            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                                No icons found.
                            </div>
                        ) : (
                            filteredIcons.map((iconName) => (
                                <div
                                    key={iconName}
                                    className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-accent"
                                    onClick={() => {
                                        onValueChange(iconName)
                                        setOpen(false)
                                    }}
                                >
                                    <div className="h-4 w-4 flex items-center justify-center">
                                        {selectedIcon === iconName && <Check className="h-4 w-4" />}
                                    </div>
                                    <DynamicIcon name={iconName} className="h-4 w-4" />
                                    <span>{iconName}</span>
                                </div>
                            ))
                        )}
                        
                        {/* Footer messages */}
                        {searchValue && filteredIcons.length === 50 && (
                            <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30">
                                Showing first 50 results. Try a more specific search.
                            </div>
                        )}
                        
                        {!searchValue && filteredIcons.length === 100 && (
                            <div className="px-3 py-2 text-xs text-muted-foreground border-t bg-muted/30">
                                Showing first 100 icons. Use search to find more.
                            </div>
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
