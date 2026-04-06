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