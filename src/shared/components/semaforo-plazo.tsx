'use client'

import { useEffect, useState } from 'react'

interface SemaforoPlazoProps {
  estado: 'activo' | 'proximo' | 'critico' | 'vencido' | 'cumplido' | 'cancelado'
  fechaLimite: string
  nombre: string
  fundamentoLegal?: string
}

const estadoConfig = {
  activo: { color: 'bg-green-400', bgLight: 'bg-[rgba(140,214,155,0.1)] border-[rgba(140,214,155,0.2)]', text: 'text-[#8cd69b]', label: 'En tiempo' },
  proximo: { color: 'bg-[#e9c176]', bgLight: 'bg-[rgba(233,193,118,0.1)] border-[rgba(233,193,118,0.2)]', text: 'text-[#e9c176]', label: 'Próximo' },
  critico: { color: 'bg-[#ffb4ab] animate-pulse shadow-[0_0_15px_rgba(255,180,171,0.3)]', bgLight: 'bg-[rgba(255,180,171,0.1)] border-[rgba(255,180,171,0.3)]', text: 'text-[#ffb4ab]', label: 'CRÍTICO' },
  vencido: { color: 'bg-[#93000a]', bgLight: 'bg-[rgba(147,0,10,0.2)] border-[rgba(147,0,10,0.5)]', text: 'text-[#ffb4ab]', label: 'VENCIDO' },
  cumplido: { color: 'bg-[#bdc8d3]', bgLight: 'bg-[#060e20] border-white/5', text: 'text-[#c6c6cd]', label: 'Cumplido' },
  cancelado: { color: 'bg-[#45464d]', bgLight: 'bg-[#060e20] border-white/5', text: 'text-[#78828d]', label: 'Cancelado' },
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
    <div className={`rounded-xl border p-5 ${config.bgLight}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="pr-4">
          <p className={`font-semibold tracking-wide ${config.text}`}>{nombre}</p>
          {fundamentoLegal && (
            <p className="text-xs text-[#78828d] mt-1.5 leading-relaxed">{fundamentoLegal}</p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[0.7rem] uppercase tracking-wider font-bold border ${config.bgLight} ${config.text}`}>
            {config.label}
          </span>
          <p className={`text-xl font-bold tracking-tight ${config.text} mt-2`}>{tiempoRestante}</p>
        </div>
      </div>
      <div className="h-1.5 w-full rounded-full bg-[#060e20] overflow-hidden mt-2">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-in-out ${config.color}`}
          style={{ width: `${estado === 'vencido' ? 100 : calcProgreso(fechaLimite)}%` }}
        />
      </div>
      <p className="mt-3 text-[0.7rem] font-medium text-[#78828d] uppercase tracking-widest">
        Vence: {new Date(fechaLimite).toLocaleString('es-MX', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })}
      </p>
    </div>
  )
}
