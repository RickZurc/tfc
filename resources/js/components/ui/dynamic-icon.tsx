import React from 'react'
import { LucideProps, HelpCircle } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface DynamicIconProps extends Omit<LucideProps, 'name'> {
  name: string | null
}

export function DynamicIcon({ name, ...props }: DynamicIconProps) {
  if (!name) {
    return <HelpCircle {...props} />
  }

  // Get the icon component from the LucideIcons namespace
  const IconComponent = (LucideIcons as any)[name]
  
  if (!IconComponent) {
    return <HelpCircle {...props} />
  }

  return <IconComponent {...props} />
}
