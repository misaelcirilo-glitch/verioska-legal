import { type LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'red' | 'yellow' | 'green'
}

const colorStyles = {
  blue: 'text-[#bdc8d3]',
  red: 'text-[#ffb4ab]',
  yellow: 'text-[#e9c176]',
  green: 'text-[#8cd69b]',
}

const iconBg = {
  blue: 'bg-[rgba(189,200,211,0.1)] border-[rgba(189,200,211,0.2)] text-[#bdc8d3]',
  red: 'bg-[rgba(255,180,171,0.1)] border-[rgba(255,180,171,0.2)] text-[#ffb4ab]',
  yellow: 'bg-[rgba(233,193,118,0.1)] border-[rgba(233,193,118,0.2)] text-[#e9c176]',
  green: 'bg-[rgba(140,214,155,0.1)] border-[rgba(140,214,155,0.2)] text-[#8cd69b]',
}

export function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className={`rounded-2xl border border-[rgba(69,70,77,0.15)] bg-[#131b2e] p-6 shadow-[0_20px_40px_rgba(6,14,32,0.4)] transition-all hover:bg-[#1f283d] relative overflow-hidden`}>
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent opacity-50 rounded-bl-[100px] pointer-events-none" />
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-[0.8rem] uppercase tracking-wider font-semibold text-[#8a94a2]">{title}</p>
          <p className={`mt-3 text-4xl font-extrabold tracking-tight ${colorStyles[color]}`}>{value}</p>
        </div>
        <div className={`rounded-xl border p-3 ${iconBg[color]}`}>
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}
