'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Receipt } from 'lucide-react'

const CATEGORIAS = [
  { value: 'peritaje', label: 'Peritaje' },
  { value: 'copias', label: 'Copias certificadas' },
  { value: 'movilidad', label: 'Movilidad / Transporte' },
  { value: 'tasa_judicial', label: 'Tasa judicial' },
  { value: 'notarial', label: 'Notarial' },
  { value: 'otros', label: 'Otros' },
]

interface GastoItem {
  id: string
  concepto: string
  categoria: string | null
  monto: number
  moneda: string
  fecha_gasto: string
}

export function GastosPanel({ expedienteId, moneda = 'MXN' }: { expedienteId: string; moneda?: string }) {
  const router = useRouter()
  const [gastos, setGastos] = useState<GastoItem[]>([])
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const simbolo = moneda === 'PEN' ? 'S/' : '$'

  useEffect(() => {
    fetch(`/api/expedientes/${expedienteId}/gastos`)
      .then(r => r.json())
      .then(d => {
        setGastos(d.data || [])
        setTotal(d.totales?.total || 0)
      })
      .catch(() => {})
  }, [expedienteId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)

    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto: fd.get('concepto'),
          categoria: fd.get('categoria') || undefined,
          monto: parseFloat(fd.get('monto') as string),
          moneda,
          fechaGasto: fd.get('fechaGasto') || undefined,
          notas: fd.get('notas') || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.error || 'No se pudo registrar el gasto')
        return
      }

      setShowForm(false)
      router.refresh()
      // Re-fetch gastos
      const d = await (await fetch(`/api/expedientes/${expedienteId}/gastos`)).json()
      setGastos(d.data || [])
      setTotal(d.totales?.total || 0)
    } catch {
      setError('Error de conexión al registrar el gasto')
    } finally {
      setLoading(false)
    }
  }

  const categoriaLabel = (cat: string | null) =>
    CATEGORIAS.find(c => c.value === cat)?.label || cat || 'Sin categoría'

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Total: <span className="font-bold text-slate-900">{simbolo}{total.toFixed(2)}</span>
        </p>
      </div>

      {gastos.length > 0 && (
        <div className="mb-3 space-y-2">
          {gastos.map(g => (
            <div key={g.id} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2.5">
              <div>
                <p className="text-sm font-medium">{g.concepto}</p>
                <p className="text-xs text-slate-500">
                  {categoriaLabel(g.categoria)} · {new Date(g.fecha_gasto).toLocaleDateString()}
                </p>
              </div>
              <span className="text-sm font-semibold text-red-600">-{simbolo}{Number(g.monto).toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1 rounded bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
        >
          <Plus className="h-3 w-3" /> Registrar gasto
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Receipt className="h-4 w-4" /> Nuevo Gasto
            </span>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input name="concepto" placeholder="Concepto *" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <select name="categoria" className="rounded border border-slate-300 px-2 py-1.5 text-sm">
              <option value="">Categoría</option>
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input name="monto" type="number" step="0.01" min="0" placeholder="Monto *" required className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <input name="fechaGasto" type="date" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <input name="notas" placeholder="Notas (opcional)" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          {error && <p className="rounded bg-red-50 px-2 py-1.5 text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      )}
    </div>
  )
}
