'use client'

import { useEffect, useState } from 'react'

interface SemaforoPlazoProps {
  estado: 'activo' | 'proximo' | 'critico' | 'vencido' | 'cumplido' | 'cancelado'
  fechaLimite: string
  nombre: string
  fundamentoLegal?: string
}

const estadoConfig = {
  activo: { color: 'bg-green-500', bgLight: 'bg-green-50', text: 'text-green-700', label: 'En tiempo' },
  proximo: { color: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-700', label: 'Próximo' },
  critico: { color: 'bg-red-500 animate-pulse', bgLight: 'bg-red-50', text: 'text-red-700', label: 'CRÍTICO' },
  vencido: { color: 'bg-red-700', bgLight: 'bg-red-50', text: 'text-red-800', label: 'VENCIDO' },
  cumplido: { color: 'bg-slate-400', bgLight: 'bg-slate-50', text: 'text-slate-600', label: 'Cumplido' },
  cancelado: { color: 'bg-slate-300', bgLight: 'bg-slate-50', text: 'text-slate-500', label: 'Cancelado' },
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

  // Estimamos duración total como el doble del tiempo restante (simplificación visual)
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
    <div className={`rounded-lg border p-4 ${config.bgLight}`}>
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className={`font-semibold ${config.text}`}>{nombre}</p>
          {fundamentoLegal && (
            <p className="text-xs text-slate-500">{fundamentoLegal}</p>
          )}
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${config.text} ${config.bgLight}`}>
            {config.label}
          </span>
          <p className={`text-lg font-bold ${config.text} mt-1`}>{tiempoRestante}</p>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${config.color}`}
          style={{ width: `${estado === 'vencido' ? 100 : calcProgreso(fechaLimite)}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Vence: {new Date(fechaLimite).toLocaleString('es-MX', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>
    </div>
  )
}
