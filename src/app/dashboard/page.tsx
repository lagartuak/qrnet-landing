import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import pool from '@/lib/db'
import Link from 'next/link'

export default async function QRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params

  const [rows]: any = await pool.query(
    'SELECT * FROM qr_codes WHERE id = ?',
    [id]
  )

  if (!rows.length) notFound()

  const qr = rows[0]
  const data = typeof qr.object_data === 'string' ? JSON.parse(qr.object_data) : qr.object_data
  const publicUrl = process.env.NEXTAUTH_URL + '/q/' + qr.public_code

  return (
    <main style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: "'DM Sans', sans-serif" }}>

      {/* NAV */}
      <nav style={{ background: 'rgba(2,6,8,.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <Link href="/dashboard" style={{ color: '#f0f8ff', fontWeight: 800, fontSize: '20px', textDecoration: 'none', letterSpacing: '-.02em' }}>
          QRnet<span style={{ color: '#00c8ff' }}>.</span>io
        </Link>
        <Link href="/dashboard" style={{ color: '#6a8a95', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ← Volver al panel
        </Link>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>

        {/* CABECERA */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,200,255,.08)', border: '1px solid rgba(0,200,255,.2)', borderRadius: '40px', padding: '4px 14px', fontSize: '11px', fontWeight: 700, color: '#00c8ff', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
            {data.tipo_maquina === 'vending' ? '🥤 Vending' : '🚬 Máquina de Tabaco'}
          </div>
          <h1 style={{ color: '#f0f8ff', fontSize: '28px', fontWeight: 800, letterSpacing: '-.03em', marginBottom: '8px' }}>
            {qr.title}
          </h1>
          <p style={{ color: '#6a8a95', fontSize: '14px' }}>
            Código público: <strong style={{ color: '#00c8ff' }}>{qr.public_code}</strong>
          </p>
        </div>

        {/* QR IMAGE */}
        <div style={{ background: '#0d1a20', borderRadius: '20px', padding: '40px', border: '1px solid rgba(0,200,255,.15)', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', display: 'inline-block', marginBottom: '28px', boxShadow: '0 0 60px rgba(0,200,255,.15)' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicUrl)}`}
              alt="Código QR"
              width={220}
              height={220}
              style={{ display: 'block' }}
            />
          </div>

          <p style={{ color: '#6a8a95', fontSize: '13px', marginBottom: '28px' }}>
            URL pública:{' '}
            <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: '#00c8ff', textDecoration: 'none' }}>
              {publicUrl}
            </a>
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            
              href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(publicUrl)}&download=1`}
              style={{ background: 'linear-gradient(135deg,#00c8ff,#00e5c0)', color: '#000', padding: '12px 28px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              ⬇ Descargar PNG
            </a>
            
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              style={{ border: '1px solid rgba(0,200,255,.3)', color: '#00c8ff', padding: '12px 28px', borderRadius: '40px', fontWeight: 600, fontSize: '14px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,200,255,.05)' }}
            >
              👁 Ver página pública
            </a>
          </div>
        </div>

        {/* DATOS */}
        <div style={{ background: '#0d1a20', borderRadius: '20px', padding: '32px', border: '1px solid rgba(0,200,255,.1)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#00c8ff', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '24px', height: '1px', background: '#00c8ff', display: 'inline-block' }} />
            Datos del objeto
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { k: 'Establecimiento', v: data.estab_nombre },
              { k: 'Ciudad', v: data.estab_ciudad },
              { k: 'Dirección', v: data.estab_dir },
              { k: 'Código postal', v: data.estab_cp },
              { k: 'Fabricante', v: data.fabricante },
              { k: 'Modelo', v: data.modelo },
              { k: 'Nº de serie', v: data.num_serie },
              { k: 'Teléfono', v: data.tel_resp },
              { k: 'Email', v: data.email_resp },
              { k: 'Caducidad PVR', v: data.pvr_caducidad ? new Date(data.pvr_caducidad).toLocaleDateString('es-ES') : null },
            ].filter(f => f.v).map(f => (
              <div key={f.k} style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(0,200,255,.06)' }}>
                <div style={{ fontSize: '10px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px', fontWeight: 600 }}>{f.k}</div>
                <div style={{ fontSize: '14px', color: '#f0f8ff', fontWeight: 600 }}>{f.v}</div>
              </div>
            ))}
          </div>
          {data.observaciones && (
            <div style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px', border: '1px solid rgba(0,200,255,.06)', marginTop: '12px' }}>
              <div style={{ fontSize: '10px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px', fontWeight: 600 }}>Observaciones</div>
              <div style={{ fontSize: '14px', color: '#f0f8ff' }}>{data.observaciones}</div>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}