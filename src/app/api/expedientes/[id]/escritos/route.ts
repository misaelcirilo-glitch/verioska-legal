import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'
import {
  generarEscrito,
  getTiposEscrito,
  construirVariables,
  construirPromptEscritoIA,
  sustituirPlantilla,
  CAMPOS_EDITABLES,
} from '@/features/escritos/services/generador-escritos'

interface ExpedienteRow {
  id: string
  nuc: string | null
  carpeta_investigacion: string | null
  causa_penal: string | null
  delito: string
  juzgado: string | null
  distrito_judicial: string | null
  fiscalia: string | null
  etapa_procesal: string
}

// Scoping por despacho (PRP-005), coherente con listado/detalle.
async function verifyOwnership(expedienteId: string, userId: string) {
  return queryOne<{ id: string }>(
    `SELECT id FROM expedientes
      WHERE id = $1
        AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
    [expedienteId, userId]
  )
}

// Carga el expediente + sus partes y arma el objeto `datos` que consumen el
// generador y el constructor de variables. Reutilizado por GET y POST.
async function cargarDatos(expedienteId: string, userId: string) {
  const expediente = await queryOne<ExpedienteRow>(
    `SELECT * FROM expedientes
      WHERE id = $1
        AND (user_id = $2 OR despacho_id = (SELECT despacho_id FROM users WHERE id = $2))`,
    [expedienteId, userId]
  )
  if (!expediente) return null

  const partes = await query<{ tipo: string; nombre: string; apellidos: string | null }>(
    'SELECT tipo, nombre, apellidos FROM partes WHERE expediente_id = $1',
    [expedienteId]
  )

  const datos = {
    nuc: expediente.nuc,
    carpetaInvestigacion: expediente.carpeta_investigacion,
    causaPenal: expediente.causa_penal,
    delito: expediente.delito,
    juzgado: expediente.juzgado,
    distritoJudicial: expediente.distrito_judicial,
    fiscalia: expediente.fiscalia,
    etapaProcesal: expediente.etapa_procesal,
    imputado: partes.find(p => p.tipo === 'imputado') || null,
    victima: partes.find(p => p.tipo === 'victima') || null,
    defensor: partes.find(p => p.tipo === 'defensor') || null,
  }
  return { expediente, datos }
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
    const cargado = await cargarDatos(id, session.userId)
    if (!cargado) {
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

    // Variables del expediente pre-cargadas para los CAMPOS EDITABLES (modo IA).
    const variablesExpediente = construirVariables(cargado.datos)

    return NextResponse.json({
      data: escritos,
      tiposDisponibles: getTiposEscrito(),
      plantillas,
      camposEditables: CAMPOS_EDITABLES,
      variablesExpediente,
      iaDisponible: !!process.env.OPENROUTER_API_KEY,
    })
  } catch (error) {
    console.error('GET escritos error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

const escritoSchema = z.object({
  origen: z.enum(['predefinida', 'plantilla_propia', 'ia']).default('predefinida'),
  tipoEscrito: z.string().optional(),        // requerido en modo predefinida e ia (modelo base)
  plantillaId: z.string().uuid().optional(), // requerido en modo plantilla_propia
  campos: z.record(z.string(), z.string()).optional(), // overrides editables de variables
  instrucciones: z.string().optional(),      // guía adicional para la IA
}).refine(
  d => (d.origen === 'plantilla_propia' ? !!d.plantillaId : !!d.tipoEscrito),
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
    const cargado = await cargarDatos(id, session.userId)
    if (!cargado) {
      return NextResponse.json({ error: 'Expediente no encontrado' }, { status: 404 })
    }
    const { datos } = cargado

    const body = await request.json()
    const parsed = escritoSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }
    const d = parsed.data

    // Variables base + overrides editables del abogado (campos editables).
    const variables = { ...construirVariables(datos), ...(d.campos || {}) }

    let tipoEscrito: string
    let titulo: string
    let contenido: string
    let plantillaId: string | null = null
    let campos: Record<string, string> | null = null
    let usandoIA = false

    if (d.origen === 'plantilla_propia') {
      // Modo plantilla propia: sustituir {{campo}} en el contenido de la plantilla.
      const plantilla = await queryOne<{ id: string; nombre: string; categoria: string; contenido: string }>(
        `SELECT id, nombre, categoria, contenido FROM plantillas_despacho
          WHERE id = $1
            AND activo = true
            AND despacho_id = (SELECT despacho_id FROM users WHERE id = $2)`,
        [d.plantillaId, session.userId]
      )
      if (!plantilla) {
        return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
      }
      tipoEscrito = plantilla.categoria || 'plantilla'
      titulo = plantilla.nombre
      contenido = sustituirPlantilla(plantilla.contenido, variables)
      plantillaId = plantilla.id
      campos = variables
    } else if (d.origen === 'ia') {
      // Modo IA: el motor interno da el MODELO base; la IA lo reescribe con las
      // variables editables y las instrucciones. Fallback sin key = modelo base.
      const modelo = generarEscrito(d.tipoEscrito as string, datos)
      tipoEscrito = modelo.tipoEscrito
      titulo = modelo.titulo
      campos = variables
      contenido = modelo.contenido // fallback por defecto

      const apiKey = process.env.OPENROUTER_API_KEY
      if (apiKey) {
        try {
          const { generateText } = await import('ai')
          const { createOpenAI } = await import('@ai-sdk/openai')
          const openrouter = createOpenAI({ baseURL: 'https://openrouter.ai/api/v1', apiKey })
          const { system, prompt } = construirPromptEscritoIA({
            titulo,
            variables,
            modeloBase: modelo.contenido,
            instrucciones: d.instrucciones,
          })
          const { text } = await generateText({
            model: openrouter('google/gemini-2.0-flash-001'),
            system,
            prompt,
          })
          if (text && text.trim()) {
            contenido = text.trim()
            usandoIA = true
          }
        } catch (aiError) {
          console.error('Error IA escritos (usando fallback):', aiError)
        }
      }
    } else {
      // Modo predefinida: motor interno con plantillas de código.
      const escrito = generarEscrito(d.tipoEscrito as string, datos)
      tipoEscrito = escrito.tipoEscrito
      titulo = escrito.titulo
      contenido = escrito.contenido
    }

    // Guardar en BD (campos = snapshot de variables usadas, para trazabilidad).
    const row = await queryOne(
      `INSERT INTO escritos (
        expediente_id, tipo_escrito, titulo, contenido, origen, plantilla_id, campos
      ) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id, tipoEscrito, titulo, contenido, d.origen, plantillaId, campos ? JSON.stringify(campos) : null]
    )

    return NextResponse.json({ data: row, usandoIA }, { status: 201 })
  } catch (error) {
    console.error('POST escrito error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
