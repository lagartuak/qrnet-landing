'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const TIPOS = [
  { valor: 'bicicleta', emoji: '🚲', label: 'Bicicleta' },
  { valor: 'ebike', emoji: '⚡', label: 'Bicicleta eléctrica' },
  { valor: 'patinete', emoji: '🛴', label: 'Patinete eléctrico' },
  { valor: 'otro', emoji: '🛹', label: 'Otro' },
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

export default function BicicletaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    tipo: 'bicicleta',
    marca: '',
    modelo: '',
    color: '',
    anio: '',
    num_serie: '',
    talla: '',
    prefijo_tel: '+34',
    tel_propietario: '',
    email_propietario: '',
    aseguradora: '',
    num_poliza: '',
    contacto_emergencia: '',
    tel_emergencia: '',
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
    if (!form.marca) vacios.push('marca');
    if (!form.modelo) vacios.push('modelo');
    if (!form.tel_propietario) vacios.push('tel_propietario');

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
      const tipoLabel = TIPOS.find(t => t.valor === form.tipo)?.label || form.tipo;
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'bicicleta',
          title: `${tipoLabel} · ${form.marca} ${form.modelo}`,
          object_data: {
            ...form,
            tel_propietario: form.prefijo_tel + form.tel_propietario.replace(/\s/g, ''),
            object_type: 'bicicleta',
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
      <Link href="/dashboard/crear" className="crear-back">← Cambiar tipo</Link>

      <div className="crear-header">
        <div className="crear-chip">🚲 Bicicleta / Patinete</div>
        <h1 className="crear-title">Registra tu bicicleta o patinete</h1>
        <p className="crear-sub">
          Crea un QR único. Si alguien lo encuentra o necesita contactarte,
          podrá hacerlo de forma anónima sin conocer tus datos personales.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {TIPOS.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo', t.valor)}
                style={{
                  padding: '12px 16px',
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
        </div>

        <div className="form-section">
          <div className="form-section-title">Datos del vehículo</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Marca <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Orbea, Xiaomi, Trek..."
                value={form.marca} style={inputStyle('marca')}
                onChange={e => set('marca', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Modelo <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Alma M50, Mi Scooter Pro 2..."
                value={form.modelo} style={inputStyle('modelo')}
                onChange={e => set('modelo', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Color</label>
              <input type="text" placeholder="Ej: Negro, Blanco, Rojo..."
                value={form.color}
                onChange={e => set('color', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Año</label>
              <input type="text" placeholder="Ej: 2023" maxLength={4}
                value={form.anio}
                onChange={e => set('anio', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Número de serie</label>
              <input type="text" placeholder="Suele estar en el cuadro o bajo el pedal"
                value={form.num_serie} style={{ textTransform: 'uppercase' }}
                onChange={e => set('num_serie', e.target.value.toUpperCase())} />
              <span className="form-hint">Imprescindible para denuncias de robo</span>
            </div>
            <div className="form-field">
              <label>Talla</label>
              <input type="text" placeholder="Ej: M, L, 54cm..."
                value={form.talla}
                onChange={e => set('talla', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Propietario y contacto</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Teléfono del propietario <span className="req">*</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={form.prefijo_tel}
                  onChange={e => set('prefijo_tel', e.target.value)}
                  style={{
                    width: '130px',
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff',
                    fontSize: '13px',
                  }}
                >
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="600 000 000"
                  value={form.tel_propietario} style={{ ...inputStyle('tel_propietario'), flex: 1 }}
                  onChange={e => set('tel_propietario', e.target.value)} />
              </div>
              <span className="form-hint">Recibirás las notificaciones en este número</span>
            </div>
            <div className="form-field">
              <label>Email del propietario</label>
              <input type="email" placeholder="tu@email.com"
                value={form.email_propietario}
                onChange={e => set('email_propietario', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Seguro (opcional)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Compañía aseguradora</label>
              <input type="text" placeholder="Ej: Zurich, Decathlon, Kleta..."
                value={form.aseguradora}
                onChange={e => set('aseguradora', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Nº de póliza</label>
              <input type="text" placeholder="Ej: POL-123456789"
                value={form.num_poliza}
                onChange={e => set('num_poliza', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Contacto de emergencia (opcional)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre contacto emergencia</label>
              <input type="text" placeholder="Ej: María García (pareja)"
                value={form.contacto_emergencia}
                onChange={e => set('contacto_emergencia', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Teléfono emergencia</label>
              <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="+34 600 000 000"
                value={form.tel_emergencia}
                onChange={e => set('tel_emergencia', e.target.value)} />
              <span className="form-hint">Se usará solo en caso de emergencia verificada</span>
            </div>
          </div>
        </div>

        <div className="form-section">

        <div className="form-section">
          <div className="form-section-title">Preferencia de notificación</div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            ¿Cómo quieres recibir los avisos cuando alguien escanee tu QR?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { val: 'email', emoji: '✉️', label: 'Email' },
              { val: 'whatsapp', emoji: '💬', label: 'WhatsApp' },
              { val: 'ambos', emoji: '📲', label: 'Ambos' },
            ].map(n => (
              <button key={n.val} type="button" onClick={() => set('notificacion', n.val)}
                style={{
                  flex: 1, padding: '14px', borderRadius: '12px',
                  border: form.notificacion === n.val ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.notificacion === n.val ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.notificacion === n.val ? 'var(--cyan)' : 'var(--muted)',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600, textAlign: 'center',
                }}>
                <span style={{ fontSize: '20px', display: 'block', marginBottom: '4px' }}>{n.emoji}</span>
                {n.label}
              </button>
            ))}
          </div>
        </div>
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Notas adicionales: ubicación habitual, candado, accesorios..."
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)} />
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-actions">
          <Link href="/dashboard/crear" className="btn-cancel">Cancelar</Link>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando QR...' : 'Generar QR →'}
          </button>
        </div>

      </div>
    </div>
  );
}
