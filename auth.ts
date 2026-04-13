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
        console.log("LOGIN - user found:", !!user, "email:", credentials.email)
        if (!user) return null
        console.log("LOGIN - status:", user.status, "has password:", !!user.password_hash)
        if (user.status === "pending") return null
        console.log("LOGIN - checking password")
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
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    }
  }
})