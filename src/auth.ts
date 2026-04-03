import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

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
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        const [rows]: any = await pool.query(
          'SELECT * FROM users WHERE email = ?',
          [user.email]
        )
        if (rows.length === 0) {
          const id = nanoid()
          await pool.query(
            'INSERT INTO users (id, email, name, status) VALUES (?, ?, ?, ?)',
            [id, user.email, user.name, 'active']
          )
          await pool.query(
            'INSERT INTO subscriptions (id, user_id, plan) VALUES (?, ?, ?)',
            [nanoid(), id, 'free']
          )
          user.id = id
        } else {
          user.id = rows[0].id
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user?.id) token.userId = user.id
      return token
    },
    async session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string
      return session
    },
  },
})