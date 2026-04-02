import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Link from 'next/link';

interface Props {
  params: { id: string };
}

export default async function QRDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const [rows]: any = await pool.query(
    'SELECT * FROM qr_codes WHERE id = ? AND user_id = ?',
    [params.id, session.user.id]
  );

  if (!rows.length) notFound();

  const qr = rows[0];
  const data = typeof qr.object_data === 'string'
    ? JSON.parse(qr.object_data)
    : qr.object_data;

  const publicUrl = `${process.env.NEXTAUTH_URL}/q/${qr.public_code}`;

  return (
    <main style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d1a20', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/dashboard" style={{ color: '#f0f8ff', fontWeight: 700, fontSize: '20px', textDecoration: 'none' }}>
          QRnet<span style={{ color: '#00c8ff' }}>.</span>io
        </Link>
        <Link href="/dashboard" style={{ color: '#6a8a95', fontSize: '13px', textDecoration: 'none' }}>
          ← Volver al panel
        </Link>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{ background: '#0d1a20', borderRadius: '20px', padding: '40px', border: '1px solid rgba(0,200,255,.15)', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ color: '#f0f8ff', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            ¡QR creado correctamente!
          </h1>
          <p style={{ color: '#6a8a95', fontSize: '15px', marginBottom: '32px' }}>
            Código: <strong style={{ color: '#00c8ff' }}>{qr.public_code}</strong>
          </p>

          {/* QR Image */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', display: 'inline-block', marginBottom: '24px' }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
              alt="Código QR"
              width={200}
              height={200}
            />
          </div>

          <p style={{ color: '#6a8a95', fontSize: '13px', marginBottom: '24px' }}>
            URL pública: <a href={publicUrl} target="_blank" rel="noreferrer" style={{ color: '#00c8ff' }}>{publicUrl}</a>
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            
              href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(publicUrl)}&download=1`}
              download={`QR-${qr.public_code}.png`}
              style={{ background: 'linear-gradient(135deg,#00c8ff,#00e5c0)', color: '#000', padding: '12px 28px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}
            >
              ⬇ Descargar PNG
            </a>
            
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              style={{ border: '1px solid rgba(0,200,255,.3)', color: '#00c8ff', padding: '12px 28px', borderRadius: '40px', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
            >
              👁 Ver página pública
            </a>
          </div>
        </div>

        {/* Datos del objeto */}
        <div style={{ background: '#0d1a20', borderRadius: '20px', padding: '32px', border: '1px solid rgba(0,200,255,.1)' }}>
          <h2 style={{ color: '#f0f8ff', fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
            {qr.title}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {data.estab_nombre && (
              <div style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>Establecimiento</div>
                <div style={{ fontSize: '14px', color: '#f0f8ff', fontWeight: 600 }}>{data.estab_nombre}</div>
              </div>
            )}
            {data.estab_ciudad && (
              <div style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>Ciudad</div>
                <div style={{ fontSize: '14px', color: '#f0f8ff', fontWeight: 600 }}>{data.estab_ciudad}</div>
              </div>
            )}
            {data.fabricante && (
              <div style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>Fabricante</div>
                <div style={{ fontSize: '14px', color: '#f0f8ff', fontWeight: 600 }}>{data.fabricante}</div>
              </div>
            )}
            {data.modelo && (
              <div style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>Modelo</div>
                <div style={{ fontSize: '14px', color: '#f0f8ff', fontWeight: 600 }}>{data.modelo}</div>
              </div>
            )}
            {data.tel_resp && (
              <div style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>Teléfono</div>
                <div style={{ fontSize: '14px', color: '#f0f8ff', fontWeight: 600 }}>{data.tel_resp}</div>
              </div>
            )}
            {data.pvr_caducidad && (
              <div style={{ background: '#111e25', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '4px' }}>Caducidad PVR</div>
                <div style={{ fontSize: '14px', color: '#f0f8ff', fontWeight: 600 }}>{new Date(data.pvr_caducidad).toLocaleDateString('es-ES')}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
