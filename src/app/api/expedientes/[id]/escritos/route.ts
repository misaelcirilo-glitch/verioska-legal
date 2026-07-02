import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  generarEscrito,
  getTiposEscrito,
  construirVariables,
  sustituirPlantilla,
} from '@/features/escritos/services/generador-escritos'

// Scoping por despacho (PRP-005), coherente con listado/detalle.
async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    `SELECT id FROM expedientes
      WHERE id = $1
        AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
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

    const escritos = await query(
      'SELECT * FROM escritos WHERE expediente_id = $1 ORDER BY created_at DESC',
      [id]
    )

    // Plantillas propias del despacho (para el modo "plantilla propia")
    const plantillas = await query<{ id: string; nombre: string; categoria: string }>(
      `SELECT id, nombre, categoria FROM plantillas_despacho
        WHERE activo = true
          AND despacho_id = (SELECT despacho_id FROM users WHERE id = $1)
        ORDER BY nombre`,
      [session.userId]
    )

    return NextResponse.json({ data: escritos, tiposDisponibles: getTiposEscrito(), plantillas })
  } catch (error) {
    console.error('GET escritos error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

const escritoSchema = z.object({
  origen: z.enum(['predefinida', 'plantilla_propia']).default('predefinida'),
  tipoEscrito: z.string().optional(),   // requerido en modo predefinida
  plantillaId: z.string().uuid().optional(), // requerido en modo plantilla_propia
}).refine(
  d => (d.origen === 'predefinida' ? !!d.tipoEscrito : !!d.plantillaId),
  { message: 'Falta el tipo de escrito o la plantilla seleccionada' }
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params
    const expediente = await queryOne<{
      id: string; nuc: string | null; carpeta_investigacion: string | null
      causa_penal: string | null; delito: string; juzgado: string | null
      distrito_judicial: string | null; fiscalia: string | null
      etapa_procesal: string
    }>(
      `SELECT * FROM expedientes
        WHERE id = $1
          AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
      [id, session.userId]
    )

    if (!expediente) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = escritoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    // Obtener partes relevantes
    const partes = await query<{
      tipo: string; nombre: string; apellidos: string | null
    }>(
      'SELECT tipo, nombre, apellidos FROM partes WHERE expediente_id = $1',
      [id]
    )

    const imputado = partes.find(p => p.tipo === 'imputado') || null
    const victima = partes.find(p => p.tipo === 'victima') || null
    const defensor = partes.find(p => p.tipo === 'defensor') || null

    const datos = {
      nuc: expediente.nuc,
      carpetaInvestigacion: expediente.carpeta_investigacion,
      causaPenal: expediente.causa_penal,
      delito: expediente.delito,
      juzgado: expediente.juzgado,
      distritoJudicial: expediente.distrito_judicial,
      fiscalia: expediente.fiscalia,
      etapaProcesal: expediente.etapa_procesal,
      imputado,
      victima,
      defensor,
    }

    let tipoEscrito: string
    let titulo: string
    let contenido: string
    let plantillaId: string | null = null

    if (parsed.data.origen === 'plantilla_propia') {
      // Modo plantilla propia: sustituir {{campo}} en el contenido de la plantilla.
      const plantilla = await queryOne<{ id: string; nombre: string; categoria: string; contenido: string }>(
        `SELECT id, nombre, categoria, contenido FROM plantillas_despacho
          WHERE id = $1
            AND activo = true
            AND despacho_id = (SELECT despacho_id FROM users WHERE id = $2)`,
        [parsed.data.plantillaId, session.userId]
      )
      if (!plantilla) {
        return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
      }
      const variables = construirVariables(datos)
      tipoEscrito = plantilla.categoria || 'plantilla'
      titulo = plantilla.nombre
      contenido = sustituirPlantilla(plantilla.contenido, variables)
      plantillaId = plantilla.id
    } else {
      // Modo predefinida: motor interno con plantillas de código.
      const escrito = generarEscrito(parsed.data.tipoEscrito as string, datos)
      tipoEscrito = escrito.tipoEscrito
      titulo = escrito.titulo
      contenido = escrito.contenido
    }

    // Guardar en BD
    const row = await queryOne(
      `INSERT INTO escritos (
        expediente_id, tipo_escrito, titulo, contenido, origen, plantilla_id
      ) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [id, tipoEscrito, titulo, contenido, parsed.data.origen, plantillaId]
    )

    return NextResponse.json({ data: row }, { status: 201 })
  } catch (error) {
    console.error('POST escrito error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
