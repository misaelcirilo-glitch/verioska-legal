import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Calendar, Users, FolderOpen, MessageSquare, AlertTriangle, Lightbulb, FileText, Search, DollarSign, Receipt, BookOpen, Calculator, Brain } from 'lucide-react'
import { Badge } from '@/shared/components/badge'
import { SemaforoPlazo } from '@/shared/components/semaforo-plazo'
import { GenerarPlazosButton } from './generar-plazos-button'
import { AgregarParteForm } from './agregar-parte-form'
import { AgregarAudienciaForm } from './agregar-audiencia-form'
import { AgregarPlazoForm } from './agregar-plazo-form'
import { UploadDocumentoForm } from '@/features/documentos/components/upload-documento-form'
import { DocumentosList } from '@/features/documentos/components/documentos-list'
import { TimelineView } from '@/features/cronologia/components/timeline-view'
import { ContradiccionesPanel } from '@/features/contradicciones/components/contradicciones-panel'
import { AgregarDeclaracionForm } from '@/features/contradicciones/components/agregar-declaracion-form'
import { EstrategiaPanel } from '@/features/estrategia/components/estrategia-panel'
import { EscritosPanel } from '@/features/escritos/components/escritos-panel'
import { ConsultaExpediente } from '@/features/rag/components/consulta-expediente'
import { etapaLabels, tipoAudienciaLabels, tipoParteLabels } from '@/lib/paises/labels'
import { GastosPanel } from '@/features/finanzas/components/gastos-panel'
import { PagosPanel } from '@/features/finanzas/components/pagos-panel'
import JurisprudenciaPanel from '@/features/jurisprudencia/components/jurisprudencia-panel'
import DosificacionPanel from '@/features/dosificacion/components/dosificacion-panel'
import InterrogatorioPanel from '@/features/interrogatorio/components/interrogatorio-panel'
import CerebroPanel from '@/features/cerebro/components/cerebro-panel'

