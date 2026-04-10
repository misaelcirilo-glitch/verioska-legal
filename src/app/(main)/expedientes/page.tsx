'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, Search, Loader2 } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { etapaLabels, etapaBadge } from '@/lib/paises/labels'

interface Expediente {
  id: string
  pais: string | null
  nuc: string | null
  carpeta_investigacion: string | null
  numero_carpeta_fiscal: string | null
  numero_expediente_judicial: string | null
  delito: string
  juzgado: string | null
  etapa_procesal: string
  estado: string
  materia: string | null
  updated_at: string
}

const MATERIAS = [
  { id: 'penal', label: 'Penal', color: 'bg-red-50 text-red-700 border-red-200' },
  { id: 'civil', label: 'Civil', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'laboral', label: 'Laboral', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'familia', label: 'Familia', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'constitucional', label: 'Constitucional', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'administrativo', label: 'Administrativo', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'comercial', label: 'Comercial', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'tributario', label: 'Tributario', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
]

export default function ExpedientesPage() {
  const [expedientes, setExpedientes] = useState<Expediente[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [materiaFiltro, setMateriaFiltro] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/expedientes')
      .then(r => r.json())
      .then(d => setExpedientes(d.data || []))
      .finally(() => setLoading(false))
  }, [])

  // Conteo por materia
  const conteoPorMateria = useMemo(() => {
    const m: Record<string, number> = { sin_clasificar: 0 }
    MATERIAS.forEach(mat => { m[mat.id] = 0 })
    expedientes.forEach(e => {
      const mat = e.materia || 'sin_clasificar'
      m[mat] = (m[mat] || 0) + 1
    })
    return m
  }, [expedientes])

  // Filtrado
  const filtrados = useMemo(() => {
    return expedientes.filter(e => {
      // Filtro materia
      if (materiaFiltro) {
        const mat = e.materia || 'sin_clasificar'
        if (mat !== materiaFiltro) return false
      }

      // Buscador: cualquier dígito en cualquier número de expediente
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const hay = [
          e.nuc, e.carpeta_investigacion, e.numero_carpeta_fiscal,
          e.numero_expediente_judicial, e.delito, e.juzgado,
        ].some(v => v?.toLowerCase().includes(q))
        if (!hay) return false
      }

      return true
    })
  }, [expedientes, busqueda, materiaFiltro])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expedientes</h1>
          <p className="text-sm text-slate-500">{expedientes.length} caso(s) registrado(s)</p>
        </div>
        <Link
          href="/expedientes/nuevo"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Expediente
        </Link>
      </div>

      {/* Bloques por materia */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        <button
          onClick={() => setMateriaFiltro(null)}
          className={`rounded-lg border-2 p-3 text-left transition-all ${
            !materiaFiltro ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <p className="text-xs font-medium text-slate-500">Todas</p>
          <p className="text-2xl font-bold text-slate-900">{expedientes.length}</p>
        </button>
        {MATERIAS.map(m => {
          const count = conteoPorMateria[m.id] || 0
          if (count === 0 && materiaFiltro !== m.id) return null
          return (
            <button
              key={m.id}
              onClick={() => setMateriaFiltro(materiaFiltro === m.id ? null : m.id)}
              className={`rounded-lg border-2 p-3 text-left transition-all ${
                materiaFiltro === m.id ? 'border-blue-500 bg-blue-50' : `${m.color.split(' ')[0]} border-transparent hover:border-slate-300`
              }`}
            >
              <p className="text-xs font-medium text-slate-600">{m.label}</p>
              <p className="text-2xl font-bold text-slate-900">{count}</p>
            </button>
          )
        })}
      </div>

      {/* Buscador */}
      <div className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por NUC, carpeta, número, delito, juzgado..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
      ) : expedientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white py-16">
          <FolderOpen className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Sin expedientes</p>
          <p className="mt-1 text-sm text-slate-400">Crea tu primer expediente para comenzar</p>
          <Link
            href="/expedientes/nuevo"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Crear Expediente
          </Link>
        </div>
      ) : filtrados.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Sin resultados para tu búsqueda.
        </p>
      ) : (
        <div className="space-y-3">
          {filtrados.map(exp => {
            const paisExp = exp.pais || 'MX'
            const matInfo = MATERIAS.find(m => m.id === exp.materia)
            return (
              <Link
                key={exp.id}
                href={`/expedientes/${exp.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm">{paisExp === 'PE' ? '🇵🇪' : '🇲🇽'}</span>
                      <h3 className="font-semibold text-slate-900">{exp.delito}</h3>
                      {matInfo && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${matInfo.color}`}>
                          {matInfo.label}
                        </span>
                      )}
                      <Badge variant={etapaBadge[exp.etapa_procesal] || 'neutral'}>
                        {etapaLabels[exp.etapa_procesal] || exp.etapa_procesal}
                      </Badge>
                      {exp.estado !== 'activo' && (
                        <Badge variant="neutral">{exp.estado}</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex gap-4 text-sm text-slate-500 flex-wrap">
                      {exp.nuc && <span>NUC: {exp.nuc}</span>}
                      {exp.carpeta_investigacion && <span>CI: {exp.carpeta_investigacion}</span>}
                      {exp.numero_carpeta_fiscal && <span>CF: {exp.numero_carpeta_fiscal}</span>}
                      {exp.numero_expediente_judicial && <span>Exp: {exp.numero_expediente_judicial}</span>}
                      {exp.juzgado && <span>{exp.juzgado}</span>}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400 shrink-0">
                    <p>{new Date(exp.updated_at).toLocaleDateString(paisExp === 'PE' ? 'es-PE' : 'es-MX')}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
