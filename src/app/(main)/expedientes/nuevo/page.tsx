'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const etapasMX = [
  { value: 'investigacion_inicial', label: 'Investigación Inicial' },
  { value: 'investigacion_complementaria', label: 'Investigación Complementaria' },
  { value: 'intermedia', label: 'Intermedia' },
  { value: 'juicio_oral', label: 'Juicio Oral' },
  { value: 'ejecucion', label: 'Ejecución' },
  { value: 'amparo', label: 'Amparo' },
  { value: 'apelacion', label: 'Apelación' },
]

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
  const [pais, setPais] = useState<'MX' | 'PE'>('MX')

  const etapas = pais === 'PE' ? etapasPE : etapasMX

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)

    try {
      const body: Record<string, unknown> = {
        pais,
        delito: fd.get('delito'),
        juzgado: fd.get('juzgado') || undefined,
        distritoJudicial: fd.get('distritoJudicial') || undefined,
        fiscalia: fd.get('fiscalia') || undefined,
        etapaProcesal: fd.get('etapaProcesal'),
        fechaHechos: fd.get('fechaHechos') || undefined,
        fechaDetencion: fd.get('fechaDetencion') || undefined,
        notas: fd.get('notas') || undefined,
      }

      if (pais === 'MX') {
        body.nuc = fd.get('nuc') || undefined
        body.carpetaInvestigacion = fd.get('carpetaInvestigacion') || undefined
        body.causaPenal = fd.get('causaPenal') || undefined
        body.fechaPuestaDisposicion = fd.get('fechaPuestaDisposicion') || undefined
        body.duplicidadTermino = fd.get('duplicidadTermino') === 'on'
      } else {
        body.numeroCarpetaFiscal = fd.get('numeroCarpetaFiscal') || undefined
        body.numeroExpedienteJudicial = fd.get('numeroExpedienteJudicial') || undefined
        body.fechaDenuncia = fd.get('fechaDenuncia') || undefined
        body.fechaFormalizacion = fd.get('fechaFormalizacion') || undefined
        body.complejidad = fd.get('complejidad') || 'simple'
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
            duplicidadTermino: pais === 'MX' ? fd.get('duplicidadTermino') === 'on' : false,
            pais,
            complejidad: pais === 'PE' ? (fd.get('complejidad') || 'simple') : undefined,
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

  const inputClass = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelClass = 'mb-1 block text-sm font-medium text-slate-700'

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Nuevo Expediente</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selector de País */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Jurisdicción</h2>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setPais('MX')}
              className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                pais === 'MX'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">🇲🇽</span>
              <p className="mt-1 text-sm font-semibold">México</p>
              <p className="text-xs opacity-70">CNPP</p>
            </button>
            <button
              type="button"
              onClick={() => setPais('PE')}
              className={`flex-1 rounded-lg border-2 p-4 text-center transition-all ${
                pais === 'PE'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="text-2xl">🇵🇪</span>
              <p className="mt-1 text-sm font-semibold">Perú</p>
              <p className="text-xs opacity-70">NCPP</p>
            </button>
          </div>
        </div>

        {/* Datos del Caso */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Datos del Caso</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="delito" className={labelClass}>Delito *</label>
              <input id="delito" name="delito" required className={inputClass}
                placeholder={pais === 'PE' ? 'Ej: Robo agravado, Tráfico ilícito de drogas...' : 'Ej: Robo con violencia, Homicidio doloso...'} />
            </div>

            {pais === 'MX' ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="nuc" className={labelClass}>NUC</label>
                    <input id="nuc" name="nuc" className={inputClass} placeholder="Número Único de Causa" />
                  </div>
                  <div>
                    <label htmlFor="carpetaInvestigacion" className={labelClass}>Carpeta de Investigación</label>
                    <input id="carpetaInvestigacion" name="carpetaInvestigacion" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label htmlFor="causaPenal" className={labelClass}>Causa Penal</label>
                  <input id="causaPenal" name="causaPenal" className={inputClass} placeholder="Si ya fue judicializado" />
                </div>
              </>
            ) : (
              <>
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
                <div>
                  <label htmlFor="complejidad" className={labelClass}>Complejidad del caso</label>
                  <select id="complejidad" name="complejidad" className={inputClass} defaultValue="simple">
                    <option value="simple">Simple</option>
                    <option value="complejo">Complejo</option>
                    <option value="crimen_organizado">Criminalidad Organizada</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="etapaProcesal" className={labelClass}>Etapa Procesal *</label>
              <select id="etapaProcesal" name="etapaProcesal" className={inputClass}
                defaultValue={pais === 'PE' ? 'diligencias_preliminares' : 'investigacion_inicial'}
                key={pais}>
                {etapas.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Juzgado */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800">
            {pais === 'PE' ? 'Juzgado y Fiscalía' : 'Juzgado y Fiscalía'}
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="juzgado" className={labelClass}>
                  {pais === 'PE' ? 'Juzgado de Inv. Preparatoria' : 'Juzgado'}
                </label>
                <input id="juzgado" name="juzgado" className={inputClass} />
              </div>
              <div>
                <label htmlFor="distritoJudicial" className={labelClass}>Distrito Judicial</label>
                <input id="distritoJudicial" name="distritoJudicial" className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="fiscalia" className={labelClass}>
                {pais === 'PE' ? 'Fiscalía Provincial / Corporativa' : 'Fiscalía'}
              </label>
              <input id="fiscalia" name="fiscalia" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Fechas Clave */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Fechas Clave</h2>
          <p className="mb-3 text-xs text-slate-500">
            Si proporcionas la fecha de detención, el sistema calculará automáticamente los plazos
            {pais === 'PE' ? ' del NCPP' : ' constitucionales del CNPP'}.
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

            {pais === 'MX' ? (
              <>
                <div>
                  <label htmlFor="fechaPuestaDisposicion" className={labelClass}>Puesta a Disposición del MP</label>
                  <input id="fechaPuestaDisposicion" name="fechaPuestaDisposicion" type="datetime-local" className={inputClass} />
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-amber-50 p-3">
                  <input id="duplicidadTermino" name="duplicidadTermino" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600" />
                  <label htmlFor="duplicidadTermino" className="text-sm text-amber-800">
                    <span className="font-medium">Duplicidad de término</span> — Delincuencia organizada (48h→96h / 72h→144h)
                  </label>
                </div>
              </>
            ) : (
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
            )}
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
            {loading ? 'Creando...' : 'Crear Expediente'}
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
