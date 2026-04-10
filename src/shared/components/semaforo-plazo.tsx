'use client'

import { useEffect, useState } from 'react'

interface SemaforoPlazoProps {
  estado: 'activo' | 'proximo' | 'critico' | 'vencido' | 'cumplido' | 'cancelado'
  fechaLimite: string
  nombre: string
  fundamentoLegal?: string
}

const estadoConfig = {
  activo: { color: 'bg-green-500', bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'En tiempo' },
  proximo: { color: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Próximo' },
  critico: { color: 'bg-red-500 animate-pulse', bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'CRÍTICO' },
  vencido: { color: 'bg-red-800', bg: 'bg-red-50 border-red-300', text: 'text-red-800', label: 'VENCIDO' },
  cumplido: { color: 'bg-slate-400', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-500', label: 'Cumplido' },
  cancelado: { color: 'bg-slate-300', bg: 'bg-slate-50 border-slate-200', text: 'text-slate-400', label: 'Cancelado' },
}

function calcTiempoRestante(fechaLimite: string): string {
  const diff = new Date(fechaLimite).getTime() - Date.now()
  if (diff <= 0) return 'VENCIDO'

  const horas = Math.floor(diff / (1000 * 60 * 60))
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (horas >= 48) {
    const dias = Math.floor(horas / 24)
    const h = horas % 24
    return `${dias}d ${h}h`
  }
  return `${horas}h ${minutos}min`
}

function calcProgreso(fechaLimite: string): number {
  const limite = new Date(fechaLimite).getTime()
  const ahora = Date.now()
  const diff = limite - ahora
  if (diff <= 0) return 100
  const progreso = Math.max(0, Math.min(100, 100 - (diff / (diff * 2)) * 100))
  return progreso
}

export function SemaforoPlazo({ estado, fechaLimite, nombre, fundamentoLegal }: SemaforoPlazoProps) {
  const [tiempoRestante, setTiempoRestante] = useState(calcTiempoRestante(fechaLimite))
  const config = estadoConfig[estado]

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempoRestante(calcTiempoRestante(fechaLimite))
    }, 60000)
    return () => clearInterval(interval)
  }, [fechaLimite])

  return (
    <div className={`rounded-lg border p-4 ${config.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="pr-4 flex-1 min-w-0">
          <p className={`font-semibold text-sm ${config.text}`}>{nombre}</p>
          {fundamentoLegal && (
            <p className="text-xs text-slate-500 mt-1">{fundamentoLegal}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ${config.bg} ${config.text}`}>
            {config.label}
          </span>
          <p className={`text-lg font-bold mt-1 ${config.text}`}>{tiempoRestante}</p>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${config.color}`}
          style={{ width: `${estado === 'vencido' ? 100 : calcProgreso(fechaLimite)}%` }}
        />
      </div>
      <p className="mt-2 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
        Vence: {new Date(fechaLimite).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>
    </div>
  )
}
