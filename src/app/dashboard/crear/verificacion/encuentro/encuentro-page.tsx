'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../crear.css';
import '../../maquina-tabaco/maquina.css';

const MOTIVOS_ENCUENTRO = [
  { valor: 'compraventa', emoji: '🛒', label: 'Compraventa' },
  { valor: 'entrega', emoji: '📦', label: 'Entrega de paquete/documento' },
  { valor: 'quedada', emoji: '🤝', label: 'Quedada / Cita' },
  { valor: 'recado', emoji: '📝', label: 'Recado / Gestión' },
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

export default function EncuentroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);

  const [form, setForm] = useState({
    motivo: '',
    descripcion: '',
    fecha_prevista: '',
    lugar: '',
    ciudad: '',
    // Persona A (creador)
    nombre_a: '',
    prefijo_a: '+34',
    tel_a: '',
    email_a: '',
    // Persona B (la otra parte)
    nombre_b: '',
    prefijo_b: '+34',
    tel_b: '',
    email_b: '',
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
    if (!form.motivo) vacios.push('motivo');
    if (!form.descripcion) vacios.push('descripcion');
    if (!form.nombre_a) vacios.push('nombre_a');
    if (!form.email_a) vacios.push('email_a');
    if (!form.nombre_b) vacios.push('nombre_b');

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
      const motivoLabel = MOTIVOS_ENCUENTRO.find(m => m.valor === form.motivo)?.label || form.motivo;
      const pinA = String(Math.floor(1000 + Math.random() * 9000));
      const pinB = String(Math.floor(1000 + Math.random() * 9000));

      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'verificacion_encuentro',
          title: `🤝 ${motivoLabel} · ${form.nombre_a} ↔ ${form.nombre_b}`,
          object_data: {
            ...form,
            tel_a: form.tel_a ? form.prefijo_a + form.tel_a.replace(/\s/g, '') : '',
            tel_b: form.tel_b ? form.prefijo_b + form.tel_b.replace(/\s/g, '') : '',
            motivo_label: motivoLabel,
            pin_a: pinA,
            pin_b: pinB,
            verificado_a: false,
            verificado_b: false,
            fecha_verificacion: null,
            object_type: 'verificacion_encuentro',
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al crear el QR');
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
        <div className="crear-chip">🤝 Encuentro / Entrega verificada</div>
        <h1 className="crear-title">Verificación mutua</h1>
        <p className="crear-sub">
          Crea un QR para un encuentro entre dos personas. Ambos recibirán un PIN
          único para verificarse mutuamente. Queda registro con fecha y hora.
        </p>
      </div>

      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>🔐</span>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          Cada persona recibirá un <strong style={{ color: '#00c8ff' }}>PIN de 4 dígitos</strong>.
          Al encontrarse, ambos introducen su PIN para confirmar el encuentro.
          Queda registro con fecha, hora y confirmación mutua.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Motivo del encuentro</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
            {MOTIVOS_ENCUENTRO.map(m => (
              <button
                key={m.valor}
                type="button"
                onClick={() => set('motivo', m.valor)}
                style={{
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: form.motivo === m.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.motivo === m.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.motivo === m.valor ? 'var(--cyan)' : 'var(--muted)',
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
                <span style={{ fontSize: '20px' }}>{m.emoji}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Detalles</div>
          <div className="form-grid">
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Descripción <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Venta de iPhone 15, Entrega documentos notaría, Quedada intercambio..."
                value={form.descripcion} style={inputStyle('descripcion')}
                onChange={e => set('descripcion', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Fecha prevista</label>
              <input type="date"
                value={form.fecha_prevista}
                onChange={e => set('fecha_prevista', e.target.value)}
                style={{ colorScheme: 'dark' }} />
            </div>
            <div className="form-field">
              <label>Lugar</label>
              <input type="text" placeholder="Ej: Plaza del Castillo, Oficina de correos..."
                value={form.lugar}
                onChange={e => set('lugar', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Ciudad</label>
              <input type="text" placeholder="Ej: Pamplona"
                value={form.ciudad}
                onChange={e => set('ciudad', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">👤 Persona A (tú)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Tu nombre <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Juan García"
                value={form.nombre_a} style={inputStyle('nombre_a')}
                onChange={e => set('nombre_a', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Tu teléfono</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.prefijo_a} onChange={e => set('prefijo_a', e.target.value)}
                  style={{ width: '130px', padding: '10px 8px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '13px' }}>
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" placeholder="600 000 000"
                  value={form.tel_a} style={{ flex: 1 }}
                  onChange={e => set('tel_a', e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </div>
            <div className="form-field">
              <label>Tu email <span className="req">*</span></label>
              <input type="email" placeholder="tu@email.com"
                value={form.email_a} style={inputStyle('email_a')}
                onChange={e => set('email_a', e.target.value)} />
              <span className="form-hint">Recibirás confirmación del encuentro aquí</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">👤 Persona B (la otra parte)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Ana López"
                value={form.nombre_b} style={inputStyle('nombre_b')}
                onChange={e => set('nombre_b', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Teléfono</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.prefijo_b} onChange={e => set('prefijo_b', e.target.value)}
                  style={{ width: '130px', padding: '10px 8px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '13px' }}>
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" placeholder="600 000 000"
                  value={form.tel_b} style={{ flex: 1 }}
                  onChange={e => set('tel_b', e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </div>
            <div className="form-field">
              <label>Email</label>
              <input type="email" placeholder="email@ejemplo.com"
                value={form.email_b}
                onChange={e => set('email_b', e.target.value)} />
              <span className="form-hint">Recibirá su PIN y confirmación del encuentro</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Notas adicionales, condiciones de la venta, instrucciones..."
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)} />
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-actions">
          <Link href="/dashboard/crear/verificacion" className="btn-cancel">Cancelar</Link>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando verificación...' : 'Generar QR de encuentro →'}
          </button>
        </div>

      </div>
    </div>
  );
}
