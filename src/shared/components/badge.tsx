'use client'

interface BadgeProps {
  variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  children: React.ReactNode
}

const variantStyles: Record<BadgeProps['variant'], string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-slate-100 text-slate-700',
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}>
      {children}
    </span>
  )
}
