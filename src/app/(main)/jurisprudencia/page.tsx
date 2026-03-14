'use client'

import { useState } from 'react'
import JurisprudenciaPanel from '@/features/jurisprudencia/components/jurisprudencia-panel'

export default function JurisprudenciaPage() {
  const [pais, setPais] = useState<'MX' | 'PE'>('MX')

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Jurisprudencia</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPais('MX')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pais === 'MX'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🇲🇽 México
          </button>
          <button
            onClick={() => setPais('PE')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              pais === 'PE'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            🇵🇪 Perú
          </button>
        </div>
      </div>
      <JurisprudenciaPanel pais={pais} />
    </div>
  )
}
