'use client'
import { useState } from 'react'

export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Error al enviar el email')
      }
    } catch {
      setError('Error de conexión')
    }
    setLoading(false)
  }

  return (
    <main style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
        <div style={{ background: '#0d1a20', borderRadius: '20px', padding: '40px', border: '1px solid rgba(0,200,255,.1)' }}>
          <h1 style={{ color: '#f0f8ff', fontSize: '24px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
            QRnet<span style={{ color: '#00c8ff' }}>.</span>io
          </h1>
          <p style={{ color: '#6a8a95', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>Recuperar contraseña</p>

          {sent ? (
            <div style={{ background: 'rgba(0,200,100,.1)', border: '1px solid rgba(0,200,100,.2)', borderRadius: '10px', padding: '16px', color: '#00c864', fontSize: '14px', textAlign: 'center' }}>
              <p style={{ marginBottom: '8px', fontWeight: 600 }}>✓ Email enviado</p>
              <p style={{ fontSize: '13px', color: '#6a8a95' }}>Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña.</p>
              <a href="/login" style={{ color: '#00c8ff', fontSize: '13px', textDecoration: 'none', display: 'inline-block', marginTop: '16px' }}>← Volver al login</a>
            </div>
          ) : (
            <>
              {error && <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#6a8a95', fontWeight: 600, display: 'block', marginBottom: '6px' }}>EMAIL</label>
                  <input type="email" required placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', background: '#111e25', border: '1px solid rgba(0,200,255,.1)', borderRadius: '10px', padding: '11px 14px', fontSize: '14px', color: '#f0f8ff', outline: 'none' }} />
                </div>
                <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg,#00c8ff,#00e5c0)', color: '#000', border: 'none', borderRadius: '40px', padding: '13px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '16px' }}>
                <a href="/login" style={{ color: '#00c8ff', fontSize: '13px', textDecoration: 'none' }}>← Volver al login</a>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  )
}