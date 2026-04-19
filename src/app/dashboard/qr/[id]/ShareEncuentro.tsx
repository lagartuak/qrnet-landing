'use client';

import { useState } from 'react';

export default function ShareEncuentro({
  nombreA,
  nombreB,
  pinA,
  pinB,
  telA,
  telB,
  emailA,
  emailB,
  descripcion,
  motivoLabel,
  publicCode,
  qrId,
}: {
  nombreA: string;
  nombreB: string;
  pinA: string;
  pinB: string;
  telA?: string;
  telB?: string;
  emailA?: string;
  emailB?: string;
  descripcion: string;
  motivoLabel: string;
  publicCode: string;
  qrId: number;
}) {
  const [enviados, setEnviados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState('');

  const publicUrl = `https://qrnet.io/q/${publicCode}`;

  const mensajeWA = (nombre: string, pin: string) => encodeURIComponent(
    `Hola ${nombre} 👋\n\n` +
    `Tienes un encuentro verificado en QRnet:\n` +
    `📋 *${motivoLabel}*: ${descripcion}\n\n` +
    `🔐 Tu PIN de verificación: *${pin}*\n\n` +
    `Cuando os encontréis, ambos debéis introducir vuestro PIN aquí:\n` +
    `👉 ${publicUrl}\n\n` +
    `Esto certifica el encuentro con fecha y hora ✅\n\n` +
    `— Enviado desde QRnet.io`
  );

  const getWAUrl = (tel: string, nombre: string, pin: string) => {
    const t = tel.replace(/\s/g, '');
    return t
      ? `https://wa.me/${t}?text=${mensajeWA(nombre, pin)}`
      : `https://wa.me/?text=${mensajeWA(nombre, pin)}`;
  };

  const enviarEmail = async (email: string, nombre: string, pin: string, key: string) => {
    if (!email) { setError(`${nombre} no tiene email registrado`); return; }
    setEnviando(key);
    setError('');
    try {
      const res = await fetch('/api/qr/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_id: qrId,
          to_email: email,
          to_name: nombre,
          nombre_menor: descripcion,
          centro: motivoLabel,
          public_code: publicCode,
          pin: pin,
        }),
      });
      if (res.ok) setEnviados([...enviados, key]);
      else { const d = await res.json(); setError(d.error || 'Error al enviar'); }
    } catch { setError('Error de conexión'); }
    setEnviando(null);
  };

  const personas = [
    { nombre: nombreA, pin: pinA, tel: telA || '', email: emailA || '', key: 'a' },
    { nombre: nombreB, pin: pinB, tel: telB || '', email: emailB || '', key: 'b' },
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
      }}>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          📤 Envía a cada persona su PIN de verificación. Ambos lo necesitarán al encontrarse.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {personas.map(p => (
        <div key={p.key} style={{
          background: 'rgba(255,255,255,.02)',
          border: '1px solid rgba(255,255,255,.06)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ color: '#f0f8ff', fontSize: '15px', fontWeight: 700 }}>👤 {p.nombre}</div>
              <div style={{ color: '#9C8672', fontSize: '13px' }}>Persona {p.key.toUpperCase()}</div>
            </div>
            <div style={{ color: '#00c8ff', fontSize: '13px', fontWeight: 700 }}>
              PIN: {p.pin}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href={getWAUrl(p.tel, p.nombre, p.pin)}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(37,211,102,.15)', color: '#25d366',
                border: 'none', padding: '10px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 700, textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              💬 WhatsApp
            </a>
            <button
              onClick={() => enviarEmail(p.email, p.nombre, p.pin, `email-${p.key}`)}
              disabled={enviando === `email-${p.key}` || !p.email}
              style={{
                background: enviados.includes(`email-${p.key}`) ? 'rgba(0,200,100,.15)' : p.email ? 'rgba(0,200,255,.15)' : 'rgba(255,255,255,.05)',
                color: enviados.includes(`email-${p.key}`) ? '#00c864' : p.email ? '#00c8ff' : '#6a8a95',
                border: 'none', padding: '10px 20px', borderRadius: '10px',
                fontSize: '13px', fontWeight: 700,
                cursor: p.email ? 'pointer' : 'not-allowed',
                opacity: enviando === `email-${p.key}` ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {enviados.includes(`email-${p.key}`) ? '✅ Enviado' : enviando === `email-${p.key}` ? '⏳...' : p.email ? '✉️ Email' : '✉️ Sin email'}
            </button>
          </div>
        </div>
      ))}

      <div style={{
        marginTop: '16px', padding: '12px 16px',
        background: 'rgba(255,255,255,.02)', borderRadius: '10px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ color: '#6a8a95', fontSize: '13px', flex: 1 }}>
          Enlace: <a href={publicUrl} target="_blank" style={{ color: '#00c8ff', textDecoration: 'none' }}>{publicUrl}</a>
        </span>
        <button onClick={() => navigator.clipboard.writeText(publicUrl)}
          style={{ background: 'rgba(0,200,255,.1)', border: '1px solid rgba(0,200,255,.2)',
            color: '#00c8ff', padding: '8px 16px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
          📋 Copiar
        </button>
      </div>
    </div>
  );
}
