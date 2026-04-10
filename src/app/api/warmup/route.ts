import { NextResponse } from 'next/server'
import { queryOne } from '@/lib/db'

// Endpoint para mantener Neon despierta. Llamar cada 4 minutos con un cron externo.
// URL: GET /api/warmup
export async function GET() {
  try {
    const result = await queryOne<{ now: string }>('SELECT NOW() as now')
    return NextResponse.json({ ok: true, ts: result?.now })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
