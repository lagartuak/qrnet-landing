'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const TIPOS_OBJETO = [
  { valor: 'llaves', emoji: '🔑', label: 'Llaves / Llavero' },
  { valor: 'cartera', emoji: '👛', label: 'Cartera / Billetera' },
  { valor: 'mochila', emoji: '🎒', label: 'Mochila / Bolso' },
  { valor: 'maleta', emoji: '🧳', label: 'Maleta / Equipaje' },
  { valor: 'portatil', emoji: '💻', label: 'Portátil / Tablet' },
  { valor: 'camara', emoji: '📷', label: 'Cámara de fotos' },
  { valor: 'auriculares', emoji: '🎧', label: 'Auriculares' },
  { valor: 'instrumento', emoji: '🎸', label: 'Instrumento musical' },
  { valor: 'deporte', emoji: '⚽', label: 'Equipo deportivo' },
  { valor: 'paraguas', emoji: '☂️', label: 'Paraguas' },
  { valor: 'gafas', emoji: '👓', label: 'Gafas' },
  { valor: 'herramientas', emoji: '🔧', label: 'Herramientas' },
  { valor: 'otro', emoji: '📦', label: 'Otro objeto' },
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

export default function ObjetoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    tipo_objeto: 'llaves',
    descripcion: '',
    marca: '',
    modelo: '',
    color: '',
    num_serie: '',
    valor_aprox: '',
    recompensa: 'no',
    recompensa_cantidad: '',
    prefijo_tel: '+34',
    tel_propietario: '',
    email_propietario: '',
    nombre_propietario: '',
    ciudad: '',
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
    if (!form.descripcion) vacios.push('descripcion');
    if (!form.tel_propietario) vacios.push('tel_propietario');
    if (!form.email_propietario) vacios.push('email_propietario');

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
      const tipoLabel = TIPOS_OBJETO.find(t => t.valor === form.tipo_objeto)?.label || form.tipo_objeto;
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'objeto',
          title: `${tipoLabel} · ${form.descripcion}`,
          object_data: {
            ...form,
            tel_propietario: form.prefijo_tel + form.tel_propietario.replace(/\s/g, ''),
            object_type: 'objeto',
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
        <div className="crear-chip">🎒 Objeto Personal</div>
        <h1 className="crear-title">Registra tu objeto</h1>
        <p className="crear-sub">
          Pega un QR en cualquier objeto de valor. Si lo pierdes, quien lo encuentre
          podrá contactarte al instante para devolvértelo.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo de objeto</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
            {TIPOS_OBJETO.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo_objeto', t.valor)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: form.tipo_objeto === t.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.tipo_objeto === t.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.tipo_objeto === t.valor ? 'var(--cyan)' : 'var(--muted)',
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
                <span style={{ fontSize: '18px' }}>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Datos del objeto</div>
          <div className="form-grid">
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Descripción <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Mochila negra North Face, Cartera marrón con iniciales JG..."
                value={form.descripcion} style={inputStyle('descripcion')}
                onChange={e => set('descripcion', e.target.value)} />
              <span className="form-hint">Describe el objeto para que quien lo encuentre pueda identificarlo</span>
            </div>
            <div className="form-field">
              <label>Marca</label>
              <input type="text" placeholder="Ej: Apple, Samsonite, Ray-Ban..."
                value={form.marca}
                onChange={e => set('marca', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Modelo</label>
              <input type="text" placeholder="Ej: MacBook Pro 14, Cabin S..."
                value={form.modelo}
                onChange={e => set('modelo', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Color</label>
              <input type="text" placeholder="Ej: Negro, Marrón, Azul..."
                value={form.color}
                onChange={e => set('color', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Número de serie</label>
              <input type="text" placeholder="Si lo tiene (portátiles, cámaras...)"
                value={form.num_serie} style={{ textTransform: 'uppercase' }}
                onChange={e => set('num_serie', e.target.value.toUpperCase())} />
              <span className="form-hint">Útil para denuncias de robo</span>
            </div>
            <div className="form-field">
              <label>Valor aproximado</label>
              <input type="text" placeholder="Ej: 500€, 1.200€..."
                value={form.valor_aprox}
                onChange={e => set('valor_aprox', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">🎁 Recompensa por devolución</div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            Ofrecer una recompensa puede motivar a quien encuentre tu objeto a devolverlo.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            {[
              { val: 'no', label: 'Sin recompensa' },
              { val: 'si', label: 'Ofrecer recompensa' },
            ].map(r => (
              <button key={r.val} type="button" onClick={() => set('recompensa', r.val)}
                style={{
                  flex: 1, padding: '12px', borderRadius: '12px',
                  border: form.recompensa === r.val ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.recompensa === r.val ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.recompensa === r.val ? 'var(--cyan)' : 'var(--muted)',
                  cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                }}>
                {r.val === 'si' ? '🎁 ' : ''}{r.label}
              </button>
            ))}
          </div>
          {form.recompensa === 'si' && (
            <div className="form-field">
              <label>Cantidad de recompensa</label>
              <input type="text" placeholder="Ej: 50€, A convenir..."
                value={form.recompensa_cantidad}
                onChange={e => set('recompensa_cantidad', e.target.value)} />
              <span className="form-hint">Se mostrará públicamente en el QR</span>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="form-section-title">Propietario y contacto</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre</label>
              <input type="text" placeholder="Ej: Juan García"
                value={form.nombre_propietario}
                onChange={e => set('nombre_propietario', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Ciudad</label>
              <input type="text" placeholder="Ej: Pamplona"
                value={form.ciudad}
                onChange={e => set('ciudad', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Teléfono <span className="req">*</span></label>
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
                  value={form.tel_propietario} style={{ ...inputStyle('tel_propietario'), flex: 1 }}
                  onChange={e => set('tel_propietario', e.target.value)} />
              </div>
              <span className="form-hint">Recibirás notificaciones si alguien encuentra tu objeto</span>
            </div>
            <div className="form-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" placeholder="tu@email.com"
                value={form.email_propietario} style={inputStyle('email_propietario')}
                onChange={e => set('email_propietario', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Contacto de emergencia (opcional)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre</label>
              <input type="text" placeholder="Ej: María García (pareja)"
                value={form.contacto_emergencia}
                onChange={e => set('contacto_emergencia', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Teléfono emergencia</label>
              <input type="tel" placeholder="+34 600 000 000"
                value={form.tel_emergencia}
                onChange={e => set('tel_emergencia', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Dónde sueles llevar el objeto, contenido importante, si tiene GPS..."
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
