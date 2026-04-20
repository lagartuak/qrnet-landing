'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../crear.css';
import '../../maquina-tabaco/maquina.css';

const TIPOS_INVITACION = [
  { valor: 'restaurante', emoji: '🍽️', label: 'Restaurante / Comida' },
  { valor: 'experiencia', emoji: '🎁', label: 'Experiencia / Regalo' },
  { valor: 'evento', emoji: '🎉', label: 'Evento / Fiesta' },
  { valor: 'hotel', emoji: '🏨', label: 'Hotel / Alojamiento' },
  { valor: 'otro', emoji: '📋', label: 'Otro' },
];

const PREFIJOS = [
  { code: '+34', pais: '🇪🇸 España' },
  { code: '+33', pais: '🇫🇷 Francia' },
  { code: '+351', pais: '🇵🇹 Portugal' },
  { code: '+44', pais: '🇬🇧 Reino Unido' },
  { code: '+49', pais: '🇩🇪 Alemania' },
  { code: '+39', pais: '🇮🇹 Italia' },
  { code: '+31', pais: '🇳🇱 Países Bajos' },
  { code: '+32', pais: '🇧🇪 Bélgica' },
  { code: '+41', pais: '🇨🇭 Suiza' },
  { code: '+1', pais: '🇺🇸 EE.UU.' },
];

