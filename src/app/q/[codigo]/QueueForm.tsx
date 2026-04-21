'use client';

import { useState } from 'react';

export default function QueueForm({ qrId, turnos }: { qrId: number; turnos?: any[] }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [comensales, setComensales] = useState('2');
  const [turno, setTurno] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<any>(null);

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('Introduce tu nombre');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/qr/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_id: qrId,
          nombre: nombre.trim(),
          telefono: telefono || null,
          email: email || null,
          comensales: parseInt(comensales) || 1,
          turno: turno || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResultado(data);
      } else {
        setError(data.error || 'Error al registrarse');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  if (resultado) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎉</div>
        <h3 style={{ color: '#1a1a1a', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
          ¡Estás en la cola!
        </h3>
        <div style={{
          background: '#fff', border: '2px solid #00c8ff', borderRadius: '16px',
          padding: '24px', margin: '20px 0', display: 'inline-block',
        }}>
          <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>
            Tu posición
          </div>
          <div style={{ color: '#00c8ff', fontSize: '48px', fontWeight: 800 }}>
            #{resultado.posicion}
          </div>
          <div style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
            Tiempo estimado: <strong style={{ color: '#1a1a1a' }}>~{resultado.tiempo_estimado} min</strong>
          </div>
        </div>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
          {email ? 'Te avisaremos por email cuando tu mesa esté lista.' : 'Mantente atento, te llamaremos cuando sea tu turno.'}
        </p>
        <p style={{ color: '#ff6b35', fontSize: '12px', marginTop: '12px' }}>
          ⚠️ No te alejes del local. Si no acudes cuando te avisen, perderás tu puesto.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Nombre <span style={{ color: '#ff6b35' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={e => { setNombre(e.target.value); setError(''); }}
            style={{
              width: '100%', background: '#fff', border: '1px solid #ccc',
              borderRadius: '12px', padding: '12px 16px', fontSize: '14px',
              color: '#1a1a1a', outline: 'none', fontFamily: 'sans-serif',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Teléfono
            </label>
            <input
              type="tel"
              placeholder="600 000 000"
              value={telefono}
              onChange={e => setTelefono(e.target.value.replace(/[^0-9+]/g, ''))}
              style={{
                width: '100%', background: '#fff', border: '1px solid #ccc',
                borderRadius: '12px', padding: '12px 16px', fontSize: '14px',
                color: '#1a1a1a', outline: 'none',
              }}
            />
          </div>
          <div style={{ width: '80px' }}>
            <label style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Personas
            </label>
            <select
              value={comensales}
              onChange={e => setComensales(e.target.value)}
              style={{
                width: '100%', background: '#fff', border: '1px solid #ccc',
                borderRadius: '12px', padding: '12px 8px', fontSize: '14px',
                color: '#1a1a1a', outline: 'none',
              }}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
            Email (para avisarte)
          </label>
          <input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%', background: '#fff', border: '1px solid #ccc',
              borderRadius: '12px', padding: '12px 16px', fontSize: '14px',
              color: '#1a1a1a', outline: 'none', fontFamily: 'sans-serif',
            }}
          />
          <p style={{ color: '#888', fontSize: '11px', marginTop: '4px' }}>
            Recibirás aviso cuando tu mesa esté lista
          </p>
        </div>

        {turnos && turnos.length > 0 && (
          <div>
            <label style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Turno
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {turnos.map((t: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setTurno(t.nombre)}
                  style={{
                    padding: '10px 16px', borderRadius: '10px',
                    border: turno === t.nombre ? '2px solid #00c8ff' : '1px solid #ccc',
                    background: turno === t.nombre ? 'rgba(0,200,255,.1)' : '#fff',
                    color: turno === t.nombre ? '#00c8ff' : '#333',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t.nombre} ({t.inicio}-{t.fin})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginTop: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%', marginTop: '16px',
          background: 'linear-gradient(135deg,#00c8ff,#00e5c0)',
          color: '#000', border: 'none', borderRadius: '40px',
          padding: '15px', fontSize: '15px', fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? .7 : 1,
        }}
      >
        {loading ? 'Registrando...' : '📋 Unirme a la cola'}
      </button>

      <p style={{ color: '#888', fontSize: '11px', textAlign: 'center', marginTop: '12px' }}>
        Al registrarte aceptas recibir una notificación cuando tu mesa esté lista.
      </p>
    </div>
  );
}
