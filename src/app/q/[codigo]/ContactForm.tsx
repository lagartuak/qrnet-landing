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

const MOTIVOS_INVITACION = [
  { valor: "confirmar", emoji: "✅", label: "Confirmar invitación" },
  { valor: "cancelar", emoji: "❌", label: "No puedo asistir" },
  { valor: "cambio", emoji: "🔄", label: "Solicitar cambio de fecha" },
  { valor: "otro", emoji: "📋", label: "Otro" },
];

const MOTIVOS_RECOGIDA = [
  { valor: "recogida_ok", emoji: "✅", label: "Recogida realizada" },
  { valor: "persona_no_autorizada", emoji: "⚠️", label: "Persona no autorizada" },
  { valor: "recogida_tarde", emoji: "🕐", label: "Recogida fuera de horario" },
  { valor: "otro", emoji: "📋", label: "Otro motivo" },
];

const MOTIVOS_OBJETO = [
  { valor: "encontrado", emoji: "🔍", label: "Objeto encontrado" },
  { valor: "danado", emoji: "💥", label: "Objeto dañado" },
  { valor: "robo", emoji: "🚨", label: "Posible robo detectado" },
  { valor: "lugar", emoji: "📍", label: "Visto en un lugar" },
  { valor: "otro", emoji: "📋", label: "Otro motivo" },
];

const MOTIVOS_MASCOTA = [
  { valor: "encontrada", emoji: "🔍", label: "Mascota encontrada" },
  { valor: "perdida", emoji: "📢", label: "Mascota perdida/desorientada" },
  { valor: "herida", emoji: "🚑", label: "Mascota herida" },
  { valor: "sin_agua", emoji: "💧", label: "Sin agua/comida" },
  { valor: "atada", emoji: "🔗", label: "Atada sin dueño" },
  { valor: "otro", emoji: "📋", label: "Otro motivo" },
];

const MOTIVOS_BICICLETA = [
  { valor: 'encontrada', emoji: '🔍', label: 'Bicicleta/patinete encontrado' },
  { valor: 'accidente', emoji: '🚑', label: 'Accidente del propietario' },
  { valor: 'danio', emoji: '💥', label: 'Dañado por otro vehículo' },
  { valor: 'mal_aparcado', emoji: '🅿️', label: 'Mal aparcado / Bloqueando' },
  { valor: 'otro', emoji: '📋', label: 'Otro motivo' },
];

const MOTIVOS_MAQUINA = [
  { valor: 'atascado', emoji: '⚙️', label: 'Producto atascado' },
  { valor: 'cambio', emoji: '💵', label: 'No devuelve cambio' },
  { valor: 'luz', emoji: '💡', label: 'No funciona / Sin luz' },
  { valor: 'danio', emoji: '💥', label: 'Dañado / Cristal roto' },
  { valor: 'otro', emoji: '📋', label: 'Otro problema' },
];

const MOTIVOS_COLA = [
  { valor: 'espera', emoji: '⏳', label: 'Estimado de espera' },
  { valor: 'posicion', emoji: '📍', label: 'Consultar posición' },
  { valor: 'cancelar', emoji: '❌', label: 'Cancelar reserva' },
  { valor: 'cambio', emoji: '🔄', label: 'Cambiar hora' },
  { valor: 'otro', emoji: '📋', label: 'Otro' },
];

