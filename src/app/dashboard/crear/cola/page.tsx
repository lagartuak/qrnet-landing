'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const TIPOS_LOCAL = [
  { valor: 'restaurante', emoji: '🍽️', label: 'Restaurante' },
  { valor: 'bar', emoji: '🍺', label: 'Bar / Cafetería' },
  { valor: 'tapas', emoji: '🫒', label: 'Bar de tapas' },
  { valor: 'brunch', emoji: '🥞', label: 'Brunch / Desayunos' },
  { valor: 'otro', emoji: '🏪', label: 'Otro' },
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

export default function ColaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [turnos, setTurnos] = useState([
    { nombre: 'Comida', inicio: '13:00', fin: '16:00' },
    { nombre: 'Cena', inicio: '20:00', fin: '23:00' },
  ]);
  const [usaTurnos, setUsaTurnos] = useState(false);

  const [form, setForm] = useState({
    tipo_local: 'restaurante',
    nombre_local: '',
    direccion: '',
    ciudad: '',
    capacidad: '',
    prefijo_tel: '+34',
    tel_local: '',
    email_local: '',
    mensaje_bienvenida: '',
    tiempo_estimado_mesa: '15',
  });

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setCamposError(prev => prev.filter(c => c !== k));
  };

  const inputStyle = (campo: string) => ({
    borderColor: camposError.includes(campo) ? 'rgba(255,80,80,.6)' : undefined,
    background: camposError.includes(campo) ? 'rgba(255,80,80,.05)' : undefined,
  });

  const addTurno = () => {
    setTurnos([...turnos, { nombre: '', inicio: '', fin: '' }]);
  };

  const updateTurno = (i: number, field: string, value: string) => {
    const updated = [...turnos];
    updated[i] = { ...updated[i], [field]: value };
    setTurnos(updated);
  };

  const removeTurno = (i: number) => {
    if (turnos.length > 1) setTurnos(turnos.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setError('');
    const vacios: string[] = [];
    if (!form.nombre_local) vacios.push('nombre_local');
    if (!form.email_local) vacios.push('email_local');

    if (vacios.length > 0) {
      setCamposError(vacios);
      setError('Por favor rellena los campos marcados en rojo (*)');
      return;
    }

    setCamposError([]);
    setLoading(true);
    try {
      const tipoLabel = TIPOS_LOCAL.find(t => t.valor === form.tipo_local)?.label || form.tipo_local;
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'cola',
          title: `📋 Cola · ${form.nombre_local}`,
          object_data: {
            ...form,
            tel_local: form.tel_local ? form.prefijo_tel + form.tel_local.replace(/\s/g, '') : '',
            tipo_label: tipoLabel,
            usa_turnos: usaTurnos,
            turnos: usaTurnos ? turnos.filter(t => t.nombre) : [],
            object_type: 'cola',
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
      <Link href="/dashboard/crear" className="crear-back">← Cambiar tipo</Link>

      <div className="crear-header">
        <div className="crear-chip">📋 Cola / Turno</div>
        <h1 className="crear-title">Gestión de cola de espera</h1>
        <p className="crear-sub">
          Pon un QR en la entrada de tu local. Los clientes escanean, se registran
          y reciben aviso cuando su mesa está lista. Sin apps, sin confusión.
        </p>
      </div>

      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>📱</span>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          El QR se coloca en la <strong style={{ color: '#00c8ff' }}>entrada del local</strong>.
          Los clientes escanean con su móvil y se unen a la cola automáticamente.
          Tú gestionas la cola desde tu panel en tiempo real.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo de local</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {TIPOS_LOCAL.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo_local', t.valor)}
                style={{
                  padding: '12px 16px', borderRadius: '12px',
                  border: form.tipo_local === t.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.tipo_local === t.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.tipo_local === t.valor ? 'var(--cyan)' : 'var(--muted)',
                  cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: 600,
                  transition: '.2s', display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                <span style={{ fontSize: '20px' }}>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Datos del local</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre del local <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Restaurante El Buen Gusto"
                value={form.nombre_local} style={inputStyle('nombre_local')}
                onChange={e => set('nombre_local', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Dirección</label>
              <input type="text" placeholder="Ej: Calle Estafeta 10"
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
              <label>Capacidad (mesas)</label>
              <input type="text" placeholder="Ej: 20"
                value={form.capacidad}
                onChange={e => set('capacidad', e.target.value.replace(/[^0-9]/g, ''))} />
            </div>
            <div className="form-field">
              <label>Tiempo estimado por mesa (min)</label>
              <input type="text" placeholder="Ej: 15"
                value={form.tiempo_estimado_mesa}
                onChange={e => set('tiempo_estimado_mesa', e.target.value.replace(/[^0-9]/g, ''))} />
              <span className="form-hint">Se usa para calcular el tiempo de espera estimado</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Contacto</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Teléfono</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.prefijo_tel} onChange={e => set('prefijo_tel', e.target.value)}
                  style={{ width: '130px', padding: '10px 8px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '13px' }}>
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" placeholder="600 000 000"
                  value={form.tel_local} style={{ flex: 1 }}
                  onChange={e => set('tel_local', e.target.value.replace(/[^0-9]/g, ''))} />
              </div>
            </div>
            <div className="form-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" placeholder="restaurante@email.com"
                value={form.email_local} style={inputStyle('email_local')}
                onChange={e => set('email_local', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Turnos</div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button type="button" onClick={() => setUsaTurnos(false)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                border: !usaTurnos ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                background: !usaTurnos ? 'rgba(0,200,255,.1)' : 'transparent',
                color: !usaTurnos ? 'var(--cyan)' : 'var(--muted)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}>
              Cola continua (sin turnos)
            </button>
            <button type="button" onClick={() => setUsaTurnos(true)}
              style={{
                flex: 1, padding: '12px', borderRadius: '12px',
                border: usaTurnos ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                background: usaTurnos ? 'rgba(0,200,255,.1)' : 'transparent',
                color: usaTurnos ? 'var(--cyan)' : 'var(--muted)',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}>
              Por turnos (comida/cena)
            </button>
          </div>

          {usaTurnos && (
            <>
              {turnos.map((t, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
                  borderRadius: '12px', padding: '16px', marginBottom: '10px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#00c8ff', fontSize: '13px', fontWeight: 700 }}>Turno #{i + 1}</span>
                    {turnos.length > 1 && (
                      <button type="button" onClick={() => removeTurno(i)}
                        style={{ background: 'rgba(255,80,80,.1)', border: 'none', color: '#ff6b6b',
                          padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                        Eliminar
                      </button>
                    )}
                  </div>
                  <div className="form-grid">
                    <div className="form-field">
                      <label>Nombre del turno</label>
                      <input type="text" placeholder="Ej: Comida, Cena..."
                        value={t.nombre}
                        onChange={e => updateTurno(i, 'nombre', e.target.value)} />
                    </div>
                    <div className="form-field">
                      <label>Hora inicio</label>
                      <input type="time" value={t.inicio}
                        onChange={e => updateTurno(i, 'inicio', e.target.value)}
                        style={{ colorScheme: 'dark' }} />
                    </div>
                    <div className="form-field">
                      <label>Hora fin</label>
                      <input type="time" value={t.fin}
                        onChange={e => updateTurno(i, 'fin', e.target.value)}
                        style={{ colorScheme: 'dark' }} />
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addTurno}
                style={{
                  background: 'rgba(0,200,255,.1)', border: '1px solid rgba(0,200,255,.3)',
                  color: '#00c8ff', padding: '8px 20px', borderRadius: '20px',
                  fontSize: '12px', fontWeight: 700, cursor: 'pointer', marginBottom: '16px',
                }}>
                + Añadir turno
              </button>
            </>
          )}
        </div>

        <div className="form-section">
          <div className="form-section-title">Mensaje de bienvenida (opcional)</div>
          <textarea rows={2} placeholder="Ej: ¡Bienvenido! Estamos preparando tu mesa. Te avisamos enseguida."
            value={form.mensaje_bienvenida}
            onChange={e => set('mensaje_bienvenida', e.target.value)} />
          <span className="form-hint" style={{ marginTop: '6px', display: 'block' }}>Se muestra al cliente cuando se registra en la cola</span>
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-actions">
          <Link href="/dashboard/crear" className="btn-cancel">Cancelar</Link>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando cola...' : 'Crear QR de cola →'}
          </button>
        </div>

      </div>
    </div>
  );
}
