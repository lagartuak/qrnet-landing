'use client';

import { useState } from 'react';

const MOTIVOS_VEHICULO = [
  { valor: 'luces', emoji: '💡', label: 'Luces encendidas' },
  { valor: 'golpe', emoji: '💥', label: 'Golpe / Accidente' },
  { valor: 'mal_aparcado', emoji: '🅿️', label: 'Mal aparcado / Bloqueando' },
  { valor: 'alarma', emoji: '🔊', label: 'Alarma sonando' },
  { valor: 'ventana', emoji: '🪟', label: 'Ventana abierta' },
  { valor: 'rueda', emoji: '🛞', label: 'Rueda pinchada' },
  { valor: 'otro', emoji: '📋', label: 'Otro motivo' },
];

const MOTIVOS_BICICLETA = [
  { valor: 'encontrada', emoji: '🔍', label: 'Bicicleta/patinete encontrado' },
  { valor: 'accidente', emoji: '🚑', label: 'Accidente del propietario' },
  { valor: 'danio', emoji: '💥', label: 'Dañado por otro vehículo' },
  { valor: 'mal_aparcado', emoji: '🅿️', label: 'Mal aparcado / Bloqueando' },
  { valor: 'robo_intento', emoji: '🔒', label: 'Intento de robo detectado' },
  { valor: 'candado', emoji: '🔓', label: 'Candado roto / abierto' },
  { valor: 'otro', emoji: '📋', label: 'Otro motivo' },
];

export default function ContactForm({ qrId, matricula, tipo = 'vehiculo' }: { qrId: number; matricula: string; tipo?: string }) {
  const MOTIVOS = tipo === 'personal' ? [] : tipo === 'bicicleta' ? MOTIVOS_BICICLETA : MOTIVOS_VEHICULO;
  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (tipo !== "personal" && !motivo) {
      setError('Selecciona un motivo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const motivoLabel = tipo === 'personal' ? 'Mensaje privado' : (MOTIVOS.find(m => m.valor === motivo)?.label || motivo);
      const res = await fetch(tipo === 'personal' ? '/api/qr/message' : '/api/qr/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_id: qrId, motivo: motivoLabel, mensaje }),
      });
      if (res.ok) {
        setEnviado(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al enviar');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  if (enviado) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
        <h3 style={{ color: '#1a1a1a', fontSize: '18px', marginBottom: '8px' }}>Aviso enviado</h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          El propietario ha sido notificado al instante.<br />
          No se han compartido tus datos personales.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        {MOTIVOS.map(m => (
          <button
            key={m.valor}
            type="button"
            onClick={() => { setMotivo(m.valor); setError(''); }}
            style={{
              padding: '14px 12px',
              borderRadius: '12px',
              border: motivo === m.valor ? '2px solid #00c8ff' : '1px solid rgba(255,255,255,.1)',
              background: motivo === m.valor ? 'rgba(0,200,255,.1)' : 'rgba(255,255,255,.03)',
              color: motivo === m.valor ? '#00c8ff' : '#c8dde5',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: '.2s',
            }}
          >
            <span style={{ fontSize: '20px' }}>{m.emoji}</span>
            {m.label}
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        placeholder="Mensaje adicional (opcional)"
        value={mensaje}
        onChange={e => setMensaje(e.target.value)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,.03)',
          border: '1px solid rgba(255,255,255,.1)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '14px',
          color: '#1a1a1a',
          outline: 'none',
          resize: 'none',
          marginBottom: '16px',
          fontFamily: 'sans-serif',
        }}
      />

      {error && (
        <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg,#00c8ff,#00e5c0)',
          color: '#000',
          border: 'none',
          borderRadius: '40px',
          padding: '15px',
          fontSize: '15px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? .7 : 1,
        }}
      >
        {loading ? 'Enviando...' : tipo === 'personal' ? '💬 Enviar mensaje privado' : '📲 Enviar aviso al propietario'}
      </button>

      <p style={{ color: '#9C8672', fontSize: '12px', textAlign: 'center', marginTop: '12px', lineHeight: '1.5' }}>
        Tu identidad es completamente anónima.<br />
        El propietario solo recibirá el motivo y el mensaje.
      </p>
    </div>
  );
}