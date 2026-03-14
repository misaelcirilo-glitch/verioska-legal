'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          password,
          nombre: formData.get('nombre'),
          apellidos: formData.get('apellidos'),
          cedulaProfesional: formData.get('cedulaProfesional') || undefined,
          telefono: formData.get('telefono') || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al registrarse')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-900">Crear Cuenta</h2>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="nombre" className="mb-1 block text-sm font-medium text-slate-700">Nombre</label>
          <input id="nombre" name="nombre" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="apellidos" className="mb-1 block text-sm font-medium text-slate-700">Apellidos</label>
          <input id="apellidos" name="apellidos" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input id="email" name="email" type="email" required className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="abogado@despacho.com" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
          <input id="password" name="password" type="password" required minLength={8} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">Confirmar</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="cedulaProfesional" className="mb-1 block text-sm font-medium text-slate-700">Cédula <span className="text-slate-400">(opcional)</span></label>
          <input id="cedulaProfesional" name="cedulaProfesional" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
        <div>
          <label htmlFor="telefono" className="mb-1 block text-sm font-medium text-slate-700">Teléfono <span className="text-slate-400">(opcional)</span></label>
          <input id="telefono" name="telefono" type="tel" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Registrando...' : 'Crear Cuenta'}
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
