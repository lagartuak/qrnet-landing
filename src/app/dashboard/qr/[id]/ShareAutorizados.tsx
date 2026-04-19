'use client';

import { useState } from 'react';

interface Autorizado {
  nombre: string;
  parentesco: string;
  dni?: string;
  telefono?: string;
  email?: string;
}

export default function ShareAutorizados({ 
  autorizados, 
  nombreMenor, 
  centro, 
  publicCode,
  qrId 
}: { 
  autorizados: Autorizado[]; 
  nombreMenor: string; 
  centro: string; 
  publicCode: string;
  qrId: number;
}) {
  const [enviando, setEnviando] = useState<string | null>(null);
  const [enviados, setEnviados] = useState<string[]>([]);
  const [error, setError] = useState('');

  const publicUrl = `https://qrnet.io/q/${publicCode}`;

  const mensajeWA = (nombre: string) => encodeURIComponent(
    `Hola ${nombre} 👋\n\n` +
    `Has sido autorizado/a para recoger a *${nombreMenor}* en *${centro}*.\n\n` +
    `Cuando vayas a recogerlo/a, muestra este enlace al centro:\n` +
    `👉 ${publicUrl}\n\n` +
    `Tu PIN de verificación es: *${a.pin || 'N/A'}*
Muestra este PIN junto con tu DNI al recoger al menor ✅\n\n` +
    `— Enviado desde QRnet.io`
  );

  const enviarEmail = async (autorizado: Autorizado, index: number) => {
    if (!autorizado.email) {
      setError(`${autorizado.nombre} no tiene email registrado`);
      return;
    }
    setEnviando(`email-${index}`);
    setError('');
    try {
      const res = await fetch('/api/qr/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qr_id: qrId,
          pin: a.pin || '',
          to_email: autorizado.email,
          to_name: autorizado.nombre,
          nombre_menor: nombreMenor,
          centro: centro,
          public_code: publicCode,
        }),
      });
      if (res.ok) {
        setEnviados([...enviados, `email-${index}`]);
      } else {
        const data = await res.json();
        setError(data.error || 'Error al enviar');
      }
    } catch {
      setError('Error de conexión');
    }
    setEnviando(null);
  };

  const compartirWhatsApp = (autorizado: Autorizado, index: number) => {
    const tel = (autorizado.telefono || '').replace(/\s/g, '');
    const url = tel 
      ? `https://wa.me/${tel}?text=${mensajeWA(autorizado.nombre)}`
      : `https://wa.me/?text=${mensajeWA(autorizado.nombre)}`;
    window.location.href = url;
    setEnviados([...enviados, `wa-${index}`]);
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '20px',
      }}>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          📤 Comparte la autorización con cada persona. Pueden usar el enlace para identificarse en el centro.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {autorizados.map((a, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,.02)',
          border: '1px solid rgba(255,255,255,.06)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ color: '#f0f8ff', fontSize: '15px', fontWeight: 700 }}>{a.nombre}</div>
              <div style={{ color: '#9C8672', fontSize: '13px' }}>{a.parentesco}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => compartirWhatsApp(a, i)}
              style={{
                background: enviados.includes(`wa-${i}`) ? 'rgba(0,200,100,.15)' : 'rgba(37,211,102,.15)',
                color: enviados.includes(`wa-${i}`) ? '#00c864' : '#25d366',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {enviados.includes(`wa-${i}`) ? '✅ Enviado' : '💬 WhatsApp'}
            </button>
            <button
              onClick={() => enviarEmail(a, i)}
              disabled={enviando === `email-${i}` || !a.email}
              style={{
                background: enviados.includes(`email-${i}`) ? 'rgba(0,200,100,.15)' : a.email ? 'rgba(0,200,255,.15)' : 'rgba(255,255,255,.05)',
                color: enviados.includes(`email-${i}`) ? '#00c864' : a.email ? '#00c8ff' : '#6a8a95',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: a.email ? 'pointer' : 'not-allowed',
                opacity: enviando === `email-${i}` ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {enviados.includes(`email-${i}`) ? '✅ Enviado' : enviando === `email-${i}` ? '⏳ Enviando...' : a.email ? '✉️ Email' : '✉️ Sin email'}
            </button>
          </div>
        </div>
      ))}

      <div style={{
        marginTop: '16px', padding: '12px 16px',
        background: 'rgba(255,255,255,.02)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <span style={{ color: '#6a8a95', fontSize: '13px', flex: 1 }}>
          Enlace directo: <a href={publicUrl} target="_blank" style={{ color: '#00c8ff', textDecoration: 'none' }}>{publicUrl}</a>
        </span>
        <button
          onClick={() => { navigator.clipboard.writeText(publicUrl); }}
          style={{
            background: 'rgba(0,200,255,.1)', border: '1px solid rgba(0,200,255,.2)',
            color: '#00c8ff', padding: '8px 16px', borderRadius: '8px',
            fontSize: '12px', fontWeight: 700, cursor: 'pointer',
          }}
        >
          📋 Copiar
        </button>
      </div>
    </div>
  );
}
