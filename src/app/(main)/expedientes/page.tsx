import { query } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FolderOpen } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { etapaLabels, etapaBadge } from '@/lib/paises/labels'

export default async function ExpedientesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const expedientes = await query<{
    id: string
    pais: string | null
    nuc: string | null
    carpeta_investigacion: string | null
    numero_carpeta_fiscal: string | null
    numero_expediente_judicial: string | null
    delito: string
    juzgado: string | null
    etapa_procesal: string
    estado: string
    fecha_detencion: string | null
    created_at: string
    updated_at: string
  }>(
    'SELECT * FROM expedientes WHERE user_id = $1 ORDER BY updated_at DESC',
    [session.userId]
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expedientes</h1>
          <p className="text-sm text-slate-500">{expedientes.length} caso(s) registrado(s)</p>
        </div>
        <Link
          href="/expedientes/nuevo"
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nuevo Expediente
        </Link>
      </div>

      {expedientes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white py-16">
          <FolderOpen className="mb-4 h-12 w-12 text-slate-300" />
          <p className="text-lg font-medium text-slate-500">Sin expedientes</p>
          <p className="mt-1 text-sm text-slate-400">Crea tu primer expediente para comenzar</p>
          <Link
            href="/expedientes/nuevo"
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Crear Expediente
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {expedientes.map(exp => {
            const paisExp = exp.pais || 'MX'
            return (
              <Link
                key={exp.id}
                href={`/expedientes/${exp.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm">{paisExp === 'PE' ? '🇵🇪' : '🇲🇽'}</span>
                      <h3 className="font-semibold text-slate-900">{exp.delito}</h3>
                      <Badge variant={etapaBadge[exp.etapa_procesal] || 'neutral'}>
                        {etapaLabels[exp.etapa_procesal] || exp.etapa_procesal}
                      </Badge>
                      {exp.estado !== 'activo' && (
                        <Badge variant="neutral">{exp.estado}</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex gap-4 text-sm text-slate-500">
                      {exp.nuc && <span>NUC: {exp.nuc}</span>}
                      {exp.carpeta_investigacion && <span>CI: {exp.carpeta_investigacion}</span>}
                      {exp.numero_carpeta_fiscal && <span>CF: {exp.numero_carpeta_fiscal}</span>}
                      {exp.numero_expediente_judicial && <span>Exp: {exp.numero_expediente_judicial}</span>}
                      {exp.juzgado && <span>{exp.juzgado}</span>}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    <p>{new Date(exp.updated_at).toLocaleDateString(paisExp === 'PE' ? 'es-PE' : 'es-MX')}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
