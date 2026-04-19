'use client';

import { useState } from 'react';

export default function PinVerificacion({ 
  autorizados, 
  nombreMenor,
  centro,
  publicCode,
}: { 
  autorizados: any[]; 
  nombreMenor: string;
  centro: string;
  publicCode: string;
}) {
  const [pin, setPin] = useState('');
  const [verificado, setVerificado] = useState<any>(null);
  const [error, setError] = useState('');

  const verificar = () => {
    if (pin.length !== 4) {
      setError('Introduce un PIN de 4 dígitos');
      return;
    }
    const persona = autorizados.find(a => a.pin === pin);
    if (persona) {
      setVerificado(persona);
      setError('');
    } else {
      setError('PIN incorrecto. Persona NO autorizada.');
      setVerificado(null);
    }
  };

  if (verificado) {
    return (
      <div>
        <div style={{
          background: 'rgba(0,200,100,.1)',
          border: '2px solid rgba(0,200,100,.4)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
          <h3 style={{ color: '#00c864', fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>
            PERSONA AUTORIZADA
          </h3>
          <div style={{
            background: 'rgba(255,255,255,.05)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '16px',
            textAlign: 'left',
          }}>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Nombre</span>
              <div style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 700 }}>{verificado.nombre}</div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Parentesco</span>
              <div style={{ color: '#1a1a1a', fontSize: '16px' }}>{verificado.parentesco}</div>
            </div>
            {verificado.dni && (
              <div>
                <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>DNI / NIE</span>
                <div style={{ color: '#00c8ff', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>{verificado.dni}</div>
              </div>
            )}
          </div>
        </div>

        <div style={{
          background: 'rgba(255,200,0,.08)',
          border: '1px solid rgba(255,200,0,.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <div style={{ color: '#ffc800', fontSize: '14px', fontWeight: 700 }}>Verificación obligatoria</div>
            <div style={{ color: '#666', fontSize: '13px', lineHeight: '1.5' }}>
              Compruebe que el <strong style={{ color: '#1a1a1a' }}>DNI/NIE físico</strong> de la persona 
              coincide con el que aparece en pantalla antes de entregar al menor.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
            Menor: <strong style={{ color: '#1a1a1a' }}>{nombreMenor}</strong> · Centro: <strong style={{ color: '#1a1a1a' }}>{centro}</strong>
          </p>
          <button onClick={() => { setVerificado(null); setPin(''); }}
            style={{
              background: 'rgba(255,255,255,.05)',
              border: '1px solid rgba(255,255,255,.1)',
              color: '#6a8a95',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
            Verificar otra persona
          </button>
        </div>
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
        marginBottom: '20px',
      }}>
        <div style={{ fontSize: '36px', marginBottom: '16px' }}>🔐</div>
        <h3 style={{ color: '#1a1a1a', fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Verificación de autorización
        </h3>
        <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          Pida a la persona que le facilite su <strong style={{ color: '#1a1a1a' }}>PIN de 4 dígitos</strong> para verificar 
          que está autorizada a recoger al menor.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            maxLength={4}
            placeholder="0000"
            value={pin}
            onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
            style={{
              width: '160px',
              textAlign: 'center',
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '12px',
              padding: '16px',
              borderRadius: '12px',
              border: error ? '2px solid rgba(255,80,80,.5)' : '2px solid rgba(0,200,255,.3)',
              background: 'rgba(255,255,255,.03)',
              color: '#1a1a1a',
              outline: 'none',
            }}
          />
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
            marginBottom: '16px',
          }}>
            ❌ {error}
          </div>
        )}

        <button
          onClick={verificar}
          disabled={pin.length !== 4}
          style={{
            background: pin.length === 4 ? 'linear-gradient(135deg,#00c8ff,#00e5c0)' : 'rgba(255,255,255,.05)',
            color: pin.length === 4 ? '#000' : '#6a8a95',
            border: 'none',
            borderRadius: '40px',
            padding: '14px 40px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: pin.length === 4 ? 'pointer' : 'not-allowed',
          }}
        >
          Verificar autorización
        </button>
      </div>
    </div>
  );
}
