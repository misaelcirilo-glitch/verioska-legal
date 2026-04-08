'use client'

import { useState, useEffect } from 'react'
import { Loader2, FileText, HardDrive } from 'lucide-react'

interface Stats {
  used_bytes: number
  limit_bytes: number
  percent: number
  total_files: number
  top_files: Array<{ id: string; nombre_archivo: string; tamano_bytes: number; tipo_archivo: string; numero_expediente: string }>
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
}

export function AlmacenamientoTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/configuracion/almacenamiento')
      .then(r => r.json())
      .then(d => setStats(d.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
  }

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-slate-800">Almacenamiento</h2>

      {/* Barra de uso */}
      <div className="mb-6 rounded-lg border border-slate-200 p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive size={18} className="text-slate-400" />
            <p className="font-medium text-slate-700">{formatBytes(stats.used_bytes)} usados de {formatBytes(stats.limit_bytes)}</p>
          </div>
          <span className={`text-sm font-bold ${stats.percent > 80 ? 'text-red-600' : stats.percent > 50 ? 'text-amber-600' : 'text-slate-600'}`}>
            {stats.percent}%
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-2.5 rounded-full transition-all ${stats.percent > 80 ? 'bg-red-600' : stats.percent > 50 ? 'bg-amber-500' : 'bg-blue-600'}`}
            style={{ width: `${Math.min(stats.percent, 100)}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">{stats.total_files} archivos en total</p>
      </div>

      {/* Top archivos */}
      <div className="rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 px-5 py-3">
          <h3 className="font-medium text-slate-800">Archivos más pesados</h3>
          <p className="text-xs text-slate-500">Los 10 documentos que ocupan más espacio</p>
        </div>
        {stats.top_files.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">Sin archivos aún</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.top_files.map(f => (
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
        )}
      </div>
    </div>
  )
}
