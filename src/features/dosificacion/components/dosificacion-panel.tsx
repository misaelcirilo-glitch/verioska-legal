'use client'

import { useState, useEffect } from 'react'
import { Calculator, AlertTriangle, CheckCircle, Scale } from 'lucide-react'

interface RangoPena {
  delito: string
  pais: string
  codigoPenal: string
  articulo: string
  penaMinimaMeses: number
  penaMaximaMeses: number
  admiteSustitucion: boolean
  admiteAbreviado: boolean
  admiteAcuerdoReparatorio: boolean
  notas: string
}

interface Factor {
  factor: string
  tipo: string
  fundamento: string
  porcentaje: number
}

interface Resultado {
  delito: string
  penaBase: { minMeses: number; maxMeses: number }
  penaAjustada: { minMeses: number; maxMeses: number }
  penaSugeridaMeses: number
  conAbreviado?: { minMeses: number; maxMeses: number }
  multaEstimada?: string
  sustitucionPosible: boolean
  acuerdoReparatorioPosible: boolean
  fundamentoLegal: string
  notas: string[]
}

function formatearPena(meses: number): string {
  if (meses < 12) return `${meses} meses`
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  if (resto === 0) return `${anios} año${anios > 1 ? 's' : ''}`
  return `${anios} año${anios > 1 ? 's' : ''} ${resto} mes${resto > 1 ? 'es' : ''}`
}

