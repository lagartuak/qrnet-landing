'use client';
import { useState } from 'react';

const OPCIONES = [
  { val: 'sms', emoji: '📱', label: 'SMS' },
  { val: 'email', emoji: '✉️', label: 'Email' },
  { val: 'whatsapp', emoji: '💬', label: 'WhatsApp' },
  { val: 'ambos', emoji: '📲', label: 'Todos' },
];

export default function NotificacionEdit({ qrId, inicial }: { qrId: number; inicial: string }) {
  const [valor, setValor] = useState(inicial || 'sms');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const cambiar = async (nuevo: string) => {
    setValor(nuevo);
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/qr/${qrId}/notificacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificacion: nuevo }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#0d1a20', borderRadius: '20px', padding: '24px 32px', border: '1px solid rgba(0,200,255,.15)', marginBottom: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: '#6a8a95', textTransform: 'uppercase', letterSpacing: '.12em', fontWeight: 600 }}>
          Preferencia de notificación
        </div>
        <span style={{ fontSize: '11px', color: saving ? '#ffc800' : saved ? '#00c864' : 'transparent', transition: 'color .3s' }}>
          {saving ? '💾 Guardando...' : saved ? '✅ Guardado' : '·'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {OPCIONES.map(o => (
          <button
            key={o.val}
            onClick={() => cambiar(o.val)}
            style={{
              flex: '1 1 60px',
              padding: '10px 8px',
              borderRadius: '10px',
              border: valor === o.val ? '2px solid #00c8ff' : '1px solid rgba(255,255,255,.1)',
              background: valor === o.val ? 'rgba(0,200,255,.1)' : 'transparent',
              color: valor === o.val ? '#00c8ff' : '#6a8a95',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{o.emoji}</span>
            {o.label}
          </button>
        ))}
      </div>
      <p style={{ color: '#6a8a95', fontSize: '11px', marginTop: '10px', lineHeight: '1.4' }}>
        Elige cómo quieres que te contacten al escanear tu QR.
      </p>
    </div>
  );
}
