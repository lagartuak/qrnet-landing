import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const [rows]: any = await pool.query(
          'SELECT * FROM users WHERE email = ?',
          [credentials.email]
        )
        const user = rows[0]
        if (!user) return null
        if (user.status === 'pending') return null
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash)
        if (!valid) return null
        return { id: user.id, email: user.email, name: user.name }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session }) {
      if (session?.user?.email) {
        const [rows]: any = await pool.query(
          'SELECT id FROM users WHERE email = ?',
          [session.user.email]
        )
        console.log('SESSION CALLBACK - email:', session.user.email, 'rows:', rows.length)
        if (rows.length > 0) {
          session.user.id = rows[0].id
        } else {
          const { nanoid } = await import('nanoid')
          const id = nanoid()
          await pool.query(
            'INSERT INTO users (id, email, name, status) VALUES (?, ?, ?, ?)',
            [id, session.user.email, session.user.name, 'active']
          )
          await pool.query(
            'INSERT INTO subscriptions (id, user_id, plan) VALUES (?, ?, ?)',
            [nanoid(), id, 'free']
          )
          session.user.id = id
        }
      }
      return session
    },
  },
})