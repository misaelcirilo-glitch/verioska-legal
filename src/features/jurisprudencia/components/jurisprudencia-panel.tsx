'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, BookOpen, Scale, Filter, Bookmark, BookmarkCheck, X, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

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
  const [showFiltros, setShowFiltros] = useState(false)
  const [filtroAnio, setFiltroAnio] = useState('')
  const [filtroOrgano, setFiltroOrgano] = useState('')
  const [filtroRelevancia, setFiltroRelevancia] = useState('')
  const [vista, setVista] = useState<'busqueda' | 'guardadas'>('busqueda')
  const [guardadasIds, setGuardadasIds] = useState<Set<string>>(new Set())
  const [guardadas, setGuardadas] = useState<Jurisprudencia[]>([])

  const cargarGuardadas = useCallback(async () => {
    const r = await fetch('/api/jurisprudencia/guardadas')
    const d = await r.json()
    const list: Jurisprudencia[] = d.data || []
    setGuardadas(list)
    setGuardadasIds(new Set(list.map(j => j.id)))
  }, [])

  useEffect(() => { cargarGuardadas() }, [cargarGuardadas])

  const buscar = async (override?: { consulta?: string; tema?: string }) => {
    setLoading(true)
    try {
      // Permite forzar valores (p. ej. desde un chip de tema) evitando el
      // estado obsoleto de React al encadenar setState + búsqueda.
      const q = override?.consulta !== undefined ? override.consulta : consulta
      const t = override?.tema !== undefined ? override.tema : tema
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (pais) params.set('pais', pais)
      if (t) params.set('tema', t)

      const res = await fetch(`/api/jurisprudencia?${params}`)
      const json = await res.json()
      let data: Jurisprudencia[] = json.data?.jurisprudencia || []

      if (filtroAnio) data = data.filter(j => j.fechaPublicacion.startsWith(filtroAnio))
      if (filtroOrgano) data = data.filter(j => j.organo.toLowerCase().includes(filtroOrgano.toLowerCase()))
      if (filtroRelevancia) data = data.filter(j => j.relevancia === filtroRelevancia)

      setResultados(data)
    } catch {
      console.error('Error buscando jurisprudencia')
    } finally {
      setLoading(false)
    }
  }

  // Carga inicial (y al cambiar de país): muestra el catálogo completo del país
  // ordenado por relevancia, en lugar de una pantalla vacía a la espera de una
  // búsqueda. Así el abogado siempre ve múltiples resultados de entrada.
  useEffect(() => {
    setConsulta('')
    setTema('')
    buscar({ consulta: '', tema: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pais])

  const toggleGuardar = async (j: Jurisprudencia) => {
    if (guardadasIds.has(j.id)) {
      await fetch(`/api/jurisprudencia/guardadas?id=${j.id}`, { method: 'DELETE' })
      setGuardadasIds(prev => {
        const next = new Set(prev)
        next.delete(j.id)
        return next
      })
      setGuardadas(prev => prev.filter(x => x.id !== j.id))
    } else {
      await fetch('/api/jurisprudencia/guardadas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jurisprudencia_id: j.id }),
      })
      setGuardadasIds(prev => new Set(prev).add(j.id))
      setGuardadas(prev => [j, ...prev])
    }
  }

  const TEMAS_COMUNES = pais === 'PE'
    ? ['prisión preventiva', 'presunción de inocencia', 'prueba ilícita', 'tutela de derechos', 'control de plazo', 'terminación anticipada', 'crimen organizado', 'colaboración eficaz', 'lavado de activos']
    : ['flagrancia', 'prueba ilícita', 'presunción de inocencia', 'prisión preventiva', 'cadena de custodia', 'procedimiento abreviado', 'amparo', 'tortura', 'delincuencia organizada']

  const ORGANOS_DISPONIBLES = pais === 'PE'
    ? ['Corte Suprema', 'Tribunal Constitucional', 'Pleno']
    : ['SCJN', 'TCC', 'Pleno']

  const lista = vista === 'guardadas' ? guardadas : resultados

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Jurisprudencia {pais === 'PE' ? 'Peruana' : 'Mexicana'}</h3>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setVista('busqueda')}
            className={`px-3 py-1 text-xs font-medium rounded ${vista === 'busqueda' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            Buscar
          </button>
          <button
            onClick={() => setVista('guardadas')}
            className={`px-3 py-1 text-xs font-medium rounded flex items-center gap-1 ${vista === 'guardadas' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          >
            <Bookmark size={12} /> Guardadas
            {guardadas.length > 0 && <span className="bg-indigo-100 text-indigo-700 px-1.5 rounded-full text-[10px] font-bold">{guardadas.length}</span>}
          </button>
        </div>
      </div>

      {vista === 'busqueda' && (
        <>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={consulta}
                onChange={e => setConsulta(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && buscar()}
                placeholder="Buscar... ej: prisión preventiva, prueba ilícita"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className={`px-3 py-2 border rounded-lg text-sm ${showFiltros ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={16} />
            </button>
            <button
              onClick={() => buscar()}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {showFiltros && (
            <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Año</label>
                <select value={filtroAnio} onChange={e => setFiltroAnio(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
                  <option value="">Todos</option>
                  {['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'].map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Órgano</label>
                <select value={filtroOrgano} onChange={e => setFiltroOrgano(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
                  <option value="">Todos</option>
                  {ORGANOS_DISPONIBLES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-gray-500">Relevancia</label>
                <select value={filtroRelevancia} onChange={e => setFiltroRelevancia(e.target.value)} className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white">
                  <option value="">Todas</option>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                </select>
              </div>
              {(filtroAnio || filtroOrgano || filtroRelevancia) && (
                <button
                  onClick={() => { setFiltroAnio(''); setFiltroOrgano(''); setFiltroRelevancia('') }}
                  className="col-span-3 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  <X size={12} /> Limpiar filtros
                </button>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            <Filter className="w-4 h-4 text-gray-400" />
            {TEMAS_COMUNES.map(t => (
              <button
                key={t}
                onClick={() => {
                  const nextTema = t === tema ? '' : t
                  setTema(nextTema)
                  setConsulta('')            // el chip filtra por TEMA, no por texto (evita el AND que dejaba 1 resultado)
                  buscar({ tema: nextTema, consulta: '' })
                }}
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
        </>
      )}

      {lista.length > 0 ? (
        <>
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span>
              {lista.length} {lista.length === 1 ? 'resultado' : 'resultados'}
              {vista === 'busqueda' && (consulta || tema) ? ' · más relevantes primero' : ''}
            </span>
          </div>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {lista.map(j => {
              const guardada = guardadasIds.has(j.id)
              const abierto = expandido === j.id
              return (
                <div
                  key={j.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Scale className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span className="text-xs font-medium text-indigo-600">{j.numeroTesis}</span>
                        <span className="text-xs text-gray-400">|</span>
                        <span className="text-xs text-gray-500">{j.organo}</span>
                        {j.relevancia === 'alta' && (
                          <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold uppercase">Relevante</span>
                        )}
                      </div>
                      {/* Al seleccionar el resultado se abre la resolución íntegra en
                          una pestaña nueva, sin perder el estado de la búsqueda. */}
                      <Link
                        href={`/jurisprudencia/${j.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-start gap-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
                        title="Abrir texto íntegro en una pestaña nueva"
                      >
                        <span>{j.rubro}</span>
                        <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setExpandido(abierto ? null : j.id)}
                        className="p-1.5 rounded text-gray-400 hover:bg-gray-100 hover:text-indigo-600"
                        title={abierto ? 'Ocultar vista previa' : 'Vista previa'}
                        aria-expanded={abierto}
                      >
                        {abierto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button
                        onClick={() => toggleGuardar(j)}
                        className={`p-1.5 rounded hover:bg-gray-100 ${guardada ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
                        title={guardada ? 'Quitar de guardadas' : 'Guardar'}
                      >
                        {guardada ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                      </button>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        j.pais === 'PE' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {j.pais === 'PE' ? 'PE' : 'MX'}
                      </span>
                    </div>
                  </div>

                  {abierto && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-700 leading-relaxed">{j.texto}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {j.temas.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                        <span>{j.epoca} | Publicado: {j.fechaPublicacion}</span>
                        <Link
                          href={`/jurisprudencia/${j.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Abrir resolución completa <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      ) : !loading && (consulta || tema) && vista === 'busqueda' ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No se encontró jurisprudencia. Intenta con otros términos.
        </p>
      ) : !loading && vista === 'busqueda' ? (
        <p className="text-sm text-gray-400 text-center py-4">
          Busca tesis, casaciones y precedentes relevantes para tu caso.
        </p>
      ) : !loading && vista === 'guardadas' && guardadas.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          Aún no has guardado jurisprudencia. Marca con el icono de marcador desde la búsqueda.
        </p>
      ) : null}
    </div>
  )
}
