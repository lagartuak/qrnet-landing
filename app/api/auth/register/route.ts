import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    await resend.emails.send({
      from: 'QRnet.io <noreply@qrnet.io>',
      to: email,
      subject: 'Verifica tu cuenta en QRnet.io',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">
          <h1 style="color:#020608;font-size:24px">Hola ${name} 👋</h1>
          <p style="color:#444;font-size:15px;line-height:1.6">
            Gracias por registrarte en QRnet.io. Para activar tu cuenta haz click en el botón de abajo.
          </p>
          <a href="${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${token}"
             style="display:inline-block;background:#00c8ff;color:#000;padding:14px 32px;border-radius:40px;font-weight:700;text-decoration:none;margin:24px 0">
            Verificar mi cuenta
          </a>
          <p style="color:#888;font-size:13px">Este enlace caduca en 24 horas.</p>
        </div>
      `
    })

    return NextResponse.json({ ok: true })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
```

Luego añade esta línea al `.env.local`:
```
NEXT_PUBLIC_URL=http://localhost:3000