export default async function ExpedienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params

  const expediente = await queryOne<{
    id: string
    pais: string | null
    nuc: string | null
    carpeta_investigacion: string | null
    causa_penal: string | null
    numero_carpeta_fiscal: string | null
    numero_expediente_judicial: string | null
    delito: string
    juzgado: string | null
    distrito_judicial: string | null
    fiscalia: string | null
    etapa_procesal: string
    fecha_hechos: string | null
    fecha_detencion: string | null
    fecha_puesta_disposicion: string | null
    fecha_formulacion: string | null
    fecha_vinculacion: string | null
    fecha_denuncia: string | null
    fecha_formalizacion: string | null
    complejidad: string | null
    duplicidad_termino: boolean
    estado: string
    notas: string | null
    created_at: string
  }>(
    'SELECT * FROM expedientes WHERE id = $1 AND user_id = $2',
    [id, session.userId]
  )

  if (!expediente) notFound()

  const pais = expediente.pais || 'MX'

  const [plazos, audiencias, partes, documentos] = await Promise.all([
    query<{
      id: string; tipo_plazo: string; fundamento_legal: string | null
      fecha_limite: string; estado: string; horas_totales: number | null
    }>(
      "SELECT * FROM plazos WHERE expediente_id = $1 AND estado != 'cancelado' ORDER BY fecha_limite ASC",
      [id]
    ),
    query<{
      id: string; tipo_audiencia: string; fecha_programada: string
      sala: string | null; juzgado: string | null; estado: string
    }>(
      'SELECT * FROM audiencias WHERE expediente_id = $1 ORDER BY fecha_programada ASC',
      [id]
    ),
    query<{
      id: string; tipo: string; nombre: string; apellidos: string | null
    }>(
      'SELECT * FROM partes WHERE expediente_id = $1 ORDER BY created_at',
      [id]
    ),
    query<{
      id: string; nombre_archivo: string; tipo_archivo: string
      tipo_documento: string | null; etapa_procesal: string | null
      tamano_bytes: number | null; procesado: boolean
      texto_extraido: string | null; created_at: string
    }>(
      'SELECT id, nombre_archivo, tipo_archivo, tipo_documento, etapa_procesal, tamano_bytes, procesado, texto_extraido, created_at FROM documentos WHERE expediente_id = $1 ORDER BY created_at DESC',
      [id]
    ),
  ])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/expedientes" className="mb-2 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Expedientes
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xl">{pais === 'PE' ? '🇵🇪' : '🇲🇽'}</span>
          <h1 className="text-2xl font-bold text-slate-900">{expediente.delito}</h1>
          <Badge variant={expediente.estado === 'activo' ? 'success' : 'neutral'}>
            {expediente.estado}
          </Badge>
          <Badge variant="info">{etapaLabels[expediente.etapa_procesal] || expediente.etapa_procesal}</Badge>
        </div>
        <div className="mt-1 flex gap-4 text-sm text-slate-500">
          {expediente.nuc && <span>NUC: {expediente.nuc}</span>}
          {expediente.carpeta_investigacion && <span>CI: {expediente.carpeta_investigacion}</span>}
          {expediente.causa_penal && <span>Causa: {expediente.causa_penal}</span>}
          {expediente.numero_carpeta_fiscal && <span>Carpeta Fiscal: {expediente.numero_carpeta_fiscal}</span>}
          {expediente.numero_expediente_judicial && <span>Exp. Judicial: {expediente.numero_expediente_judicial}</span>}
        </div>
      </div>

      {/* Documentos */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-amber-500" /> Documentos de la Carpeta
          <span className="text-xs font-normal text-slate-400">({documentos.length})</span>
        </h2>
        <DocumentosList
          expedienteId={id}
          documentos={documentos.map(d => ({
            id: d.id,
            nombreArchivo: d.nombre_archivo,
            tipoArchivo: d.tipo_archivo,
            tipoDocumento: d.tipo_documento,
            etapaProcesal: d.etapa_procesal,
            tamanoBytes: d.tamano_bytes,
            procesado: d.procesado,
            textoExtraido: d.texto_extraido,
            createdAt: d.created_at,
          }))}
        />
        <UploadDocumentoForm expedienteId={id} etapaActual={expediente.etapa_procesal} />
      </div>

      {/* Cronología Procesal */}
      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="h-5 w-5 text-indigo-500" /> Cronología Procesal
        </h2>
        <TimelineView expedienteId={id} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info General */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800">Información General</h2>
          <dl className="space-y-3 text-sm">
            {expediente.juzgado && (
              <div><dt className="text-slate-500">Juzgado</dt><dd className="font-medium">{expediente.juzgado}</dd></div>
            )}
            {expediente.distrito_judicial && (
              <div><dt className="text-slate-500">Distrito Judicial</dt><dd className="font-medium">{expediente.distrito_judicial}</dd></div>
            )}
            {expediente.fiscalia && (
              <div><dt className="text-slate-500">Fiscalía</dt><dd className="font-medium">{expediente.fiscalia}</dd></div>
            )}
            {expediente.fecha_detencion && (
              <div><dt className="text-slate-500">Fecha de Detención</dt><dd className="font-medium">{new Date(expediente.fecha_detencion).toLocaleString(pais === 'PE' ? 'es-PE' : 'es-MX')}</dd></div>
            )}
            {expediente.fecha_hechos && (
              <div><dt className="text-slate-500">Fecha de Hechos</dt><dd className="font-medium">{new Date(expediente.fecha_hechos).toLocaleString(pais === 'PE' ? 'es-PE' : 'es-MX')}</dd></div>
            )}
            {expediente.fecha_denuncia && (
              <div><dt className="text-slate-500">Fecha de Denuncia</dt><dd className="font-medium">{new Date(expediente.fecha_denuncia).toLocaleString('es-PE')}</dd></div>
            )}
            {expediente.fecha_formalizacion && (
              <div><dt className="text-slate-500">Formalización Inv. Preparatoria</dt><dd className="font-medium">{new Date(expediente.fecha_formalizacion).toLocaleString('es-PE')}</dd></div>
            )}
            {expediente.complejidad && pais === 'PE' && (
              <div><dt className="text-slate-500">Complejidad</dt><dd className="font-medium capitalize">{expediente.complejidad.replace('_', ' ')}</dd></div>
            )}
            {expediente.duplicidad_termino && pais === 'MX' && (
              <div className="rounded bg-amber-50 p-2 text-amber-800 font-medium">Duplicidad de Término Activa</div>
            )}
            {expediente.notas && (
              <div><dt className="text-slate-500">Notas</dt><dd className="text-slate-700">{expediente.notas}</dd></div>
            )}
          </dl>
        </div>

        {/* Plazos */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-500" /> Plazos Activos
            </h2>
          </div>
          {plazos.length === 0 ? (
            <div>
              <p className="mb-3 text-sm text-slate-500">Sin plazos registrados.</p>
              {expediente.fecha_detencion && (
                <GenerarPlazosButton
                  expedienteId={id}
                  fechaDetencion={expediente.fecha_detencion}
                  duplicidadTermino={expediente.duplicidad_termino}
                />
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {plazos.map(p => (
                <SemaforoPlazo
                  key={p.id}
                  estado={p.estado as 'activo' | 'proximo' | 'critico' | 'vencido' | 'cumplido'}
                  fechaLimite={p.fecha_limite}
                  nombre={p.tipo_plazo.replace(/_/g, ' ')}
                  fundamentoLegal={p.fundamento_legal || undefined}
                />
              ))}
            </div>
          )}
          <AgregarPlazoForm expedienteId={id} />
        </div>

        {/* Audiencias + Partes */}
        <div className="space-y-6">
          {/* Audiencias */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" /> Audiencias
            </h2>
            {audiencias.length === 0 ? (
              <p className="text-sm text-slate-500">Sin audiencias registradas.</p>
            ) : (
              <div className="space-y-2">
                {audiencias.map(a => (
                  <div key={a.id} className="rounded border border-slate-100 bg-slate-50 p-3">
                    <p className="text-sm font-medium">{tipoAudienciaLabels[a.tipo_audiencia] || a.tipo_audiencia}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(a.fecha_programada).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    <Badge variant={a.estado === 'programada' ? 'info' : a.estado === 'realizada' ? 'success' : 'neutral'}>
                      {a.estado}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <AgregarAudienciaForm expedienteId={id} pais={pais} />
          </div>

          {/* Partes */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-slate-500" /> Partes
            </h2>
            {partes.length === 0 ? (
              <p className="text-sm text-slate-500">Sin partes registradas.</p>
            ) : (
              <div className="space-y-2">
                {partes.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-3">
                    <span className="text-sm font-medium">{p.nombre} {p.apellidos || ''}</span>
                    <Badge variant="neutral">{tipoParteLabels[p.tipo] || p.tipo}</Badge>
                  </div>
                ))}
              </div>
            )}
            <AgregarParteForm expedienteId={id} pais={pais} />
          </div>
        </div>
      </div>

      {/* Declaraciones y Contradicciones */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-slate-500" /> Declaraciones
          </h2>
          <AgregarDeclaracionForm
            expedienteId={id}
            partes={partes.map(p => ({ id: p.id, nombre: p.nombre, apellidos: p.apellidos, tipo: p.tipo }))}
          />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> Contradicciones
          </h2>
          <ContradiccionesPanel expedienteId={id} />
        </div>
      </div>

      {/* Estrategia y Escritos */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-indigo-500" /> Estrategia de Defensa
          </h2>
          <EstrategiaPanel expedienteId={id} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="h-5 w-5 text-green-500" /> Escritos Legales
          </h2>
          <EscritosPanel expedienteId={id} />
        </div>
      </div>

      {/* Cerebro Verioska - Chat IA */}
      <div className="mt-6">
        <CerebroPanel expedienteId={id} />
      </div>

      {/* Jurisprudencia + Dosificación */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JurisprudenciaPanel pais={pais} />
        <DosificacionPanel expedienteId={id} pais={pais} />
      </div>

      {/* Interrogatorio */}
      <div className="mt-6">
        <InterrogatorioPanel expedienteId={id} />
      </div>

      {/* Consulta al Expediente (RAG) */}
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
          <Search className="h-5 w-5 text-indigo-500" /> Consulta al Expediente
        </h2>
        <ConsultaExpediente expedienteId={id} />
      </div>

      {/* Finanzas: Pagos y Gastos */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" /> Pagos
          </h2>
          <PagosPanel expedienteId={id} pais={pais} moneda={pais === 'PE' ? 'PEN' : 'MXN'} />
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-slate-800 flex items-center gap-2">
            <Receipt className="h-5 w-5 text-red-500" /> Gastos del Caso
          </h2>
          <GastosPanel expedienteId={id} moneda={pais === 'PE' ? 'PEN' : 'MXN'} />
        </div>
      </div>
    </div>
  )
}
