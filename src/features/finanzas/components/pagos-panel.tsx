'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, DollarSign, CheckCircle } from 'lucide-react'
import { etapaLabels } from '@/lib/paises/labels'

const METODOS_PAGO_MX = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'deposito', label: 'Depósito' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' },
]

const METODOS_PAGO_PE = [
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'yape', label: 'Yape' },
  { value: 'plin', label: 'Plin' },
  { value: 'deposito', label: 'Depósito' },
  { value: 'tarjeta', label: 'Tarjeta' },
  { value: 'otro', label: 'Otro' },
]

interface PagoItem {
  id: string
  concepto: string
  monto: number
  moneda: string
  metodo_pago: string | null
  etapa_procesal: string | null
  estado: string
  fecha_pago: string | null
  created_at: string
}

export function PagosPanel({ expedienteId, pais = 'MX', moneda = 'MXN' }: { expedienteId: string; pais?: string; moneda?: string }) {
  const router = useRouter()
  const [pagos, setPagos] = useState<PagoItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const metodosPago = pais === 'PE' ? METODOS_PAGO_PE : METODOS_PAGO_MX
  const simbolo = moneda === 'PEN' ? 'S/' : '$'

  useEffect(() => {
    fetch(`/api/expedientes/${expedienteId}/pagos`)
      .then(r => r.json())
      .then(d => setPagos(d.data || []))
      .catch(() => {})
  }, [expedienteId])

  const totalPagado = pagos.filter(p => p.estado === 'pagado').reduce((sum, p) => sum + Number(p.monto), 0)
  const totalPendiente = pagos.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + Number(p.monto), 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const fd = new FormData(e.currentTarget)

    const res = await fetch(`/api/expedientes/${expedienteId}/pagos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monto: parseFloat(fd.get('monto') as string),
        moneda,
        concepto: fd.get('concepto'),
        etapaProcesal: fd.get('etapaProcesal') || undefined,
        metodoPago: fd.get('metodoPago') || undefined,
        estado: fd.get('estado') || 'pendiente',
        fechaVencimiento: fd.get('fechaVencimiento') || undefined,
        fechaPago: fd.get('fechaPago') || undefined,
        notas: fd.get('notas') || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Error al guardar')
      setLoading(false)
      return
    }

    setShowForm(false)
    setLoading(false)
    router.refresh()
    const d = await (await fetch(`/api/expedientes/${expedienteId}/pagos`)).json()
    setPagos(d.data || [])
  }

  const estadoColor: Record<string, string> = {
    pagado: 'text-green-700 bg-green-50',
    pendiente: 'text-amber-700 bg-amber-50',
    vencido: 'text-red-700 bg-red-50',
    parcial: 'text-blue-700 bg-blue-50',
    cancelado: 'text-slate-500 bg-slate-50',
  }

  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs">
        <span className="text-green-700">Pagado: <b>{simbolo}{totalPagado.toFixed(2)}</b></span>
        <span className="text-amber-700">Pendiente: <b>{simbolo}{totalPendiente.toFixed(2)}</b></span>
      </div>

      {pagos.length > 0 && (
        <div className="mb-3 space-y-2">
          {pagos.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2.5">
              <div>
                <p className="text-sm font-medium">{p.concepto}</p>
                <p className="text-xs text-slate-500">
                  {p.etapa_procesal ? (etapaLabels[p.etapa_procesal] || p.etapa_procesal) + ' · ' : ''}
                  {p.metodo_pago || 'Sin método'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold">{simbolo}{Number(p.monto).toFixed(2)}</span>
                <span className={`ml-2 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${estadoColor[p.estado] || ''}`}>
                  {p.estado === 'pagado' && <CheckCircle className="inline h-3 w-3 mr-0.5" />}
                  {p.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1 rounded bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
        >
          <Plus className="h-3 w-3" /> Registrar pago
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2 rounded border border-green-200 bg-green-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" /> Nuevo Pago
            </span>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <input name="concepto" placeholder="Concepto *" required className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input name="monto" type="number" step="0.01" min="0" placeholder="Monto *" required className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
            <select name="metodoPago" className="rounded border border-slate-300 px-2 py-1.5 text-sm">
              <option value="">Método de pago</option>
              {metodosPago.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select name="estado" className="rounded border border-slate-300 px-2 py-1.5 text-sm">
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="parcial">Parcial</option>
            </select>
            <input name="fechaPago" type="date" className="rounded border border-slate-300 px-2 py-1.5 text-sm" />
          </div>
          <input name="notas" placeholder="Notas (opcional)" className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm" />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Registrar'}
          </button>
        </form>
      )}
    </div>
  )
}
