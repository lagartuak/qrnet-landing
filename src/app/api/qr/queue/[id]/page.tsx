'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ColaPanel() {
  const params = useParams();
  const qrId = params.id;
  const [entries, setEntries] = useState<any[]>([]);
  const [stats, setStats] = useState({ esperando: 0, sentados: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nombreLocal, setNombreLocal] = useState('');

  const loadCola = async () => {
    try {
      const res = await fetch(`/api/qr/queue?qr_id=${qrId}`);
      if (!res.ok) throw new Error('Error al cargar');
      const data = await res.json();
      setEntries(data.entries || []);
      setStats({ esperando: data.esperando, sentados: data.sentados, total: data.total });
      if (data.nombre_local) setNombreLocal(data.nombre_local);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCola();
    const interval = setInterval(loadCola, 15000);
    return () => clearInterval(interval);
  }, [qrId]);

  const updateEstado = async (entryId: number, estado: string) => {
    await fetch('/api/qr/queue', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_id: entryId, estado }),
    });
    loadCola();
  };

  const avisarWhatsApp = (entry: any) => {
    const tel = (entry.telefono || '').replace(/\s/g, '');
    const msg = encodeURIComponent(
      `Hola ${entry.nombre} 👋\n\n` +
      `🍽️ ¡Tu mesa está lista!\n\n` +
      `Por favor, acude al local ahora.\n\n` +
      `— ${nombreLocal || 'Tu restaurante'} vía QRnet.io`
    );
    const url = tel
      ? `https://wa.me/${tel}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
    window.open(url, '_blank');
    updateEstado(entry.id, 'notificado');
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'esperando': return { bg: 'rgba(255,200,0,.15)', color: '#ffc800' };
      case 'notificado': return { bg: 'rgba(0,200,255,.15)', color: '#00c8ff' };
      case 'sentado': return { bg: 'rgba(0,200,100,.15)', color: '#00c864' };
      case 'no_show': return { bg: 'rgba(255,80,80,.15)', color: '#ff6b6b' };
      case 'cancelado': return { bg: 'rgba(255,255,255,.05)', color: '#6a8a95' };
      default: return { bg: 'rgba(255,255,255,.05)', color: '#6a8a95' };
    }
  };

  const estadoLabel = (estado: string) => {
    switch (estado) {
      case 'esperando': return '⏳ Esperando';
      case 'notificado': return '📲 Avisado';
      case 'sentado': return '✅ Sentado';
      case 'no_show': return '❌ No show';
      case 'cancelado': return '🚫 Cancelado';
      default: return estado;
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6a8a95' }}>Cargando cola...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d1a20', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#f0f8ff', fontWeight: 700, fontSize: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="QRnet.io" style={{ width: 32, height: 32 }} />
          QRnet<span style={{ color: '#00c8ff' }}>.</span>io
        </a>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href={`/dashboard/qr/${qrId}`} style={{ color: '#00c8ff', fontSize: '14px', textDecoration: 'none' }}>← Volver al QR</Link>
          <button onClick={loadCola} style={{
            background: 'rgba(0,200,255,.1)', border: '1px solid rgba(0,200,255,.2)',
            color: '#00c8ff', padding: '8px 16px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}>
            🔄 Actualizar
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ color: '#f0f8ff', fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>
          📋 Gestión de cola {nombreLocal ? `· ${nombreLocal}` : ''}
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#0d1a20', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,200,0,.2)', textAlign: 'center' }}>
            <div style={{ color: '#6a8a95', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Esperando</div>
            <div style={{ color: '#ffc800', fontSize: '36px', fontWeight: 800 }}>{stats.esperando}</div>
          </div>
          <div style={{ background: '#0d1a20', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,200,100,.2)', textAlign: 'center' }}>
            <div style={{ color: '#6a8a95', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Sentados</div>
            <div style={{ color: '#00c864', fontSize: '36px', fontWeight: 800 }}>{stats.sentados}</div>
          </div>
          <div style={{ background: '#0d1a20', borderRadius: '16px', padding: '20px', border: '1px solid rgba(0,200,255,.2)', textAlign: 'center' }}>
            <div style={{ color: '#6a8a95', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Total hoy</div>
            <div style={{ color: '#00c8ff', fontSize: '36px', fontWeight: 800 }}>{stats.total}</div>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        {entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0d1a20', borderRadius: '16px', border: '1px dashed rgba(0,200,255,.2)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h2 style={{ color: '#f0f8ff', fontSize: '18px', marginBottom: '8px' }}>Cola vacía</h2>
            <p style={{ color: '#6a8a95', fontSize: '14px' }}>No hay clientes en espera hoy. Se actualiza automáticamente.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {entries.map((e: any) => {
              const sc = estadoColor(e.estado);
              return (
                <div key={e.id} style={{
                  background: '#0d1a20', borderRadius: '12px', padding: '20px',
                  border: `1px solid ${sc.color}22`,
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: sc.bg, color: sc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: 800, flexShrink: 0,
                  }}>
                    {e.posicion}
                  </div>

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ color: '#f0f8ff', fontSize: '16px', fontWeight: 700 }}>{e.nombre}</div>
                    <div style={{ color: '#6a8a95', fontSize: '13px', display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '4px' }}>
                      <span>👥 {e.comensales}</span>
                      {e.telefono && <span>📱 {e.telefono}</span>}
                      {e.turno && <span>🕐 {e.turno}</span>}
                      <span>⏰ {new Date(e.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div style={{
                    background: sc.bg, color: sc.color,
                    padding: '5px 14px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 700,
                  }}>
                    {estadoLabel(e.estado)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {e.estado === 'esperando' && (
                      <>
                        {e.telefono && (
                          <button onClick={() => avisarWhatsApp(e)}
                            style={{
                              background: 'rgba(37,211,102,.15)', color: '#25d366',
                              border: 'none', padding: '8px 16px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '4px',
                            }}>
                            💬 WhatsApp
                          </button>
                        )}
                        {e.email && (
                          <button onClick={() => updateEstado(e.id, 'notificado')}
                            style={{
                              background: 'rgba(0,200,255,.15)', color: '#00c8ff',
                              border: 'none', padding: '8px 16px', borderRadius: '8px',
                              fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                            }}>
                            ✉️ Email
                          </button>
                        )}
                      </>
                    )}
                    {(e.estado === 'esperando' || e.estado === 'notificado') && (
                      <>
                        <button onClick={() => updateEstado(e.id, 'sentado')}
                          style={{
                            background: 'rgba(0,200,100,.15)', color: '#00c864',
                            border: 'none', padding: '8px 16px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          }}>
                          ✅ Sentar
                        </button>
                        <button onClick={() => updateEstado(e.id, 'no_show')}
                          style={{
                            background: 'rgba(255,80,80,.15)', color: '#ff6b6b',
                            border: 'none', padding: '8px 16px', borderRadius: '8px',
                            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                          }}>
                          ❌ No show
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ color: '#6a8a95', fontSize: '12px', textAlign: 'center', marginTop: '24px' }}>
          Se actualiza automáticamente cada 15 segundos · La cola se reinicia cada día
        </p>
      </div>
    </div>
  );
}
