import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

interface EventoCronologia {
  id: string
  fecha: string
  titulo: string
  descripcion: string | null
  tipo: 'hecho' | 'audiencia' | 'plazo' | 'procesal'
  fuente: string
  metadata: Record<string, unknown>
}

async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    'SELECT id FROM expedientes WHERE id = $1 AND user_id = $2',
    [expedienteId, userId]
  )
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const owns = await verifyOwnership(id, session.userId)
    if (!owns) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const eventos: EventoCronologia[] = []

    // 1. Hechos extraídos de documentos
    const hechos = await query<{
      id: string; descripcion: string; fecha_hecho: string | null
      lugar: string | null; relevancia: string
    }>(
      'SELECT id, descripcion, fecha_hecho, lugar, relevancia FROM hechos WHERE expediente_id = $1',
      [id]
    )
    for (const h of hechos) {
      if (h.fecha_hecho) {
        eventos.push({
          id: `hecho-${h.id}`,
          fecha: h.fecha_hecho,
          titulo: h.descripcion.slice(0, 100),
          descripcion: h.descripcion,
          tipo: 'hecho',
          fuente: 'Documento procesado',
          metadata: { relevancia: h.relevancia, lugar: h.lugar },
        })
      }
    }

    // 2. Audiencias
    const audiencias = await query<{
      id: string; tipo_audiencia: string; fecha_programada: string
      estado: string; sala: string | null; juzgado: string | null
    }>(
      'SELECT id, tipo_audiencia, fecha_programada, estado, sala, juzgado FROM audiencias WHERE expediente_id = $1',
      [id]
    )

    const tipoAudienciaLabels: Record<string, string> = {
      control_detencion: 'Control de Detención',
      formulacion_imputacion: 'Formulación de Imputación',
      vinculacion_proceso: 'Vinculación a Proceso',
      medidas_cautelares: 'Medidas Cautelares',
      plazo_cierre_investigacion: 'Cierre de Investigación',
      intermedia: 'Audiencia Intermedia',
      juicio_oral: 'Juicio Oral',
      individualizacion_sancion: 'Individualización de Sanción',
      amparo: 'Amparo',
      apelacion: 'Apelación',
      otra: 'Otra Audiencia',
    }

    for (const a of audiencias) {
      eventos.push({
        id: `audiencia-${a.id}`,
        fecha: a.fecha_programada,
        titulo: tipoAudienciaLabels[a.tipo_audiencia] || a.tipo_audiencia,
        descripcion: a.sala ? `Sala: ${a.sala}` : null,
        tipo: 'audiencia',
        fuente: 'Audiencia registrada',
        metadata: { estado: a.estado, juzgado: a.juzgado },
      })
    }

    // 3. Plazos
    const plazos = await query<{
      id: string; tipo_plazo: string; fecha_limite: string
      estado: string; fundamento_legal: string | null
    }>(
      'SELECT id, tipo_plazo, fecha_limite, estado, fundamento_legal FROM plazos WHERE expediente_id = $1',
      [id]
    )
    for (const p of plazos) {
      eventos.push({
        id: `plazo-${p.id}`,
        fecha: p.fecha_limite,
        titulo: `Plazo: ${p.tipo_plazo.replace(/_/g, ' ')}`,
        descripcion: p.fundamento_legal,
        tipo: 'plazo',
        fuente: 'Motor CNPP',
        metadata: { estado: p.estado },
      })
    }

    // 4. Eventos de cronología manual/IA
    const cronologia = await query<{
      id: string; fecha_evento: string; titulo: string
      descripcion: string | null; tipo_evento: string; generado_por: string
    }>(
      'SELECT id, fecha_evento, titulo, descripcion, tipo_evento, generado_por FROM cronologia WHERE expediente_id = $1',
      [id]
    )
    for (const c of cronologia) {
      eventos.push({
        id: `crono-${c.id}`,
        fecha: c.fecha_evento,
        titulo: c.titulo,
        descripcion: c.descripcion,
        tipo: (c.tipo_evento as EventoCronologia['tipo']) || 'procesal',
        fuente: c.generado_por === 'ia' ? 'IA' : 'Manual',
        metadata: {},
      })
    }

    // Ordenar cronológicamente
    eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

    return NextResponse.json({ data: eventos })
  } catch (error) {
    console.error('GET cronologia error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
