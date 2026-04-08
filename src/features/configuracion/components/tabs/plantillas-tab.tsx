'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, Plus, FileText, Edit2, Trash2, X } from 'lucide-react'

interface Plantilla {
  id: string
  nombre: string
  categoria: string
  descripcion: string | null
  contenido: string
  variables: string[]
  creado_por_nombre?: string
}

const CATEGORIAS = [
  { v: 'escrito', label: 'Escrito' },
  { v: 'demanda', label: 'Demanda' },
  { v: 'contestacion', label: 'Contestación' },
  { v: 'recurso', label: 'Recurso' },
  { v: 'otro', label: 'Otro' },
]

const VARIABLES_DISPONIBLES = ['cliente', 'expediente_numero', 'juzgado', 'fecha', 'abogado', 'monto']

export function PlantillasTab() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Plantilla | null>(null)
  const [form, setForm] = useState({ nombre: '', categoria: 'escrito', descripcion: '', contenido: '', variables: [] as string[] })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/configuracion/plantillas')
    const d = await r.json()
    setPlantillas(d.data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const startNew = () => {
    setEditing(null)
    setForm({ nombre: '', categoria: 'escrito', descripcion: '', contenido: '', variables: [] })
    setShowForm(true)
  }

  const startEdit = (p: Plantilla) => {
    setEditing(p)
    setForm({
      nombre: p.nombre,
      categoria: p.categoria,
      descripcion: p.descripcion || '',
      contenido: p.contenido,
      variables: p.variables || [],
    })
    setShowForm(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const url = editing ? `/api/configuracion/plantillas/${editing.id}` : '/api/configuracion/plantillas'
    const method = editing ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowForm(false)
    setSaving(false)
    load()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta plantilla?')) return
    await fetch(`/api/configuracion/plantillas/${id}`, { method: 'DELETE' })
    load()
  }

  const toggleVar = (v: string) => {
    setForm(p => ({
      ...p,
      variables: p.variables.includes(v) ? p.variables.filter(x => x !== v) : [...p.variables, v]
    }))
  }

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Plantillas del despacho</h2>
        <button
          onClick={startNew}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Nueva plantilla
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="mb-6 space-y-4 rounded-lg border border-blue-200 bg-blue-50/50 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">{editing ? 'Editar plantilla' : 'Nueva plantilla'}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Nombre</label>
              <input
                type="text" required value={form.nombre}
                onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Categoría</label>
              <select
                value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CATEGORIAS.map(c => <option key={c.v} value={c.v}>{c.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Descripción</label>
            <input
              type="text" value={form.descripcion}
              onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Variables disponibles</label>
            <p className="mb-2 text-xs text-slate-500">Marca las variables que usarás. Insértalas en el contenido como <code className="rounded bg-slate-100 px-1">{'{{variable}}'}</code></p>
            <div className="flex flex-wrap gap-2">
              {VARIABLES_DISPONIBLES.map(v => (
                <button
                  key={v} type="button"
                  onClick={() => toggleVar(v)}
                  className={`rounded-md border px-2 py-1 text-xs font-medium ${form.variables.includes(v) ? 'border-blue-500 bg-blue-100 text-blue-700' : 'border-slate-300 bg-white text-slate-600'}`}
                >
                  {`{{${v}}}`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Contenido</label>
            <textarea
              required value={form.contenido}
              onChange={e => setForm(p => ({ ...p, contenido: e.target.value }))}
              rows={10}
              placeholder="SEÑOR JUEZ DEL {{juzgado}}...&#10;&#10;{{cliente}}, identificado con DNI..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear plantilla'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {plantillas.length === 0 && !showForm ? (
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Aún no hay plantillas</p>
          <p className="mt-1 text-sm text-slate-400">Crea modelos de escritos legales reutilizables con campos rellenables.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {plantillas.map(p => (
            <div key={p.id} className="flex items-start justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-slate-400" />
                  <p className="font-medium text-slate-800">{p.nombre}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{CATEGORIAS.find(c => c.v === p.categoria)?.label}</span>
                </div>
                {p.descripcion && <p className="mt-1 text-sm text-slate-500">{p.descripcion}</p>}
                {p.variables?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.variables.map(v => <span key={v} className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">{`{{${v}}}`}</span>)}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(p)} className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600"><Edit2 size={15} /></button>
                <button onClick={() => handleDelete(p.id)} className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
