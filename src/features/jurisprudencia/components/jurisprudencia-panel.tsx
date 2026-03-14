'use client'

import { useState } from 'react'
import { Search, BookOpen, Scale, Filter } from 'lucide-react'

interface Jurisprudencia {
  id: string
  pais: 'MX' | 'PE'
  organo: string
  numeroTesis: string
  epoca: string
  rubro: string
  texto: string
  temas: string[]
  etapasAplicables: string[]
  relevancia: string
  fechaPublicacion: string
}

export default function JurisprudenciaPanel({ pais = 'MX' }: { pais?: string }) {
  const [consulta, setConsulta] = useState('')
  const [tema, setTema] = useState('')
  const [resultados, setResultados] = useState<Jurisprudencia[]>([])
  const [loading, setLoading] = useState(false)
  const [expandido, setExpandido] = useState<string | null>(null)

  const buscar = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (consulta) params.set('q', consulta)
      if (pais) params.set('pais', pais)
      if (tema) params.set('tema', tema)

      const res = await fetch(`/api/jurisprudencia?${params}`)
      const json = await res.json()
      setResultados(json.data?.jurisprudencia || [])
    } catch {
      console.error('Error buscando jurisprudencia')
    } finally {
      setLoading(false)
    }
  }

  const TEMAS_COMUNES = pais === 'PE'
    ? ['prisión preventiva', 'presunción de inocencia', 'prueba ilícita', 'tutela de derechos', 'control de plazo', 'terminación anticipada', 'crimen organizado']
    : ['flagrancia', 'prueba ilícita', 'presunción de inocencia', 'prisión preventiva', 'cadena de custodia', 'procedimiento abreviado', 'amparo', 'tortura']

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold">Jurisprudencia {pais === 'PE' ? 'Peruana' : 'Mexicana'}</h3>
      </div>

      {/* Búsqueda */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={consulta}
            onChange={e => setConsulta(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && buscar()}
            placeholder="Buscar jurisprudencia... ej: prisión preventiva, prueba ilícita"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={buscar}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* Filtros rápidos por tema */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <Filter className="w-4 h-4 text-gray-400 mt-1" />
        {TEMAS_COMUNES.map(t => (
          <button
            key={t}
            onClick={() => { setTema(t === tema ? '' : t); setConsulta(t); }}
            className={`px-2 py-0.5 rounded-full text-xs border ${
              tema === t
                ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Resultados */}
      {resultados.length > 0 ? (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {resultados.map(j => (
            <div
              key={j.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-600">{j.numeroTesis}</span>
                    <span className="text-xs text-gray-400">|</span>
                    <span className="text-xs text-gray-500">{j.organo}</span>
                  </div>
                  <h4
                    className="text-sm font-medium text-gray-900 cursor-pointer hover:text-indigo-600"
                    onClick={() => setExpandido(expandido === j.id ? null : j.id)}
                  >
                    {j.rubro}
                  </h4>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  j.pais === 'PE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                }`}>
                  {j.pais === 'PE' ? 'PE' : 'MX'}
                </span>
              </div>

              {expandido === j.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{j.texto}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {j.temas.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {j.epoca} | Publicado: {j.fechaPublicacion}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading && consulta ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No se encontró jurisprudencia. Intenta con otros términos.
        </p>
      ) : !loading ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Busca tesis, casaciones y precedentes relevantes para tu caso.
        </p>
      ) : null}
    </div>
  )
}
