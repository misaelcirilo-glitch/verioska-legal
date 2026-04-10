import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'red' | 'yellow' | 'green'
}

const colorStyles = {
  blue: 'text-blue-700',
  red: 'text-red-700',
  yellow: 'text-amber-700',
  green: 'text-green-700',
}

const iconBg = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <p className={`mt-2 text-3xl font-bold ${colorStyles[color]}`}>{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${iconBg[color]}`}>
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}
