import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'red' | 'yellow' | 'green'
}

const colorStyles = {
  blue: 'bg-blue-50 text-blue-600',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-amber-50 text-amber-600',
  green: 'bg-green-50 text-green-600',
}

const iconBg = {
  blue: 'bg-blue-100',
  red: 'bg-red-100',
  yellow: 'bg-amber-100',
  green: 'bg-green-100',
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className={`mt-1 text-3xl font-bold ${colorStyles[color].split(' ')[1]}`}>{value}</p>
        </div>
        <div className={`rounded-lg p-3 ${iconBg[color]}`}>
          <Icon className={`h-6 w-6 ${colorStyles[color].split(' ')[1]}`} />
        </div>
      </div>
    </div>
  )
}
