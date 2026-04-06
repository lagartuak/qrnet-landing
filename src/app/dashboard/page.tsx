import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import DeleteButton from './DeleteButton'
/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const email = session.user.email

  const [qrRows]: any = await pool.query(
    `SELECT qr_codes.* FROM qr_codes 
     INNER JOIN users ON qr_codes.user_id = users.id 
     WHERE users.email = ?
     ORDER BY qr_codes.created_at DESC`,
    [email]
  )

  const [subRows]: any = await pool.query(
    `SELECT subscriptions.* FROM subscriptions 
     INNER JOIN users ON subscriptions.user_id = users.id 
     WHERE users.email = ?`,
    [email]
  )

  const plan = subRows[0]?.plan || 'free'
  const qrCount = qrRows.length
  const qrLimit = plan === 'free' ? 20 : plan === 'pro' ? 50 : 999999

  return (
    <main style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d1a20', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#f0f8ff', fontWeight: 700, fontSize: '20px' }}>QRnet<span style={{ color: '#00c8ff' }}>.</span>io</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: '#6a8a95' }}>{session.user.email}</span>
          <a href="/api/auth/signout" style={{ background: 'transparent', border: '1px solid rgba(0,200,255,.2)', color: '#00c8ff', padding: '8px 16px', borderRadius: '40px', fontSize: '13px', textDecoration: 'none' }}>Salir</a>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ color: '#f0f8ff', fontSize: '28px', fontWeight: 700, marginBottom: '4px' }}>
              Hola, {session.user.name} 👋
            </h1>
            <p style={{ color: '#6a8a95', fontSize: '14px' }}>
              Plan {plan.toUpperCase()} · {qrCount}/{qrLimit} QRs usados
            </p>
          </div>
          {qrCount < qrLimit && (
            <a href="/dashboard/crear" style={{ background: '#00c8ff', color: '#000', padding: '12px 24px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              + Nuevo QR
            </a>
          )}
          {qrCount >= qrLimit && plan === 'free' && (
            <a href="/#precios" style={{ background: '#ff6b35', color: '#fff', padding: '12px 24px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Actualizar a Pro
            </a>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {qrRows.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 20px', background: '#0d1a20', borderRadius: '16px', border: '1px dashed rgba(0,200,255,.2)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
              <h2 style={{ color: '#f0f8ff', fontSize: '20px', marginBottom: '8px' }}>Aún no tienes QRs</h2>
              <p style={{ color: '#6a8a95', fontSize: '14px', marginBottom: '24px' }}>Crea tu primer QR en segundos</p>
              <a href="/dashboard/crear" style={{ background: '#00c8ff', color: '#000', padding: '12px 24px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                Crear mi primer QR
              </a>
            </div>
          )}
          {qrRows.map((qr: any) => (
            <div key={qr.id} style={{ background: '#0d1a20', borderRadius: '12px', padding: '24px', border: '1px solid rgba(0,200,255,.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <h3 style={{ color: '#f0f8ff', fontSize: '16px', fontWeight: 600 }}>{qr.title || 'Sin nombre'}</h3>
                <span style={{ background: qr.is_active ? 'rgba(0,200,255,.1)' : 'rgba(255,107,53,.1)', color: qr.is_active ? '#00c8ff' : '#ff6b35', fontSize: '11px', padding: '4px 10px', borderRadius: '40px', fontWeight: 600 }}>
                  {qr.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p style={{ color: '#6a8a95', fontSize: '13px', marginBottom: '16px', wordBreak: 'break-all' }}>
                qrnet.io/q/{qr.public_code}
              </p>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a href={`/dashboard/qr/${qr.id}`} style={{ color: '#00c8ff', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                  Ver detalles →
                </a>
                <a href={`/dashboard/qr/${qr.id}/editar`} style={{ color: '#6a8a95', fontSize: '13px', textDecoration: 'none', fontWeight: 600 }}>
                  ✏️ Editar
                </a>
                <DeleteButton qrId={qr.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}