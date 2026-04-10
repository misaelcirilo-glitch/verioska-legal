import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { queryOne } from '@/lib/db'
import { Document, Packer, Paragraph, TextRun } from 'docx'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requerido' }, { status: 400 })

  const plantilla = await queryOne<{
    nombre: string; contenido: string; categoria: string
  }>(
    `SELECT nombre, contenido, categoria FROM plantillas_despacho
     WHERE id = $1 AND despacho_id = (SELECT despacho_id FROM users WHERE id = $2) AND activo = true`,
    [id, session.userId]
  )

  if (!plantilla) return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })

  // Convertir contenido a párrafos Word
  const lineas = plantilla.contenido.split('\n')
  const paragraphs = lineas.map(linea => {
    return new Paragraph({
      children: [
        new TextRun({
          text: linea,
          size: 24, // 12pt
          font: 'Times New Roman',
        }),
      ],
      spacing: { after: 200 },
    })
  })

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }, // 1 inch
        },
      },
      children: paragraphs,
    }],
  })

  const buffer = await Packer.toBuffer(doc)
  const safeName = plantilla.nombre.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '').replace(/ +/g, '_')

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${safeName}.docx"`,
    },
  })
}
