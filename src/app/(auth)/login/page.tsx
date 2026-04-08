'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-lg border border-[rgba(69,70,77,0.3)] bg-[#060e20] text-[#dae2fd] px-3 py-2.5 text-sm focus:border-[#e9c176] focus:outline-none focus:ring-1 focus:ring-[#e9c176] placeholder:text-[#45464d] transition-all"
  const labelClass = "mb-1 block text-[0.8rem] uppercase tracking-wider font-semibold text-[#8a94a2]"

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-[#dae2fd]">Iniciar Sesión</h2>

      {error && (
        <div className="rounded-lg bg-[rgba(147,0,10,0.2)] border border-[rgba(147,0,10,0.5)] p-3 text-sm text-[#ffb4ab]">{error}</div>
      )}

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className={inputClass}
          placeholder="abogado@despacho.com"
        />
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={inputClass}
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-[#172033] to-[#131b2e] border border-[rgba(233,193,118,0.3)] px-4 py-3 text-sm font-bold text-[#e9c176] hover:bg-gradient-to-r hover:from-[#1a243a] hover:to-[#172033] hover:shadow-[0_0_15px_rgba(233,193,118,0.2)] disabled:opacity-50 transition-all uppercase tracking-widest"
      >
        {loading ? 'Ingresando...' : 'Entrar'}
      </button>

      <p className="text-center text-[0.8rem] text-[#8a94a2] mt-4">
        ¿No tienes cuenta?{' '}
        <Link href="/signup" className="font-semibold text-[#e9c176] hover:text-white transition-colors">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
