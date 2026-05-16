import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const { id } = await params
  const { notificacion } = await req.json()

  if (!['sms', 'whatsapp', 'email', 'ambos'].includes(notificacion)) {
    return NextResponse.json({ error: 'Valor no válido' }, { status: 400 })
  }

  const [result]: any = await pool.query(
    "UPDATE qr_codes SET object_data = JSON_SET(object_data, '$.notificacion', ?) WHERE id = ? AND user_id = (SELECT id FROM users WHERE email = ?)",
    [notificacion, id, session.user.email]
  )

  if (result.affectedRows === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
