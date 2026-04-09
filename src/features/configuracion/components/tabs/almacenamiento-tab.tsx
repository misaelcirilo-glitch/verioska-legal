'use client'

import { useState, useEffect } from 'react'
import { Loader2, FileText, HardDrive, Crown, Check, AlertCircle } from 'lucide-react'

interface Stats {
  used_bytes: number
  limit_bytes: number
  percent: number
  total_files: number
  top_files: Array<{ id: string; nombre_archivo: string; tamano_bytes: number; tipo_archivo: string; numero_expediente: string }>
}

const PLANES = [
  {
    id: 'free',
    nombre: 'Free',
    almacenamiento_gb: 1,
    precio: 0,
    features: ['Hasta 3 expedientes', '1 GB de almacenamiento', '1 usuario', 'Soporte por email'],
  },
  {
    id: 'pro',
    nombre: 'Pro',
    almacenamiento_gb: 25,
    precio: 49,
    features: ['Expedientes ilimitados', '25 GB de almacenamiento', 'Hasta 5 usuarios', 'Cerebro Verioska IA', 'Soporte prioritario'],
    recomendado: true,
  },
  {
    id: 'enterprise',
    nombre: 'Enterprise',
    almacenamiento_gb: 100,
    precio: 149,
    features: ['Expedientes ilimitados', '100 GB de almacenamiento', 'Usuarios ilimitados', 'IA avanzada + integraciones', 'Soporte 24/7'],
  },
]

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export function AlmacenamientoTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [planActual] = useState('free')

  const cargar = () => {
    setLoading(true)
    setError('')
    fetch('/api/configuracion/almacenamiento')
      .then(async r => {
        if (!r.ok) throw new Error('No se pudo cargar')
        return r.json()
      })
      .then(d => {
        if (d.error) throw new Error(d.error)
        setStats(d.data || { used_bytes: 0, limit_bytes: 1024 * 1024 * 1024, percent: 0, total_files: 0, top_files: [] })
      })
      .catch(e => {
        setError(e.message)
        setStats({ used_bytes: 0, limit_bytes: 1024 * 1024 * 1024, percent: 0, total_files: 0, top_files: [] })
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
  }

  const data = stats || { used_bytes: 0, limit_bytes: 1024 * 1024 * 1024, percent: 0, total_files: 0, top_files: [] }
  const percent = Math.min(data.percent || 0, 100)

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-slate-800">Plan y almacenamiento</h2>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          <AlertCircle size={16} /> {error}. Reintentar:
          <button onClick={cargar} className="ml-2 font-bold underline">recargar</button>
        </div>
      )}

      {/* Plan actual */}
      <div className="mb-6 rounded-lg border-2 border-blue-200 bg-blue-50/50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-blue-600" />
            <div>
              <p className="font-semibold text-slate-800">Tu plan actual: <span className="text-blue-700">Free</span></p>
              <p className="text-xs text-slate-500">3 expedientes · 1 GB · 1 usuario</p>
            </div>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Mejorar plan
          </button>
        </div>
      </div>

      {/* Barra de uso */}
      <div className="mb-6 rounded-lg border border-slate-200 p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-slate-400" />
            <p className="font-medium text-slate-700">
              {formatBytes(data.used_bytes)} usados de {formatBytes(data.limit_bytes)}
            </p>
          </div>
          <span className={`text-sm font-bold ${percent > 80 ? 'text-red-600' : percent > 50 ? 'text-amber-600' : 'text-slate-600'}`}>
            {percent.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-2.5 rounded-full transition-all ${percent > 80 ? 'bg-red-600' : percent > 50 ? 'bg-amber-500' : 'bg-blue-600'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">{data.total_files} archivos en total</p>
      </div>

      {/* Top archivos */}
      {data.top_files.length > 0 && (
        <div className="mb-6 rounded-lg border border-slate-200">
          <div className="border-b border-slate-200 px-5 py-3">
            <h3 className="font-medium text-slate-800">Archivos más pesados</h3>
            <p className="text-xs text-slate-500">Los documentos que ocupan más espacio</p>
          </div>
          <div className="divide-y divide-slate-100">
            {data.top_files.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                <FileText size={16} className="shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">{f.nombre_archivo}</p>
                  <p className="text-xs text-slate-400">Exp. {f.numero_expediente} · {f.tipo_archivo}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-slate-600">{formatBytes(Number(f.tamano_bytes || 0))}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planes disponibles */}
      <div>
        <h3 className="mb-4 text-base font-semibold text-slate-800">Planes disponibles</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANES.map(p => {
            const esActual = p.id === planActual
            return (
              <div
                key={p.id}
                className={`relative rounded-xl border-2 p-5 ${
                  esActual
                    ? 'border-blue-500 bg-blue-50/30'
                    : p.recomendado
                    ? 'border-slate-200 ring-2 ring-blue-100'
                    : 'border-slate-200'
                }`}
              >
                {p.recomendado && !esActual && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
                    RECOMENDADO
                  </span>
                )}
                {esActual && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
                    PLAN ACTUAL
                  </span>
                )}
                <h4 className="text-lg font-bold text-slate-800">{p.nombre}</h4>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-black text-slate-900">${p.precio}</span>
                  <span className="text-sm text-slate-500">/mes</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check size={14} className="mt-0.5 shrink-0 text-green-600" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {!esActual && (
                  <button className={`w-full rounded-lg py-2 text-sm font-medium ${
                    p.recomendado
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}>
                    Elegir {p.nombre}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
