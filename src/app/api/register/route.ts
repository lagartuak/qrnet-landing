import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  try {
    const { name, email, password, company, country, phone_prefix, phone } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, email y contraseña son obligatorios' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?', [email]
    )
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Este email ya está registrado' }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const id = nanoid()

    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, company, country, phone_prefix, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, email, password_hash, name, company || null, country || null, phone_prefix || null, phone || null, 'pending']
    )

    await pool.query(
      'INSERT INTO subscriptions (id, user_id, plan) VALUES (?, ?, ?)',
      [nanoid(), id, 'free']
    )

    const token = nanoid(64)
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    await pool.query(
      'INSERT INTO email_verifications (token, user_id, expires_at) VALUES (?, ?, ?)',
      [token, id, expires]
    )

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}