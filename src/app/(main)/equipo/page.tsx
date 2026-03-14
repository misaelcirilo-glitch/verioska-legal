'use client'

import { useEffect, useState } from 'react'
import { EquipoPanel } from '@/features/equipo/components/equipo-panel'

export default function EquipoPage() {
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.data) setUserId(d.data.id) })
      .catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <EquipoPanel currentUserId={userId} />
    </div>
  )
}
