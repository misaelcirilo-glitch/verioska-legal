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

  const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400 transition-all"
  const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-xl font-bold text-slate-900">Crear cuenta</h2>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nombre" className={labelClass}>Nombre</label>
          <input id="nombre" name="nombre" required className={inputClass} placeholder="Juan" />
        </div>
        <div>
          <label htmlFor="apellidos" className={labelClass}>Apellidos</label>
          <input id="apellidos" name="apellidos" required className={inputClass} placeholder="Pérez García" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" required className={inputClass} placeholder="abogado@despacho.com" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="password" className={labelClass}>Contraseña</label>
          <input id="password" name="password" type="password" required minLength={8} className={inputClass} placeholder="Mínimo 8 caracteres" />
        </div>
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>Confirmar</label>
          <input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} className={inputClass} placeholder="Repetir contraseña" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="cedulaProfesional" className={labelClass}>Cédula <span className="text-slate-400 font-normal lowercase">(opcional)</span></label>
          <input id="cedulaProfesional" name="cedulaProfesional" className={inputClass} />
        </div>
        <div>
          <label htmlFor="telefono" className={labelClass}>Teléfono <span className="text-slate-400 font-normal lowercase">(opcional)</span></label>
          <input id="telefono" name="telefono" type="tel" className={inputClass} placeholder="678080701" />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

      <p className="text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-800 transition-colors">Inicia sesión</Link>
      </p>
    </form>
  )
}
