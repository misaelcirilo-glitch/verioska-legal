'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, FolderOpen, User, CalendarDays, Loader2 } from 'lucide-react'

interface Resultado {
  id: string
  _type: string
  [key: string]: unknown
}

export function BuscadorGlobal() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ expedientes: Resultado[]; clientes: Resultado[]; audiencias: Resultado[] }>({ expedientes: [], clientes: [], audiencias: [] })
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Atajo Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  // Buscar con debounce
  useEffect(() => {
    if (query.length < 2) { setResults({ expedientes: [], clientes: [], audiencias: [] }); return }
    setLoading(true)
    const t = setTimeout(() => {
      fetch(`/api/buscar?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(d => setResults(d.data || { expedientes: [], clientes: [], audiencias: [] }))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const navigate = (path: string) => {
    setOpen(false)
    setQuery('')
    router.push(path)
  }

  const total = results.expedientes.length + results.clientes.length + results.audiencias.length

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-500 hover:border-slate-400 hover:bg-slate-50 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Buscar...</span>
        <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 sm:inline">Ctrl+K</kbd>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center border-b border-slate-200 px-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar expedientes, clientes, audiencias..."
            className="flex-1 border-0 bg-transparent px-3 py-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
          <button onClick={() => setOpen(false)} className="ml-2 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-80 overflow-y-auto p-2">
          {query.length < 2 ? (
            <p className="py-8 text-center text-xs text-slate-400">Escribe al menos 2 caracteres para buscar</p>
          ) : !loading && total === 0 ? (
            <p className="py-8 text-center text-xs text-slate-400">Sin resultados para "{query}"</p>
          ) : (
            <>
              {results.expedientes.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase text-slate-400">Expedientes</p>
                  {results.expedientes.map(e => (
                    <button
                      key={e.id}
                      onClick={() => navigate(`/expedientes/${e.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                    >
                      <FolderOpen className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{String(e.delito)}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {[e.numero_carpeta_fiscal, e.numero_expediente_judicial, e.nuc, e.juzgado].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      {e.materia ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 capitalize shrink-0">{String(e.materia)}</span> : null}
                    </button>
                  ))}
                </div>
              )}

              {results.clientes.length > 0 && (
                <div className="mb-2">
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase text-slate-400">Clientes</p>
                  {results.clientes.map(c => (
                    <button
                      key={c.id}
                      onClick={() => navigate(`/clientes/${c.id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-green-50 transition-colors"
                    >
                      <User className="h-4 w-4 text-green-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{String(c.nombre)} {String(c.apellidos || '')}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {[c.numero_documento, c.telefono, c.email].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.audiencias.length > 0 && (
                <div>
                  <p className="mb-1 px-2 text-[10px] font-bold uppercase text-slate-400">Audiencias</p>
                  {results.audiencias.map(a => (
                    <button
                      key={a.id}
                      onClick={() => navigate(`/expedientes/${a.expediente_id}`)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-purple-50 transition-colors"
                    >
                      <CalendarDays className="h-4 w-4 text-purple-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{String(a.tipo_audiencia)}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {String(a.delito)} · {a.fecha_programada ? new Date(String(a.fecha_programada)).toLocaleDateString('es-PE') : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400">
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1">ESC</kbd> para cerrar · <kbd className="rounded border border-slate-200 bg-slate-50 px-1">Ctrl+K</kbd> para abrir
        </div>
      </div>
    </div>
  )
}
