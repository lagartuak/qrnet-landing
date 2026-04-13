import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM email_verifications WHERE token = ? AND expires_at > NOW()',
      [`reset_${token}`]
    )

    if (!rows.length) {
      return NextResponse.json({ error: 'Enlace inválido o expirado' }, { status: 400 })
    }

    const userId = rows[0].user_id
    const password_hash = await bcrypt.hash(password, 12)

    await pool.query(
      "UPDATE users SET password_hash = ?, status = 'active' WHERE id = ?",
      [password_hash, userId]
    )

    await pool.query(
      'DELETE FROM email_verifications WHERE token = ?',
      [`reset_${token}`]
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}