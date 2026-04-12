'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const TIPOS_VEHICULO = [
  { valor: 'coche', emoji: '🚗', label: 'Coche' },
  { valor: 'moto', emoji: '🏍️', label: 'Moto' },
  { valor: 'furgoneta', emoji: '🚐', label: 'Furgoneta' },
  { valor: 'camion', emoji: '🚛', label: 'Camión' },
  { valor: 'autocaravana', emoji: '🏕️', label: 'Autocaravana' },
  { valor: 'otro', emoji: '🚙', label: 'Otro' },
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

export default function VehiculoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    tipo_vehiculo: 'coche',
    matricula: '',
    marca: '',
    modelo: '',
    color: '',
    anio: '',
    num_bastidor: '',
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
    if (!form.matricula) vacios.push('matricula');
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
      const tipoLabel = TIPOS_VEHICULO.find(t => t.valor === form.tipo_vehiculo)?.label || form.tipo_vehiculo;
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'vehiculo',
          title: `${tipoLabel} · ${form.marca} ${form.modelo} · ${form.matricula}`,
          object_data: {
            ...form,
            tel_propietario: form.prefijo_tel + form.tel_propietario.replace(/\s/g, ''),
            object_type: 'vehiculo',
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
        <div className="crear-chip">🚗 Vehículo</div>
        <h1 className="crear-title">Registra tu vehículo</h1>
        <p className="crear-sub">
          Crea un QR único para tu vehículo. Quien lo escanee podrá contactarte
          de forma anónima sin conocer tus datos personales.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo de vehículo</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {TIPOS_VEHICULO.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo_vehiculo', t.valor)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: form.tipo_vehiculo === t.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.tipo_vehiculo === t.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.tipo_vehiculo === t.valor ? 'var(--cyan)' : 'var(--muted)',
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
              <label>Matrícula <span className="req">*</span></label>
              <input type="text" placeholder="Ej: 1234 ABC"
                value={form.matricula} style={{ ...inputStyle('matricula'), textTransform: 'uppercase' }}
                onChange={e => set('matricula', e.target.value.toUpperCase())} />
            </div>
            <div className="form-field">
              <label>Marca <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Volkswagen, Seat, BMW..."
                value={form.marca} style={inputStyle('marca')}
                onChange={e => set('marca', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Modelo <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Golf, Ibiza, Serie 3..."
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
              <input type="text" placeholder="Ej: 2022" maxLength={4}
                value={form.anio}
                onChange={e => set('anio', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Número de bastidor (VIN)</label>
              <input type="text" placeholder="Ej: WVWZZZ1KZAW000001"
                value={form.num_bastidor} style={{ textTransform: 'uppercase' }}
                onChange={e => set('num_bastidor', e.target.value.toUpperCase())} />
              <span className="form-hint">17 caracteres. Aumenta la seguridad del registro</span>
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
                <input type="tel" placeholder="600 000 000"
                  value={form.tel_propietario} style={{ ...inputStyle('tel_propietario'), flex: 1 }}
                  onChange={e => set('tel_propietario', e.target.value)} />
              </div>
              <span className="form-hint">Recibirás las notificaciones en este número (SMS/WhatsApp)</span>
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
              <input type="text" placeholder="Ej: Mapfre, Línea Directa, AXA..."
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
              <input type="tel" placeholder="+34 600 000 000"
                value={form.tel_emergencia}
                onChange={e => set('tel_emergencia', e.target.value)} />
              <span className="form-hint">Se usará solo en caso de emergencia verificada</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Notas adicionales sobre el vehículo, ubicación habitual, etc."
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
