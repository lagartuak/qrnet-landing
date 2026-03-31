'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get('verified')
  const error = searchParams.get('error')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setFormError('')
    const form = new FormData(e.currentTarget)
    const res = await signIn('credentials', {
      email: form.get('email'),
      password: form.get('password'),
      redirect: false,
    })
    if (res?.error) {
      setFormError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020608' }}>
      <div style={{ background: '#0d1a20', padding: '40px', borderRadius: '16px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 style={{ color: '#f0f8ff', fontFamily: 'sans-serif', fontSize: '24px', marginBottom: '8px' }}>Iniciar sesión</h1>
        {verified && <p style={{ color: '#00c8ff', fontSize: '14px' }}>Cuenta verificada correctamente. Ya puedes entrar.</p>}
        {error === 'token_expired' && <p style={{ color: '#ff6b35', fontSize: '14px' }}>El enlace ha caducado. Regístrate de nuevo.</p>}
        {error === 'token_invalid' && <p style={{ color: '#ff6b35', fontSize: '14px' }}>Enlace de verificación inválido.</p>}
        {formError && <p style={{ color: '#ff6b35', fontSize: '14px' }}>{formError}</p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input name="email" type="email" placeholder="Email *" required style={inputStyle} />
          <input name="password" type="password" placeholder="Contraseña *" required style={inputStyle} />
          <button type="submit" disabled={loading} style={{ background: '#00c8ff', color: '#000', border: 'none', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} style={{ background: 'transparent', border: '1px solid rgba(0,200,255,.2)', color: '#f0f8ff', padding: '14px', borderRadius: '40px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
          Continuar con Google
        </button>
        <p style={{ color: '#6a8a95', fontSize: '13px', textAlign: 'center' }}>
          ¿No tienes cuenta? <a href="/register" style={{ color: '#00c8ff', textDecoration: 'none' }}>Regístrate gratis</a>
        </p>
      </div>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  background: '#111e25',
  border: '1px solid rgba(0,200,255,.1)',
  borderRadius: '8px',
  padding: '12px 16px',
  color: '#f0f8ff',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
}