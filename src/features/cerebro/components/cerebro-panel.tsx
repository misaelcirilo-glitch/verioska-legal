'use client'

import { useState, useEffect, useRef } from 'react'
import { Brain, Send, User, Sparkles, BookOpen } from 'lucide-react'

interface Mensaje {
  id: string
  rol: 'user' | 'assistant'
  contenido: string
  fuentes?: { tipo: string; nombre: string }[]
  created_at: string
}

export default function CerebroPanel({ expedienteId }: { expedienteId: string }) {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    cargarHistorial()
  }, [expedienteId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes])

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/cerebro`)
      const json = await res.json()
      setMensajes(json.data?.mensajes || [])
    } catch {
      console.error('Error cargando historial')
    }
  }

  const enviar = async () => {
    if (!input.trim() || loading) return
    const texto = input.trim()
    setInput('')
    setLoading(true)

    // Agregar mensaje del usuario optimistamente
    const tempId = `temp-${Date.now()}`
    setMensajes(prev => [...prev, {
      id: tempId,
      rol: 'user',
      contenido: texto,
      created_at: new Date().toISOString(),
    }])

    try {
      const res = await fetch(`/api/expedientes/${expedienteId}/cerebro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: texto }),
      })
      const json = await res.json()

      if (json.data?.respuesta) {
        setMensajes(prev => [...prev, {
          id: `resp-${Date.now()}`,
          rol: 'assistant',
          contenido: json.data.respuesta,
          fuentes: json.data.fuentes,
          created_at: new Date().toISOString(),
        }])
      }
    } catch {
      setMensajes(prev => [...prev, {
        id: `err-${Date.now()}`,
        rol: 'assistant',
        contenido: 'Error al procesar tu consulta. Intenta de nuevo.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const SUGERENCIAS = [
    '¿Qué estrategia de defensa recomiendas para este caso?',
    '¿Hay plazos por vencer que deba atender?',
    '¿Qué jurisprudencia aplica a este delito?',
    '¿Cómo puedo explotar las contradicciones detectadas?',
    '¿Qué argumentos tengo para solicitar libertad?',
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Cerebro Verioska</h3>
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </div>
        <p className="text-xs text-indigo-200 mt-1">
          Asistente IA con contexto completo del expediente
        </p>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        className="h-[400px] overflow-y-auto p-4 space-y-4"
      >
        {mensajes.length === 0 && !loading ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 mb-4">
              Pregúntame sobre tu caso. Tengo acceso a documentos, contradicciones, estrategias, plazos y jurisprudencia.
            </p>
            <div className="space-y-2">
              {SUGERENCIAS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(s); }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-600 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          mensajes.map(m => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.rol === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.rol === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-indigo-600" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                m.rol === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {m.contenido}
                </div>
                {m.fuentes && m.fuentes.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200/50">
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                      <BookOpen className="w-3 h-3" /> Fuentes:
                    </p>
                    {m.fuentes.map((f, i) => (
                      <span key={i} className="inline-block text-xs bg-white/80 text-gray-600 px-1.5 py-0.5 rounded mr-1 mb-1">
                        {f.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {m.rol === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-600 animate-pulse" />
            </div>
            <div className="bg-gray-100 rounded-xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
            placeholder="Pregunta sobre tu caso..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            onClick={enviar}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
