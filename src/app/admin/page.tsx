'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, qrsRes] = await Promise.all([
        fetch('/api/admin?action=stats'),
        fetch('/api/admin?action=users'),
        fetch('/api/admin?action=qrs'),
      ]);
      if (!statsRes.ok) throw new Error('No autorizado');
      setStats(await statsRes.json());
      setUsers((await usersRes.json()).users || []);
      setQrs((await qrsRes.json()).qrs || []);
    } catch (e: any) {
      setError(e.message || 'Error al cargar');
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const adminAction = async (action: string, userId: string) => {
    if (action === 'delete_user' && !confirm('¿Seguro? Se borrarán todos los QRs de este usuario.')) return;
    await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, userId }),
    });
    loadData();
  };

  const cardStyle: React.CSSProperties = {
    background: '#0d1a20',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(0,200,255,.1)',
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '10px 20px',
    borderRadius: '40px',
    border: 'none',
    background: active ? '#00c8ff' : 'rgba(255,255,255,.05)',
    color: active ? '#000' : '#6a8a95',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    transition: '.2s',
  });

  const btnStyle = (color: string): React.CSSProperties => ({
    padding: '6px 14px',
    borderRadius: '8px',
    border: 'none',
    background: color === 'green' ? 'rgba(0,200,100,.15)' : color === 'red' ? 'rgba(255,80,80,.15)' : 'rgba(0,200,255,.15)',
    color: color === 'green' ? '#00c864' : color === 'red' ? '#ff6b6b' : '#00c8ff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6a8a95' }}>Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ color: '#ff6b35', fontSize: '18px' }}>⛔ {error}</p>
        <Link href="/dashboard" style={{ color: '#00c8ff', textDecoration: 'none' }}>Volver al dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d1a20', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#f0f8ff', fontWeight: 700, fontSize: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="QRnet.io" style={{ width: 32, height: 32 }} />
          QRnet<span style={{ color: '#00c8ff' }}>.</span>io
          <span style={{ background: '#ff6b35', color: '#fff', fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>ADMIN</span>
        </a>
        <Link href="/dashboard" style={{ color: '#00c8ff', fontSize: '14px', textDecoration: 'none' }}>← Dashboard</Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <h1 style={{ color: '#f0f8ff', fontSize: '28px', fontWeight: 800, marginBottom: '24px' }}>Panel de Administración</h1>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
          <button style={tabStyle(tab === 'stats')} onClick={() => setTab('stats')}>📊 Estadísticas</button>
          <button style={tabStyle(tab === 'users')} onClick={() => setTab('users')}>👥 Usuarios</button>
          <button style={tabStyle(tab === 'qrs')} onClick={() => setTab('qrs')}>📱 QR Codes</button>
        </div>

        {tab === 'stats' && stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={cardStyle}>
              <div style={{ color: '#6a8a95', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Usuarios totales</div>
              <div style={{ color: '#f0f8ff', fontSize: '36px', fontWeight: 800 }}>{stats.users}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ color: '#6a8a95', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Usuarios activos</div>
              <div style={{ color: '#00c864', fontSize: '36px', fontWeight: 800 }}>{stats.activeUsers}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ color: '#6a8a95', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>QR Codes</div>
              <div style={{ color: '#00c8ff', fontSize: '36px', fontWeight: 800 }}>{stats.qrs}</div>
            </div>
            <div style={cardStyle}>
              <div style={{ color: '#6a8a95', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>Escaneos totales</div>
              <div style={{ color: '#ff6b35', fontSize: '36px', fontWeight: 800 }}>{stats.scans}</div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div style={cardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,200,255,.1)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Nombre</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Estado</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Plan</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>QRs</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Registro</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                      <td style={{ padding: '10px 8px', color: '#f0f8ff' }}>{u.email}</td>
                      <td style={{ padding: '10px 8px' }}>{u.name || '-'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{
                          background: u.status === 'active' ? 'rgba(0,200,100,.15)' : 'rgba(255,107,53,.15)',
                          color: u.status === 'active' ? '#00c864' : '#ff6b35',
                          padding: '3px 10px', borderRadius: '40px', fontSize: '11px', fontWeight: 600,
                        }}>
                          {u.status === 'active' ? 'Activo' : 'Pendiente'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#00c8ff' }}>{u.plan || 'free'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>{u.qr_count}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6a8a95', fontSize: '12px' }}>
                        {new Date(u.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'right', display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {u.status !== 'active' ? (
                          <button style={btnStyle('green')} onClick={() => adminAction('activate', u.id)}>Activar</button>
                        ) : (
                          <button style={btnStyle('blue')} onClick={() => adminAction('deactivate', u.id)}>Desactivar</button>
                        )}
                        <button style={btnStyle('red')} onClick={() => adminAction('delete_user', u.id)}>Borrar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'qrs' && (
          <div style={cardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,200,255,.1)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Código</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Título</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Tipo</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Escaneos</th>
                    <th style={{ textAlign: 'left', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Propietario</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', color: '#6a8a95', fontWeight: 600 }}>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {qrs.map((q: any) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,.03)' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <a href={`/q/${q.public_code}`} target="_blank" style={{ color: '#00c8ff', textDecoration: 'none', fontWeight: 600 }}>{q.public_code}</a>
                      </td>
                      <td style={{ padding: '10px 8px', color: '#f0f8ff' }}>{q.title || '-'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span style={{ background: 'rgba(0,200,255,.1)', color: '#00c8ff', padding: '3px 10px', borderRadius: '40px', fontSize: '11px', fontWeight: 600 }}>
                          {q.object_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#ff6b35', fontWeight: 700 }}>{q.scan_count}</td>
                      <td style={{ padding: '10px 8px', color: '#6a8a95', fontSize: '12px' }}>{q.owner_email || '-'}</td>
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#6a8a95', fontSize: '12px' }}>
                        {new Date(q.created_at).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
