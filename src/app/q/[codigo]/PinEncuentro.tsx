'use client';

import { useState } from 'react';

export default function PinEncuentro({
  nombreA,
  nombreB,
  descripcion,
  motivoLabel,
  qrId,
  publicCode,
}: {
  nombreA: string;
  nombreB: string;
  descripcion: string;
  motivoLabel: string;
  qrId: number;
  publicCode: string;
}) {
  const [pinA, setPinA] = useState('');
  const [pinB, setPinB] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<'ok' | 'error' | null>(null);
  const [error, setError] = useState('');

  const verificar = async () => {
    if (pinA.length !== 4 || pinB.length !== 4) {
      setError('Ambos PINs deben ser de 4 dígitos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/qr/verificar-encuentro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_id: qrId, pin_a: pinA, pin_b: pinB }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResultado('ok');
      } else {
        setResultado('error');
        setError(data.error || 'PINs incorrectos');
      }
    } catch {
      setError('Error de conexión');
    }
    setLoading(false);
  };

  if (resultado === 'ok') {
    return (
      <div style={{
        background: 'rgba(0,200,100,.1)',
        border: '2px solid rgba(0,200,100,.4)',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
        <h3 style={{ color: '#00c864', fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>
          ENCUENTRO VERIFICADO
        </h3>
        <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>
          Ambas partes han confirmado el encuentro.
          Se ha enviado un comprobante por email a ambos participantes.
        </p>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e9ecef',
          textAlign: 'left',
          maxWidth: '320px',
          margin: '0 auto',
        }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Motivo</span>
            <div style={{ color: '#1a1a1a', fontSize: '15px', fontWeight: 700 }}>{motivoLabel}</div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Descripción</span>
            <div style={{ color: '#1a1a1a', fontSize: '14px' }}>{descripcion}</div>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Participantes</span>
            <div style={{ color: '#1a1a1a', fontSize: '14px' }}>{nombreA} ↔ {nombreB}</div>
          </div>
          <div>
            <span style={{ color: '#888', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Fecha y hora</span>
            <div style={{ color: '#00c864', fontSize: '14px', fontWeight: 700 }}>
              {new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
            </div>
          </div>
        </div>
        <p style={{ color: '#aaa', fontSize: '12px', marginTop: '20px' }}>
          Código de verificación: {publicCode}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        background: 'rgba(0,200,255,.04)',
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔐</div>
        <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Verificación mutua
        </h3>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
          Cada persona debe introducir su PIN de 4 dígitos para confirmar el encuentro.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '300px', margin: '0 auto' }}>
          <div>
            <label style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              👤 PIN de {nombreA}
            </label>
            <input
              type="text"
              maxLength={4}
              placeholder="0000"
              value={pinA}
              onChange={e => { setPinA(e.target.value.replace(/\D/g, '')); setError(''); setResultado(null); }}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '10px',
                padding: '14px',
                borderRadius: '12px',
                border: resultado === 'error' ? '2px solid rgba(255,80,80,.5)' : '2px solid #ccc',
                background: '#fff',
                color: '#1a1a1a',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ color: '#1a1a1a', fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              👤 PIN de {nombreB}
            </label>
            <input
              type="text"
              maxLength={4}
              placeholder="0000"
              value={pinB}
              onChange={e => { setPinB(e.target.value.replace(/\D/g, '')); setError(''); setResultado(null); }}
              style={{
                width: '100%',
                textAlign: 'center',
                fontSize: '28px',
                fontWeight: 800,
                letterSpacing: '10px',
                padding: '14px',
                borderRadius: '12px',
                border: resultado === 'error' ? '2px solid rgba(255,80,80,.5)' : '2px solid #ccc',
                background: '#fff',
                color: '#1a1a1a',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(255,80,80,.1)',
            border: '1px solid rgba(255,80,80,.3)',
            borderRadius: '10px',
            padding: '12px',
            color: '#ff6b6b',
            fontSize: '14px',
            fontWeight: 700,
            marginTop: '16px',
          }}>
            ❌ {error}
          </div>
        )}

        <button
          onClick={verificar}
          disabled={pinA.length !== 4 || pinB.length !== 4 || loading}
          style={{
            marginTop: '24px',
            width: '100%',
            maxWidth: '300px',
            background: (pinA.length === 4 && pinB.length === 4) ? 'linear-gradient(135deg,#00c8ff,#00e5c0)' : 'rgba(0,0,0,.05)',
            color: (pinA.length === 4 && pinB.length === 4) ? '#000' : '#999',
            border: 'none',
            borderRadius: '40px',
            padding: '15px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: (pinA.length === 4 && pinB.length === 4) ? 'pointer' : 'not-allowed',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Verificando...' : '🔐 Confirmar encuentro'}
        </button>
      </div>
    </div>
  );
}
