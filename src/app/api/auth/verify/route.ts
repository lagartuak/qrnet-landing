import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=token_invalid', req.url))
  }

  const [rows]: any = await pool.query(
    'SELECT * FROM email_verifications WHERE token = ?', [token]
  )

  if (rows.length === 0) {
    return NextResponse.redirect(new URL('/login?error=token_invalid', req.url))
  }

  const verification = rows[0]

  if (new Date(verification.expires_at) < new Date()) {
    return NextResponse.redirect(new URL('/login?error=token_expired', req.url))
  }

  await pool.query(
    'UPDATE users SET status = ? WHERE id = ?',
    ['active', verification.user_id]
  )

  await pool.query(
    'DELETE FROM email_verifications WHERE token = ?', [token]
  )

  return NextResponse.redirect(new URL('/login?verified=true', req.url))
}