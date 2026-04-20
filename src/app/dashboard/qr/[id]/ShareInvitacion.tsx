'use client';

import { useState } from 'react';

export default function ShareInvitacion({
  data,
  publicCode,
  qrId,
}: {
  data: any;
  publicCode: string;
  qrId: number;
}) {
  const [enviados, setEnviados] = useState<string[]>([]);
  const [enviando, setEnviando] = useState<string | null>(null);
  const [error, setError] = useState('');

  const publicUrl = `https://qrnet.io/q/${publicCode}`;

  const mensajeWA = (nombre: string, pin: string, rol: string) => encodeURIComponent(
    `Hola ${nombre} 👋\n\n` +
    `${rol === 'invitado'
      ? `*${data.nombre_invitador}* te ha invitado a: *${data.descripcion}*`
      : rol === 'establecimiento'
      ? `Tiene una reserva de *${data.nombre_invitador}* para *${data.nombre_invitado}*: *${data.descripcion}*`
      : `Has creado una invitación para *${data.nombre_invitado}*: *${data.descripcion}*`
    }\n\n` +
    (data.fecha ? `📅 Fecha: ${data.fecha}${data.hora ? ` a las ${data.hora}` : ''}\n` : '') +
    (data.num_personas ? `👥 Personas: ${data.num_personas}\n` : '') +
    (data.con_coste && data.limite_gasto && rol === 'establecimiento' ? `💳 Límite: ${data.limite_gasto}\n` : '') +
    `\n🔐 Tu PIN de verificación: *${pin}*\n\n` +
    `Enlace de la invitación:\n👉 ${publicUrl}\n\n` +
    `— Enviado desde QRnet.io`
  );

  const getWAUrl = (tel: string, nombre: string, pin: string, rol: string) => {
    const t = tel.replace(/\s/g, '');
    return t
      ? `https://wa.me/${t}?text=${mensajeWA(nombre, pin, rol)}`
      : `https://wa.me/?text=${mensajeWA(nombre, pin, rol)}`;
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
          nombre_menor: data.descripcion,
          centro: data.tipo_label,
          public_code: publicCode,
          pin: pin,
        }),
      });
      if (res.ok) setEnviados([...enviados, key]);
      else { const d = await res.json(); setError(d.error || 'Error'); }
    } catch { setError('Error de conexión'); }
    setEnviando(null);
  };

  const personas = [
    { nombre: data.nombre_invitador, pin: data.pin_invitador, tel: data.tel_invitador || '', email: data.email_invitador || '', key: 'invitador', rol: 'invitador', label: '👤 Invitador' },
    { nombre: data.nombre_invitado, pin: data.pin_invitado, tel: data.tel_invitado || '', email: data.email_invitado || '', key: 'invitado', rol: 'invitado', label: '🎁 Invitado' },
    ...(data.con_coste && data.nombre_establecimiento ? [{
      nombre: data.nombre_establecimiento, pin: data.pin_establecimiento, tel: data.tel_establecimiento || '', email: data.email_establecimiento || '', key: 'establecimiento', rol: 'establecimiento', label: '🏪 Establecimiento'
    }] : []),
  ];

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
      }}>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          📤 Envía a cada parte su PIN de verificación. Todos lo necesitarán para confirmar la invitación.
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
              <div style={{ color: '#f0f8ff', fontSize: '15px', fontWeight: 700 }}>{p.label}</div>
              <div style={{ color: '#9C8672', fontSize: '13px' }}>{p.nombre}</div>
            </div>
            <div style={{ color: '#00c8ff', fontSize: '13px', fontWeight: 700 }}>
              PIN: {p.pin}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href={getWAUrl(p.tel, p.nombre, p.pin, p.rol)}
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
