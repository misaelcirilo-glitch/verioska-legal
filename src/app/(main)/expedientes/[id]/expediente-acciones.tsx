'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Archive, Trash2, X } from 'lucide-react'
import { etapaLabels } from '@/lib/paises/labels'

const MATERIAS = ['penal', 'civil', 'laboral', 'familia', 'constitucional', 'administrativo', 'comercial', 'tributario']
const ESTADOS = ['activo', 'archivado', 'cerrado']

interface ExpedienteData {
  id: string
  delito: string
  materia: string | null
  juzgado: string | null
  distrito_judicial: string | null
  fiscalia: string | null
  etapa_procesal: string
  estado: string
  notas: string | null
}

export function ExpedienteAcciones({ expediente, rol }: { expediente: ExpedienteData; rol: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canEdit = rol === 'admin' || rol === 'abogado'
  const isAdmin = rol === 'admin'
  const etapaOpciones = Object.entries(etapaLabels)

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    try {
      const res = await fetch(`/api/expedientes/${expediente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delito: fd.get('delito'),
          materia: fd.get('materia') || null,
          juzgado: fd.get('juzgado') || null,
          distritoJudicial: fd.get('distritoJudicial') || null,
          fiscalia: fd.get('fiscalia') || null,
          etapaProcesal: fd.get('etapaProcesal'),
          estado: fd.get('estado'),
          notas: fd.get('notas') || null,
        }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error || 'No se pudo guardar')
        return
      }
      setEditing(false)
      router.refresh()
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  async function archivar() {
    if (!confirm('¿Archivar este expediente? Podrás encontrarlo filtrando por estado "archivado".')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/expedientes/${expediente.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'archivado' }),
      })
      if (res.ok) router.push('/expedientes')
      else { const j = await res.json().catch(() => ({})); alert(j.error || 'No se pudo archivar') }
    } finally {
      setLoading(false)
    }
  }

  async function eliminar() {
    if (!confirm('⚠️ Eliminar PERMANENTEMENTE este expediente y sus datos asociados. Esta acción no se puede deshacer. ¿Continuar?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/expedientes/${expediente.id}`, { method: 'DELETE' })
      if (res.ok) router.push('/expedientes')
      else { const j = await res.json().catch(() => ({})); alert(j.error || 'No se pudo eliminar') }
    } finally {
      setLoading(false)
    }
  }

  if (!canEdit) return null

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar
        </button>
        <button
          onClick={archivar}
          disabled={loading}
          className="inline-flex items-center gap-1 rounded border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
        >
          <Archive className="h-3.5 w-3.5" /> Archivar
        </button>
        {isAdmin && (
          <button
            onClick={eliminar}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Eliminar
          </button>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setEditing(false)}>
          <form
            onSubmit={guardar}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Editar expediente</h3>
              <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Delito / Materia del caso *</label>
                <input name="delito" required defaultValue={expediente.delito} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Materia</label>
                  <select name="materia" defaultValue={expediente.materia || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm">
                    <option value="">—</option>
                    {MATERIAS.map(m => <option key={m} value={m} className="capitalize">{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Estado</label>
                  <select name="estado" defaultValue={expediente.estado} className="w-full rounded border border-slate-300 px-3 py-2 text-sm capitalize">
                    {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Etapa procesal</label>
                <select name="etapaProcesal" defaultValue={expediente.etapa_procesal} className="w-full rounded border border-slate-300 px-3 py-2 text-sm">
                  {!etapaOpciones.some(([k]) => k === expediente.etapa_procesal) && (
                    <option value={expediente.etapa_procesal}>{expediente.etapa_procesal}</option>
                  )}
                  {etapaOpciones.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Juzgado</label>
                <input name="juzgado" defaultValue={expediente.juzgado || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Distrito judicial</label>
                  <input name="distritoJudicial" defaultValue={expediente.distrito_judicial || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Fiscalía</label>
                  <input name="fiscalia" defaultValue={expediente.fiscalia || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Notas</label>
                <textarea name="notas" rows={3} defaultValue={expediente.notas || ''} className="w-full rounded border border-slate-300 px-3 py-2 text-sm" />
              </div>
              {error && <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="rounded border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
