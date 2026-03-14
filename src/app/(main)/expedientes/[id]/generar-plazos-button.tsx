'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'

interface Props {
  expedienteId: string
  fechaDetencion: string
  duplicidadTermino: boolean
}

export function GenerarPlazosButton({ expedienteId, fechaDetencion, duplicidadTermino }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      await fetch(`/api/expedientes/${expedienteId}/plazos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autogenerar: true,
          fechaDetencion,
          duplicidadTermino,
        }),
      })
      router.refresh()
    } catch {
      alert('Error al generar plazos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
    >
      <Clock className="h-4 w-4" />
      {loading ? 'Generando...' : 'Generar Plazos Automáticos'}
    </button>
  )
}