export default function ContactForm({ qrId, matricula, tipo = 'vehiculo', notificacion = 'email' }: { qrId: number; matricula: string; tipo?: string; notificacion?: string }) {
  const getMOTIVOS = () => {
    switch (tipo) {
      case 'bicicleta': return MOTIVOS_BICICLETA;
      case 'mascota': return MOTIVOS_MASCOTA;
      case 'objeto': return MOTIVOS_OBJETO;
      case 'maquina': return MOTIVOS_MAQUINA;
      case 'vending': return MOTIVOS_MAQUINA;
      case 'cola': return MOTIVOS_COLA;
      case 'recogida': return MOTIVOS_RECOGIDA;
      case 'encuentro': return MOTIVOS_INVITACION;
      case 'invitacion': return MOTIVOS_INVITACION;
      default: return MOTIVOS_VEHICULO;
    }
  };

  const MOTIVOS = getMOTIVOS();

  const [motivo, setMotivo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [contacto, setContacto] = useState('');
  const [metodoContacto, setMetodoContacto] = useState<'email' | 'whatsapp' | 'anonimo'>('anonimo');
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Determinar qué métodos mostrar según preferencia
  const puedeWhatsApp = notificacion === 'whatsapp' || notificacion === 'ambos';
  const puedeEmail = notificacion === 'email' || notificacion === 'ambos';

  const handleSubmit = async () => {
    if (tipo !== "personal" && !motivo) {
      setError('Selecciona un motivo');
      return;
    }

    // Validar contacto solo si es email
    if (metodoContacto === 'email' && !contacto.trim()) {
      setError('Ingresa tu email para que puedan responderte');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const motivoLabel = tipo === 'personal' ? 'Mensaje privado' : (MOTIVOS.find(m => m.valor === motivo)?.label || motivo);

      // WHATSAPP: usar API que genera wa.me URL directo
      if (metodoContacto === 'whatsapp') {
        const res = await fetch('/api/qr/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ qr_id: qrId, motivo: motivoLabel, mensaje }),
        });
        const data = await res.json();
        if (res.ok && data.waUrl) {
          // Abrir WhatsApp directo
          window.open(data.waUrl, '_blank');
          setEnviado(true);
        } else {
          setError(data.error || 'Error al abrir WhatsApp');
        }
        setLoading(false);
        return;
      }

      // EMAIL / ANÓNIMO: enviar por API notify como antes
      const res = await fetch(tipo === 'personal' ? '/api/qr/message' : '/api/qr/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_id: qrId, motivo: motivoLabel, mensaje, contacto: metodoContacto === 'anonimo' ? '' : contacto, metodoContacto }),
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
        <h3 style={{ color: '#1a1a1a', fontSize: '18px', marginBottom: '8px' }}>
          {metodoContacto === 'whatsapp' ? 'WhatsApp abierto' : 'Aviso enviado'}
        </h3>
        <p style={{ color: '#666', fontSize: '14px' }}>
          {metodoContacto === 'whatsapp'
            ? 'Se ha abierto WhatsApp con los datos del aviso. Pulsa enviar en WhatsApp para completar.'
            : 'El propietario ha sido notificado al instante.\nNo se ha compartido ningún dato ' + (metodoContacto === 'anonimo' ? 'tuyo.' : 'de forma no autorizada.')}
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
        placeholder="Mensaje (opcional): describe qué sucede, dónde, cuándo, etc."
        value={mensaje}
        onChange={e => setMensaje(e.target.value)}
        style={{
          width: '100%',
          background: '#fff',
          border: '1px solid #ccc',
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

      {/* Selector de método de contacto */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ color: '#c8dde5', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>¿Cómo quieres contactar?</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => { setMetodoContacto('anonimo'); setContacto(''); }}
            style={{
              flex: '1 1 100px',
              padding: '12px 16px',
              borderRadius: '10px',
              border: metodoContacto === 'anonimo' ? '2px solid #9C8672' : '1px solid rgba(255,255,255,.1)',
              background: metodoContacto === 'anonimo' ? 'rgba(156,134,114,.15)' : 'rgba(255,255,255,.03)',
              color: metodoContacto === 'anonimo' ? '#9C8672' : '#c8dde5',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            🔒 Anónimo
          </button>

          {puedeEmail && (
            <button
              type="button"
              onClick={() => { setMetodoContacto('email'); setContacto(''); }}
              style={{
                flex: '1 1 100px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: metodoContacto === 'email' ? '2px solid #00c8ff' : '1px solid rgba(255,255,255,.1)',
                background: metodoContacto === 'email' ? 'rgba(0,200,255,.1)' : 'rgba(255,255,255,.03)',
                color: metodoContacto === 'email' ? '#00c8ff' : '#c8dde5',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              ✉️ Email
            </button>
          )}

          {puedeWhatsApp && (
            <button
              type="button"
              onClick={() => { setMetodoContacto('whatsapp'); setContacto(''); }}
              style={{
                flex: '1 1 100px',
                padding: '12px 16px',
                borderRadius: '10px',
                border: metodoContacto === 'whatsapp' ? '2px solid #25d366' : '1px solid rgba(255,255,255,.1)',
                background: metodoContacto === 'whatsapp' ? 'rgba(37,211,102,.1)' : 'rgba(255,255,255,.03)',
                color: metodoContacto === 'whatsapp' ? '#25d366' : '#c8dde5',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              💬 WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* Input de contacto (solo para email) */}
      {metodoContacto === 'email' && (
        <>
          <input
            type="email"
            placeholder="Tu email"
            value={contacto}
            onChange={e => setContacto(e.target.value)}
            style={{
              width: '100%',
              background: '#fff',
              border: '1px solid #ccc',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#1a1a1a',
              outline: 'none',
              marginBottom: '4px',
              fontFamily: 'sans-serif',
            }}
          />
          <p style={{ color: '#ff6b35', fontSize: '11px', marginBottom: '16px', lineHeight: '1.4' }}>
            ⚠️ Sin contacto el propietario no podrá responderte.
          </p>
        </>
      )}

      {metodoContacto === 'whatsapp' && (
        <p style={{ color: '#25d366', fontSize: '12px', marginBottom: '16px', lineHeight: '1.5' }}>
          💬 Se abrirá WhatsApp con los datos del aviso ya incluidos. Solo tendrás que pulsar enviar.
        </p>
      )}

      {metodoContacto === 'anonimo' && (
        <p style={{ color: '#9C8672', fontSize: '12px', marginBottom: '16px', lineHeight: '1.5', fontStyle: 'italic' }}>
          🔒 Tu aviso será completamente anónimo. El propietario verá tu mensaje pero no podrá responder.
        </p>
      )}

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
          background: metodoContacto === 'whatsapp'
            ? 'linear-gradient(135deg,#25d366,#128c7e)'
            : 'linear-gradient(135deg,#00c8ff,#00e5c0)',
          color: '#fff',
          border: 'none',
          borderRadius: '40px',
          padding: '15px',
          fontSize: '15px',
          fontWeight: 700,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Enviando...'
          : metodoContacto === 'whatsapp' ? '💬 Abrir WhatsApp'
          : tipo === 'personal' ? '💬 Enviar mensaje privado'
          : '📲 Enviar aviso al propietario'}
      </button>
      <p style={{ color: '#9C8672', fontSize: '12px', textAlign: 'center', marginTop: '12px', lineHeight: '1.5' }}>
        {metodoContacto === 'whatsapp' ? (
          <>WhatsApp se abrirá con los datos del aviso ya incluidos.<br />Solo describe el problema y pulsa enviar.</>
        ) : metodoContacto === 'anonimo' ? (
          <>Tu identidad es completamente privada.<br />El propietario solo verá tu mensaje y motivo.</>
        ) : (
          <>Tus datos serán usados solo para que puedan responderte.<br />No serán compartidos públicamente.</>
        )}
      </p>
    </div>
  );
}
