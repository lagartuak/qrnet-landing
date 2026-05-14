import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
/* eslint-disable @typescript-eslint/no-explicit-any */

// GET: cargar diseño guardado
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const { id } = await params
  const [rows]: any = await pool.query(
    'SELECT qr_design FROM qr_codes WHERE id = ? AND user_id = (SELECT id FROM users WHERE email = ?)',
    [id, session.user.email]
  )

  if (!rows.length) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ design: rows[0].qr_design || null })
}

// PUT: guardar diseño
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'No auth' }, { status: 401 })

  const { id } = await params
  const { design } = await req.json()

  const [result]: any = await pool.query(
    'UPDATE qr_codes SET qr_design = ? WHERE id = ? AND user_id = (SELECT id FROM users WHERE email = ?)',
    [JSON.stringify(design), id, session.user.email]
  )

  if (result.affectedRows === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
