import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { nanoid } from 'nanoid'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const [users]: any = await pool.query(
      'SELECT id, name FROM users WHERE email = ?',
      [email]
    )

    // Siempre respondemos OK para no revelar si el email existe
    if (!users.length) {
      return NextResponse.json({ ok: true })
    }

    const user = users[0]
    const token = nanoid(64)
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Borrar tokens anteriores de este usuario
    await pool.query(
      'DELETE FROM email_verifications WHERE user_id = ? AND token LIKE "reset_%"',
      [user.id]
    )

    await pool.query(
      'INSERT INTO email_verifications (token, user_id, expires_at) VALUES (?, ?, ?)',
      [`reset_${token}`, user.id, expires]
    )

    const resetUrl = `${process.env.NEXT_PUBLIC_URL || process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    await resend.emails.send({
      from: 'QRnet.io <noreply@qrnet.io>',
      to: email,
      subject: 'Restablecer contraseña — QRnet.io',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 20px">
          <h1 style="color:#020608;font-size:24px">Hola ${user.name} 👋</h1>
          <p style="color:#444;font-size:15px;line-height:1.6">
            Has solicitado restablecer tu contraseña en QRnet.io. Haz clic en el botón de abajo para crear una nueva.
          </p>
          <a href="${resetUrl}"
             style="display:inline-block;background:#00c8ff;color:#000;padding:14px 32px;border-radius:40px;font-weight:700;text-decoration:none;margin:24px 0">
            Restablecer contraseña
          </a>
          <p style="color:#888;font-size:13px">Este enlace caduca en 1 hora. Si no has solicitado esto, ignora este email.</p>
        </div>
      `
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}