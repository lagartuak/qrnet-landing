import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import pool from '@/lib/db'
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { id } = await params

    const [userRows]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [session.user.email]
    )

    if (!userRows.length) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const userId = userRows[0].id

    const [result]: any = await pool.query(
      'DELETE FROM qr_codes WHERE id = ? AND user_id = ?',
      [id, userId]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'QR no encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error eliminando QR:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const { id } = await params
    const [rows]: any = await pool.query(
      `SELECT qr_codes.* FROM qr_codes
       INNER JOIN users ON qr_codes.user_id = users.id
       WHERE qr_codes.id = ? AND users.email = ?`,
      [id, session.user.email]
    )
    if (!rows.length) {
      return NextResponse.json({ error: 'QR no encontrado' }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (error: any) {
    console.error('Error GET QR:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const { id } = await params
    const { object_data } = await req.json()
    const [userRows]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [session.user.email]
    )
    if (!userRows.length) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }
    const userId = userRows[0].id
    const [result]: any = await pool.query(
      'UPDATE qr_codes SET object_data = ? WHERE id = ? AND user_id = ?',
      [JSON.stringify(object_data), id, userId]
    )
    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'QR no encontrado' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error PUT QR:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
