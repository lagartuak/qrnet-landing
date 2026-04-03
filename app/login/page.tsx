'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
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
    setLoading(false)
    if (res?.error) {
      setFormError('Email o contraseña incorrectos')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
        <div style={{ background: '#0d1a20', borderRadius: '20px', padding: '40px', border: '1px solid rgba(0,200,255,.1)' }}>
          <h1 style={{ color: '#f0f8ff', fontSize: '24px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
            QRnet<span style={{ color: '#00c8ff' }}>.</span>io
          </h1>
          <p style={{ color: '#6a8a95', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>Inicia sesión en tu cuenta</p>

          {verified && <div style={{ background: 'rgba(0,200,100,.1)', border: '1px solid rgba(0,200,100,.2)', borderRadius: '10px', padding: '12px', color: '#00c864', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>✓ Cuenta verificada. Ya puedes iniciar sesión.</div>}
          {error && <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>Error al iniciar sesión</div>}
          {formError && <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>{formError}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#6a8a95', fontWeight: 600, display: 'block', marginBottom: '6px' }}>EMAIL</label>
              <input name="email" type="email" required placeholder="tu@email.com" style={{ width: '100%', background: '#111e25', border: '1px solid rgba(0,200,255,.1)', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#f0f8ff', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#6a8a95', fontWeight: 600, display: 'block', marginBottom: '6px' }}>CONTRASEÑA</label>
              <input name="password" type="password" required placeholder="••••••••" style={{ width: '100%', background: '#111e25', border: '1px solid rgba(0,200,255,.1)', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#f0f8ff', outline: 'none' }} />
            </div>
            <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#00c8ff,#00e5c0)', color: '#000', border: 'none', borderRadius: '40px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div style={{ margin: '24px 0', borderTop: '1px solid rgba(0,200,255,.1)', paddingTop: '24px' }}>
            <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} style={{ width: '100%', background: '#fff', color: '#000', border: 'none', borderRadius: '40px', padding: '13px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: '13px', color: '#6a8a95' }}>
            ¿No tienes cuenta? <a href="/registro" style={{ color: '#00c8ff', textDecoration: 'none' }}>Regístrate gratis</a>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#020608' }} />}>
      <LoginForm />
    </Suspense>
  )
}