'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DISTRITOS_PERU } from '@/lib/catalogo-peru'

const etapasPE = [
  { value: 'diligencias_preliminares', label: 'Diligencias Preliminares' },
  { value: 'investigacion_preparatoria', label: 'Investigación Preparatoria' },
  { value: 'etapa_intermedia', label: 'Etapa Intermedia' },
  { value: 'juzgamiento', label: 'Juzgamiento' },
  { value: 'impugnacion', label: 'Impugnación' },
  { value: 'ejecucion', label: 'Ejecución' },
]

export default function NuevoExpedientePage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Cascading Dropdown State
  const [selectedDistrito, setSelectedDistrito] = useState<string>('')
  
  const distritoObj = DISTRITOS_PERU.find(d => d.id === selectedDistrito)
  const juzgadosOpciones = distritoObj ? distritoObj.juzgados : []
  const fiscaliasOpciones = distritoObj ? distritoObj.fiscalias : []

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    try {
      const body: Record<string, unknown> = {
        pais: 'PE',
        delito: fd.get('delito'),
        distritoJudicial: fd.get('distritoJudicial') || undefined,
        juzgado: fd.get('juzgado') || undefined,
        fiscalia: fd.get('fiscalia') || undefined,
        etapaProcesal: fd.get('etapaProcesal'),
        numeroCarpetaFiscal: fd.get('numeroCarpetaFiscal') || undefined,
        numeroExpedienteJudicial: fd.get('numeroExpedienteJudicial') || undefined,
        fechaHechos: fd.get('fechaHechos') || undefined,
        fechaDetencion: fd.get('fechaDetencion') || undefined,
        fechaDenuncia: fd.get('fechaDenuncia') || undefined,
        fechaFormalizacion: fd.get('fechaFormalizacion') || undefined,
        complejidad: fd.get('complejidad') || 'simple',
        notas: fd.get('notas') || undefined,
      }

      const res = await fetch('/api/expedientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al crear expediente')
        return
      }

      // Auto-generate plazos if fecha de detención is provided
      if (fd.get('fechaDetencion') && data.data?.id) {
        await fetch(`/api/expedientes/${data.data.id}/plazos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            autogenerar: true,
            fechaDetencion: fd.get('fechaDetencion'),
            pais: 'PE',
            complejidad: fd.get('complejidad') || 'simple',
          }),
        })
      }

      router.push(`/expedientes/${data.data.id}`)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white'
  const labelClass = 'mb-1 block text-sm font-medium text-slate-700'

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Nuevo Expediente (Perú)</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos del Caso */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Datos del Caso</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="delito" className={labelClass}>Delito *</label>
              <input id="delito" name="delito" required className={inputClass}
                placeholder="Ej: Robo agravado, Tráfico ilícito de drogas..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="numeroCarpetaFiscal" className={labelClass}>Carpeta Fiscal</label>
                <input id="numeroCarpetaFiscal" name="numeroCarpetaFiscal" className={inputClass} placeholder="N° de carpeta fiscal" />
              </div>
              <div>
                <label htmlFor="numeroExpedienteJudicial" className={labelClass}>Expediente Judicial</label>
                <input id="numeroExpedienteJudicial" name="numeroExpedienteJudicial" className={inputClass} placeholder="N° expediente judicial" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="etapaProcesal" className={labelClass}>Etapa Procesal *</label>
                <select id="etapaProcesal" name="etapaProcesal" className={inputClass} defaultValue="diligencias_preliminares">
                  {etapasPE.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="complejidad" className={labelClass}>Complejidad del caso</label>
                <select id="complejidad" name="complejidad" className={inputClass} defaultValue="simple">
                  <option value="simple">Simple</option>
                  <option value="complejo">Complejo</option>
                  <option value="crimen_organizado">Criminalidad Organizada</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Juzgado - Cascada */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Ubicación Judicial (Cascada)</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="distritoJudicial" className={labelClass}>Distrito Judicial</label>
              <select 
                id="distritoJudicial" 
                name="distritoJudicial" 
                className={inputClass}
                value={selectedDistrito}
                onChange={(e) => setSelectedDistrito(e.target.value)}
              >
                <option value="">Seleccione Distrito...</option>
                {DISTRITOS_PERU.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="juzgado" className={labelClass}>Juzgado de Inv. Preparatoria</label>
                <select id="juzgado" name="juzgado" className={inputClass} disabled={!selectedDistrito}>
                  <option value="">Seleccione Juzgado...</option>
                  {juzgadosOpciones.map((juz, i) => (
                    <option key={i} value={juz}>{juz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="fiscalia" className={labelClass}>Fiscalía Provincial / Corporativa</label>
                <select id="fiscalia" name="fiscalia" className={inputClass} disabled={!selectedDistrito}>
                  <option value="">Seleccione Fiscalía...</option>
                  {fiscaliasOpciones.map((fisc, i) => (
                    <option key={i} value={fisc}>{fisc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Fechas Clave */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Fechas Clave</h2>
          <p className="mb-3 text-xs text-slate-500">
            Los plazos se calcularán en base al Código Procesal Penal (NCPP).
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fechaHechos" className={labelClass}>Fecha de Hechos</label>
                <input id="fechaHechos" name="fechaHechos" type="datetime-local" className={inputClass} />
              </div>
              <div>
                <label htmlFor="fechaDetencion" className={labelClass}>Fecha de Detención</label>
                <input id="fechaDetencion" name="fechaDetencion" type="datetime-local" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="fechaDenuncia" className={labelClass}>Fecha de Denuncia</label>
                <input id="fechaDenuncia" name="fechaDenuncia" type="datetime-local" className={inputClass} />
              </div>
              <div>
                <label htmlFor="fechaFormalizacion" className={labelClass}>Formalización de Inv. Preparatoria</label>
                <input id="fechaFormalizacion" name="fechaFormalizacion" type="datetime-local" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <label htmlFor="notas" className={labelClass}>Notas</label>
          <textarea id="notas" name="notas" rows={3} className={inputClass} placeholder="Observaciones generales del caso..." />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Consultando IA...' : 'Crear Expediente'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
