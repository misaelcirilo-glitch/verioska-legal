'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Target, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface Parte {
  id: string
  nombre: string
  apellidos: string
  tipo: string
}

interface Pregunta {
  orden: number
  pregunta: string
  tipoPregunta: string
  proposito: string
  nota?: string
}

interface Plan {
  tipo: string
  objetivo: string
  tecnica: string
  tecnicaDescripcion: string
  preguntas: Pregunta[]
  recomendaciones: string[]
  fundamentoLegal: string
}

interface InterrogatorioGuardado {
  id: string
  tipo: string
  objetivo: string
  tecnica: string
  preguntas: string | Pregunta[]
  parte_nombre: string
  parte_apellidos: string
  parte_tipo: string
  created_at: string
}

const TIPO_LABELS: Record<string, string> = {
  examen_directo: 'Examen Directo',
  contraexamen: 'Contraexamen',
  reexamen: 'Re-examen',
}

const TIPO_PREGUNTA_BADGE: Record<string, { bg: string; text: string }> = {
  abierta: { bg: 'bg-blue-100', text: 'text-blue-700' },
  cerrada: { bg: 'bg-gray-100', text: 'text-gray-700' },
  sugestiva: { bg: 'bg-amber-100', text: 'text-amber-700' },
  de_control: { bg: 'bg-purple-100', text: 'text-purple-700' },
  de_transicion: { bg: 'bg-green-100', text: 'text-green-700' },
}

export default function InterrogatorioPanel({ expedienteId }: { expedienteId: string }) {
  const [partes, setPartes] = useState<Parte[]>([])
  const [parteId, setParteId] = useState('')
  const [tipo, setTipo] = useState<'examen_directo' | 'contraexamen' | 'reexamen'>('contraexamen')
  const [plan, setPlan] = useState<Plan | null>(null)
  const [guardados, setGuardados] = useState<InterrogatorioGuardado[]>([])
  const [loading, setLoading] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)

  useEffect(() => {
    cargarPartes()
    cargarGuardados()
  }, [expedienteId])

  const cargarPartes = async () => {
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/partes`)
      const json = await res.json()
      setPartes(json.data || [])
    } catch {
      console.error('Error cargando partes')
    }
  }

  const cargarGuardados = async () => {
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/interrogatorio`)
      const json = await res.json()
      setGuardados(json.data?.interrogatorios || [])
    } catch {
      console.error('Error cargando interrogatorios')
    }
  }

  const generar = async () => {
    if (!parteId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/interrogatorio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parteId, tipo }),
      })
      const json = await res.json()
      if (json.data?.plan) {
        setPlan(json.data.plan)
        cargarGuardados()
      }
    } catch {
      console.error('Error generando interrogatorio')
    } finally {
      setLoading(false)
    }
  }

  const parsePreguntas = (preguntas: string | Pregunta[]): Pregunta[] => {
    if (typeof preguntas === 'string') {
      try { return JSON.parse(preguntas) } catch { return [] }
    }
    return preguntas
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-violet-600" />
        <h3 className="text-lg font-semibold">Interrogatorio</h3>
      </div>

      {/* Configuración */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parte a interrogar</label>
          <select
            value={parteId}
            onChange={e => setParteId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">Seleccionar...</option>
            {partes.map(p => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellidos} ({p.tipo})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value as typeof tipo)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="examen_directo">Examen Directo</option>
            <option value="contraexamen">Contraexamen</option>
            <option value="reexamen">Re-examen</option>
          </select>
        </div>
      </div>

      <button
        onClick={generar}
        disabled={loading || !parteId}
        className="w-full py-2.5 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Generando plan...' : 'Generar plan de interrogatorio'}
      </button>

      {/* Plan generado */}
      {plan && (
        <div className="border border-violet-200 rounded-lg p-4 bg-violet-50/50 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-violet-600" />
            <h4 className="font-semibold text-gray-900">{TIPO_LABELS[plan.tipo] || plan.tipo}</h4>
          </div>
          <p className="text-sm text-gray-700 mb-2">{plan.objetivo}</p>
          <p className="text-xs text-violet-600 mb-3">
            <strong>Técnica:</strong> {plan.tecnica} — {plan.tecnicaDescripcion}
          </p>

          {/* Preguntas */}
          <div className="space-y-2 mb-4">
            {plan.preguntas.map(p => (
              <div key={p.orden} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-bold text-violet-600 bg-violet-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {p.orden}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 font-medium">{p.pregunta}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        TIPO_PREGUNTA_BADGE[p.tipoPregunta]?.bg || 'bg-gray-100'
                      } ${TIPO_PREGUNTA_BADGE[p.tipoPregunta]?.text || 'text-gray-600'}`}>
                        {p.tipoPregunta}
                      </span>
                      <span className="text-xs text-gray-500">{p.proposito}</span>
                    </div>
                    {p.nota && (
                      <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {p.nota}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recomendaciones */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <p className="text-xs font-semibold text-amber-800 mb-1">Recomendaciones:</p>
            <ul className="text-xs text-amber-700 space-y-1">
              {plan.recomendaciones.map((r, i) => (
                <li key={i}>• {r}</li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-gray-400 mt-2">Fundamento: {plan.fundamentoLegal}</p>
        </div>
      )}

      {/* Historial de interrogatorios guardados */}
      {guardados.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Planes anteriores ({guardados.length})</h4>
          <div className="space-y-2">
            {guardados.map(g => (
              <div key={g.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandido(expandido === g.id ? null : g.id)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50"
                >
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {TIPO_LABELS[g.tipo] || g.tipo} — {g.parte_nombre} {g.parte_apellidos}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(g.created_at).toLocaleDateString('es')}
                    </span>
                  </div>
                  {expandido === g.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {expandido === g.id && (
                  <div className="px-3 pb-3 space-y-1">
                    <p className="text-xs text-gray-600 mb-2">{g.objetivo}</p>
                    {parsePreguntas(g.preguntas).map(p => (
                      <div key={p.orden} className="text-xs text-gray-700 pl-4">
                        <strong>{p.orden}.</strong> {p.pregunta}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {partes.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-2">
          Agrega partes al expediente para generar planes de interrogatorio.
        </p>
      )}
    </div>
  )
}