export default function InvitacionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [conCoste, setConCoste] = useState(true);

  const [form, setForm] = useState({
    tipo: 'restaurante',
    descripcion: '',
    fecha: '',
    hora: '',
    num_personas: '',
    limite_gasto: '',
    // Invitador (quien paga/invita)
    nombre_invitador: '',
    prefijo_invitador: '+34',
    tel_invitador: '',
    email_invitador: '',
    dni_invitador: '',
    // Invitado (quien disfruta)
    nombre_invitado: '',
    prefijo_invitado: '+34',
    tel_invitado: '',
    email_invitado: '',
    // Establecimiento
    nombre_establecimiento: '',
    direccion: '',
    ciudad: '',
    contacto_establecimiento: '',
    tel_establecimiento: '',
    email_establecimiento: '',
    observaciones: '',
  });

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setCamposError(prev => prev.filter(c => c !== k));
  };

  const inputStyle = (campo: string) => ({
    borderColor: camposError.includes(campo) ? 'rgba(255,80,80,.6)' : undefined,
    background: camposError.includes(campo) ? 'rgba(255,80,80,.05)' : undefined,
  });

  const handleSubmit = async () => {
    setError('');
    const vacios: string[] = [];
    if (!form.descripcion) vacios.push('descripcion');
    if (!form.nombre_invitador) vacios.push('nombre_invitador');
    if (!form.email_invitador) vacios.push('email_invitador');
    if (!form.nombre_invitado) vacios.push('nombre_invitado');
    if (conCoste && !form.nombre_establecimiento) vacios.push('nombre_establecimiento');

    if (vacios.length > 0) {
      setCamposError(vacios);
      setError('Por favor rellena los campos marcados en rojo (*)');
      setTimeout(() => {
        document.querySelector('.form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    setCamposError([]);
    setLoading(true);
    try {
      const tipoLabel = TIPOS_INVITACION.find(t => t.valor === form.tipo)?.label || form.tipo;
      const pinInvitador = String(Math.floor(1000 + Math.random() * 9000));
      const pinInvitado = String(Math.floor(1000 + Math.random() * 9000));
      const pinEstablecimiento = String(Math.floor(1000 + Math.random() * 9000));

      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'verificacion_invitacion',
          title: `🎫 ${tipoLabel} · ${form.nombre_invitador} → ${form.nombre_invitado}`,
          object_data: {
            ...form,
            tel_invitador: form.tel_invitador ? form.prefijo_invitador + form.tel_invitador.replace(/\s/g, '') : '',
            tel_invitado: form.tel_invitado ? form.prefijo_invitado + form.tel_invitado.replace(/\s/g, '') : '',
            tipo_label: tipoLabel,
            con_coste: conCoste,
            pin_invitador: pinInvitador,
            pin_invitado: pinInvitado,
            pin_establecimiento: conCoste ? pinEstablecimiento : '',
            estado: 'pendiente',
            coste_final: null,
            fecha_uso: null,
            object_type: 'verificacion_invitacion',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear');
      router.push(`/dashboard/qr/${data.id}`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crear-wrap">
      <Link href="/dashboard/crear/verificacion" className="crear-back">← Cambiar tipo</Link>

      <div className="crear-header">
        <div className="crear-chip">🎫 Invitación / Evento</div>
        <h1 className="crear-title">Crear invitación</h1>
        <p className="crear-sub">
          Invita a alguien a un restaurante, evento o experiencia.
          Cada parte recibirá un PIN de verificación. Queda registro de todo.
        </p>
      </div>

      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>🔐</span>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          Se generarán <strong style={{ color: '#00c8ff' }}>PINs únicos</strong> para cada parte.
          El invitado muestra su PIN en el establecimiento. El establecimiento confirma con el suyo.
          El invitador recibe notificación de todo.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo de invitación</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '20px' }}>
            {TIPOS_INVITACION.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo', t.valor)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: form.tipo === t.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.tipo === t.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.tipo === t.valor ? 'var(--cyan)' : 'var(--muted)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: '.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={() => setConCoste(true)}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                border: conCoste ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                background: conCoste ? 'rgba(0,200,255,.1)' : 'transparent',
                color: conCoste ? 'var(--cyan)' : 'var(--muted)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}>
              💳 Con coste (invitas tú)
            </button>
            <button type="button" onClick={() => setConCoste(false)}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                border: !conCoste ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                background: !conCoste ? 'rgba(0,200,255,.1)' : 'transparent',
                color: !conCoste ? 'var(--cyan)' : 'var(--muted)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}>
              🎉 Sin coste (solo invitación)
            </button>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Detalles de la invitación</div>
          <div className="form-grid">
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Descripción <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Cena de cumpleaños para Ana, Entrada VIP festival..."
                value={form.descripcion} style={inputStyle('descripcion')}
                onChange={e => set('descripcion', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Fecha</label>
              <input type="date" value={form.fecha}
                onChange={e => set('fecha', e.target.value)}
                style={{ colorScheme: 'dark' }} />
            </div>
            <div className="form-field">
              <label>Hora</label>
              <input type="time" value={form.hora}
                onChange={e => set('hora', e.target.value)}
                style={{ colorScheme: 'dark' }} />
            </div>
            <div className="form-field">
              <label>Nº de personas</label>
              <input type="text" placeholder="Ej: 2, 4, 6..."
                value={form.num_personas}
                onChange={e => set('num_personas', e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
            {conCoste && (
              <div className="form-field">
                <label>Límite de gasto</label>
                <input type="text" placeholder="Ej: 150€, Sin límite..."
                  value={form.limite_gasto}
                  onChange={e => set('limite_gasto', e.target.value)} />
                <span className="form-hint">El establecimiento verá este límite</span>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">👤 Invitador (tú)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Tu nombre <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Juan García"
                value={form.nombre_invitador} style={inputStyle('nombre_invitador')}
                onChange={e => set('nombre_invitador', e.target.value)} />
            </div>
            <div className="form-field">
              <label>DNI / NIE</label>
              <input type="text" placeholder="Ej: 12345678A"
                value={form.dni_invitador} style={{ textTransform: 'uppercase' }}
                onChange={e => set('dni_invitador', e.target.value.toUpperCase())} />
            </div>
            <div className="form-field">
              <label>Teléfono</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.prefijo_invitador} onChange={e => set('prefijo_invitador', e.target.value)}
                  style={{ width: '130px', padding: '10px 8px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '13px' }}>
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" placeholder="600 000 000"
                  value={form.tel_invitador} style={{ flex: 1 }}
                  onChange={e => set('tel_invitador', e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </div>
            <div className="form-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" placeholder="tu@email.com"
                value={form.email_invitador} style={inputStyle('email_invitador')}
                onChange={e => set('email_invitador', e.target.value)} />
              <span className="form-hint">Recibirás confirmaciones y el coste final aquí</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">🎁 Invitado (quien disfruta)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Ana López"
                value={form.nombre_invitado} style={inputStyle('nombre_invitado')}
                onChange={e => set('nombre_invitado', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Teléfono</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.prefijo_invitado} onChange={e => set('prefijo_invitado', e.target.value)}
                  style={{ width: '130px', padding: '10px 8px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '13px' }}>
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" placeholder="600 000 000"
                  value={form.tel_invitado} style={{ flex: 1 }}
                  onChange={e => set('tel_invitado', e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" placeholder="email@ejemplo.com"
                value={form.email_invitado}
                onChange={e => set('email_invitado', e.target.value)} />
              <span className="form-hint">Recibirá la invitación con su PIN</span>
            </div>
          </div>
        </div>

        {conCoste && (
          <div className="form-section">
            <div className="form-section-title">🏪 Establecimiento</div>
            <div className="form-grid">
              <div className="form-field">
                <label>Nombre del establecimiento <span className="req">*</span></label>
                <input type="text" placeholder="Ej: Restaurante El Buen Gusto"
                  value={form.nombre_establecimiento} style={inputStyle('nombre_establecimiento')}
                  onChange={e => set('nombre_establecimiento', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Dirección</label>
                <input type="text" placeholder="Ej: Calle Mayor 10"
                  value={form.direccion}
                  onChange={e => set('direccion', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Ciudad</label>
                <input type="text" placeholder="Ej: Pamplona"
                  value={form.ciudad}
                  onChange={e => set('ciudad', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Persona de contacto</label>
                <input type="text" placeholder="Ej: Carlos (maître)"
                  value={form.contacto_establecimiento}
                  onChange={e => set('contacto_establecimiento', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Teléfono</label>
                <input type="tel" placeholder="+34 948 000 000"
                  value={form.tel_establecimiento}
                  onChange={e => set('tel_establecimiento', e.target.value)} />
              </div>
              <div className="form-field">
                <label>Email</label>
                <input type="email" placeholder="restaurante@email.com"
                  value={form.email_establecimiento}
                  onChange={e => set('email_establecimiento', e.target.value)} />
                <span className="form-hint">Recibirá confirmación y podrá informar del coste</span>
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Alergias, preferencias, mesa reservada, condiciones especiales..."
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)} />
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-actions">
          <Link href="/dashboard/crear/verificacion" className="btn-cancel">Cancelar</Link>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando invitación...' : 'Generar invitación QR →'}
          </button>
        </div>

      </div>
    </div>
  );
}