export default function DosificacionPanel({ expedienteId, pais = 'MX' }: { expedienteId: string; pais?: string }) {
  const [delitos, setDelitos] = useState<RangoPena[]>([])
  const [factores, setFactores] = useState<{ agravantes: Factor[]; atenuantes: Factor[] }>({ agravantes: [], atenuantes: [] })
  const [delitoSeleccionado, setDelitoSeleccionado] = useState('')
  const [agravantesSeleccionados, setAgravantesSeleccionados] = useState<string[]>([])
  const [atenuantesSeleccionados, setAtenuantesSeleccionados] = useState<string[]>([])
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCatalogo, setLoadingCatalogo] = useState(true)

  useEffect(() => {
    cargarCatalogo()
  }, [expedienteId])

  const cargarCatalogo = async () => {
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/dosificacion?catalogo=1`)
      const json = await res.json()
      setDelitos(json.data?.delitos || [])
      setFactores(json.data?.factores || { agravantes: [], atenuantes: [] })
    } catch {
      console.error('Error cargando catálogo')
    } finally {
      setLoadingCatalogo(false)
    }
  }

  const calcular = async () => {
    if (!delitoSeleccionado) return
    setLoading(true)
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/dosificacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delitoNombre: delitoSeleccionado,
          agravantes: agravantesSeleccionados,
          atenuantes: atenuantesSeleccionados,
        }),
      })
      const json = await res.json()
      if (json.data?.resultado) {
        setResultado(json.data.resultado)
      }
    } catch {
      console.error('Error calculando dosificación')
    } finally {
      setLoading(false)
    }
  }

  const toggleFactor = (factor: string, lista: string[], setLista: (v: string[]) => void) => {
    setLista(lista.includes(factor) ? lista.filter(f => f !== factor) : [...lista, factor])
  }

  const delitoInfo = delitos.find(d => d.delito === delitoSeleccionado)

  if (loadingCatalogo) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm text-gray-500">Cargando catálogo de delitos...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Dosificación de Pena</h3>
        <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
          {pais === 'PE' ? 'Código Penal PE' : 'CPF'}
        </span>
      </div>

      {/* Selector de delito */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Delito</label>
        <select
          value={delitoSeleccionado}
          onChange={e => { setDelitoSeleccionado(e.target.value); setResultado(null) }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="">Seleccionar delito...</option>
          {delitos.map(d => (
            <option key={d.delito} value={d.delito}>
              {d.delito} ({d.articulo}) - {formatearPena(d.penaMinimaMeses)} a {formatearPena(d.penaMaximaMeses)}
            </option>
          ))}
        </select>
      </div>

      {/* Info del delito seleccionado */}
      {delitoInfo && (
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-sm text-orange-800">
            <strong>{delitoInfo.articulo}</strong> | Pena: {formatearPena(delitoInfo.penaMinimaMeses)} a {formatearPena(delitoInfo.penaMaximaMeses)}
          </p>
          <p className="text-xs text-orange-600 mt-1">{delitoInfo.notas}</p>
          <div className="flex gap-2 mt-2">
            {delitoInfo.admiteAbreviado && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Admite abreviado
              </span>
            )}
            {delitoInfo.admiteAcuerdoReparatorio && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Admite acuerdo reparatorio
              </span>
            )}
            {delitoInfo.admiteSustitucion && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                Posible sustitución
              </span>
            )}
          </div>
        </div>
      )}

      {delitoSeleccionado && (
        <>
          {/* Agravantes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agravantes ({agravantesSeleccionados.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {factores.agravantes.map(a => (
                <button
                  key={a.factor}
                  onClick={() => toggleFactor(a.factor, agravantesSeleccionados, setAgravantesSeleccionados)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    agravantesSeleccionados.includes(a.factor)
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50'
                  }`}
                  title={`${a.fundamento} (+${a.porcentaje}%)`}
                >
                  {a.factor} (+{a.porcentaje}%)
                </button>
              ))}
            </div>
          </div>

          {/* Atenuantes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Atenuantes ({atenuantesSeleccionados.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {factores.atenuantes.map(a => (
                <button
                  key={a.factor}
                  onClick={() => toggleFactor(a.factor, atenuantesSeleccionados, setAtenuantesSeleccionados)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    atenuantesSeleccionados.includes(a.factor)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50'
                  }`}
                  title={`${a.fundamento} (-${a.porcentaje}%)`}
                >
                  {a.factor} (-{a.porcentaje}%)
                </button>
              ))}
            </div>
          </div>

          {/* Botón calcular */}
          <button
            onClick={calcular}
            disabled={loading}
            className="w-full py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 mb-4"
          >
            {loading ? 'Calculando...' : 'Calcular dosificación'}
          </button>
        </>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-orange-600" />
            Resultado: {resultado.delito}
          </h4>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Pena base</p>
              <p className="text-sm font-semibold">{formatearPena(resultado.penaBase.minMeses)} - {formatearPena(resultado.penaBase.maxMeses)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-orange-200">
              <p className="text-xs text-gray-500 mb-1">Pena ajustada</p>
              <p className="text-sm font-semibold text-orange-700">{formatearPena(resultado.penaAjustada.minMeses)} - {formatearPena(resultado.penaAjustada.maxMeses)}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-3 border border-orange-300 mb-3">
            <p className="text-xs text-gray-500 mb-1">Pena sugerida (estimación)</p>
            <p className="text-lg font-bold text-orange-700">{formatearPena(resultado.penaSugeridaMeses)}</p>
          </div>

          {resultado.conAbreviado && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200 mb-3">
              <p className="text-xs text-green-600 mb-1">
                Con {pais === 'PE' ? 'terminación anticipada' : 'procedimiento abreviado'}
              </p>
              <p className="text-sm font-semibold text-green-700">
                {formatearPena(resultado.conAbreviado.minMeses)} - {formatearPena(resultado.conAbreviado.maxMeses)}
              </p>
            </div>
          )}

          {resultado.multaEstimada && (
            <p className="text-sm text-gray-600 mb-2">Multa estimada: {resultado.multaEstimada}</p>
          )}

          {/* Indicadores */}
          <div className="flex flex-wrap gap-2 mb-3">
            {resultado.sustitucionPosible && (
              <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> Sustitución posible
              </span>
            )}
            {resultado.acuerdoReparatorioPosible && (
              <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3" /> Acuerdo reparatorio posible
              </span>
            )}
          </div>

          {resultado.notas.length > 0 && (
            <div className="space-y-1">
              {resultado.notas.map((nota, i) => (
                <p key={i} className="text-xs text-gray-600 flex items-start gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  {nota}
                </p>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-3">
            Fundamento: {resultado.fundamentoLegal}. Esta es una estimación orientativa, no sustituye el análisis judicial.
          </p>
        </div>
      )}
    </div>
  )
}
