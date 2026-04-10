import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { query, queryOne } from '@/lib/db'
import { getSession } from '@/lib/auth'

const expedienteSchema = z.object({
  pais: z.enum(['MX', 'PE']).default('MX'),
  materia: z.preprocess((v) => (v === '' || v === null ? undefined : v), z.string().optional()),
  delito: z.string().min(1, 'Delito requerido'),
  nuc: z.string().optional(),
  carpetaInvestigacion: z.string().optional(),
  causaPenal: z.string().optional(),
  // Campos peruanos
  numeroCarpetaFiscal: z.string().optional(),
  numeroExpedienteJudicial: z.string().optional(),
  fechaDenuncia: z.string().optional(),
  fechaFormalizacion: z.string().optional(),
  fechaAcusacion: z.string().optional(),
  fechaAutoEnjuiciamiento: z.string().optional(),
  complejidad: z.enum(['simple', 'complejo', 'crimen_organizado']).optional(),
  juzgado: z.string().optional(),
  distritoJudicial: z.string().optional(),
  fiscalia: z.string().optional(),
  etapaProcesal: z.string().default('investigacion_inicial'),
  fechaHechos: z.string().optional(),
  fechaDetencion: z.string().optional(),
  fechaPuestaDisposicion: z.string().optional(),
  fechaFormulacionMx: z.string().optional(),
  fechaVinculacion: z.string().optional(),
  duplicidadTermino: z.boolean().default(false),
  notas: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const expedientes = await query(
      `SELECT id, pais, nuc, carpeta_investigacion, numero_carpeta_fiscal,
              numero_expediente_judicial, delito, juzgado, etapa_procesal,
              estado, materia, updated_at
       FROM expedientes
       WHERE user_id = $1
          OR despacho_id = (SELECT despacho_id FROM users WHERE id = $1)
       ORDER BY updated_at DESC`,
      [session.userId]
    )

    return NextResponse.json({ data: expedientes })
  } catch (error) {
    console.error('GET expedientes error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = expedienteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const d = parsed.data

    const expediente = await queryOne<{ id: string; created_at: string }>(
      `INSERT INTO expedientes (
        user_id, pais, materia, delito, nuc, carpeta_investigacion, causa_penal,
        numero_carpeta_fiscal, numero_expediente_judicial,
        juzgado, distrito_judicial, fiscalia, etapa_procesal,
        fecha_hechos, fecha_detencion, fecha_puesta_disposicion,
        fecha_formulacion, fecha_vinculacion, fecha_denuncia,
        fecha_formalizacion, fecha_acusacion, fecha_auto_enjuiciamiento,
        complejidad, duplicidad_termino, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
      RETURNING *`,
      [
        session.userId, d.pais, d.materia || null, d.delito, d.nuc || null, d.carpetaInvestigacion || null,
        d.causaPenal || null,
        d.numeroCarpetaFiscal || null, d.numeroExpedienteJudicial || null,
        d.juzgado || null, d.distritoJudicial || null,
        d.fiscalia || null, d.etapaProcesal,
        d.fechaHechos || null, d.fechaDetencion || null,
        d.fechaPuestaDisposicion || null, d.fechaFormulacionMx || null,
        d.fechaVinculacion || null, d.fechaDenuncia || null,
        d.fechaFormalizacion || null, d.fechaAcusacion || null,
        d.fechaAutoEnjuiciamiento || null,
        d.complejidad || null, d.duplicidadTermino, d.notas || null,
      ]
    )

    return NextResponse.json({ data: expediente }, { status: 201 })
  } catch (error) {
    console.error('POST expediente error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
