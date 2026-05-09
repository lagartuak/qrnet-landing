'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const TIPOS_VIVIENDA = [
  { valor: 'piso', emoji: '🏢', label: 'Piso / Apartamento' },
  { valor: 'casa', emoji: '🏠', label: 'Casa / Chalet' },
  { valor: 'adosado', emoji: '🏘️', label: 'Adosado' },
  { valor: 'local', emoji: '🏪', label: 'Local / Comercio' },
  { valor: 'oficina', emoji: '🏬', label: 'Oficina' },
  { valor: 'almacen', emoji: '📦', label: 'Almacén / Nave' },
];

const PREFERENCIAS_ENTREGA = [
  { valor: 'puerta', emoji: '🚪', label: 'En la puerta' },
  { valor: 'porteria', emoji: '🏗️', label: 'Portería / Conserjería' },
  { valor: 'vecino', emoji: '👋', label: 'Dejar con vecino' },
  { valor: 'porche', emoji: '🏡', label: 'Porche / Jardín' },
  { valor: 'buzon', emoji: '📬', label: 'Buzón (si cabe)' },
  { valor: 'llamar', emoji: '📞', label: 'Llamar antes' },
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

export default function PuntoEntregaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    tipo_vivienda: 'piso',
    nombre_destinatario: '',
    calle: '',
    numero: '',
    piso_puerta: '',
    codigo_postal: '',
    ciudad: '',
    provincia: '',
    latitud: '',
    longitud: '',
    codigo_acceso: '',
    instrucciones: '',
    preferencia_entrega: 'puerta',
    prefijo_tel: '+34',
    tel_contacto: '',
    tel_alternativo: '',
    horario_disponible: '',
    foto_fachada: '',
    observaciones: '',
    notificacion: 'ambos',
  });

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setCamposError(prev => prev.filter(c => c !== k));
  };

  const inputStyle = (campo: string) => ({
    borderColor: camposError.includes(campo) ? 'rgba(255,80,80,.6)' : undefined,
    background: camposError.includes(campo) ? 'rgba(255,80,80,.05)' : undefined,
  });

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(f => ({
          ...f,
          latitud: pos.coords.latitude.toFixed(6),
          longitud: pos.coords.longitude.toFixed(6),
        }));
      },
      () => setError('No se pudo obtener la ubicación. Activa la localización en tu dispositivo.'),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async () => {
    setError('');
    const vacios: string[] = [];
    if (!form.calle) vacios.push('calle');
    if (!form.numero) vacios.push('numero');
    if (!form.ciudad) vacios.push('ciudad');
    if (!form.tel_contacto) vacios.push('tel_contacto');
    if (!form.nombre_destinatario) vacios.push('nombre_destinatario');

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
      const tipoLabel = TIPOS_VIVIENDA.find(t => t.valor === form.tipo_vivienda)?.label || form.tipo_vivienda;
      const direccionCorta = `${form.calle} ${form.numero}${form.piso_puerta ? ', ' + form.piso_puerta : ''}`;
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'punto-entrega',
          title: `${tipoLabel} · ${direccionCorta} · ${form.ciudad}`,
          object_data: {
            ...form,
            tel_contacto: form.prefijo_tel + form.tel_contacto.replace(/\s/g, ''),
            object_type: 'punto-entrega',
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
        <div className="crear-chip">📍 Punto de Entrega</div>
        <h1 className="crear-title">Registra tu dirección</h1>
        <p className="crear-sub">
          Crea un QR para tu buzón o portal. El repartidor lo escanea y ve
          la ubicación exacta, instrucciones de acceso y cómo contactarte.
        </p>
      </div>

      <div className="maquina-form">

        {/* TIPO DE VIVIENDA */}
        <div className="form-section">
          <div className="form-section-title">Tipo de vivienda</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {TIPOS_VIVIENDA.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo_vivienda', t.valor)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: form.tipo_vivienda === t.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.tipo_vivienda === t.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.tipo_vivienda === t.valor ? 'var(--cyan)' : 'var(--muted)',
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

        {/* DESTINATARIO */}
        <div className="form-section">
          <div className="form-section-title">Destinatario</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre completo <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Juan García López"
                value={form.nombre_destinatario} style={inputStyle('nombre_destinatario')}
                onChange={e => set('nombre_destinatario', e.target.value)} />
              <span className="form-hint">El repartidor verá solo tu nombre, no tu teléfono</span>
            </div>
          </div>
        </div>

        {/* DIRECCIÓN */}
        <div className="form-section">
          <div className="form-section-title">Dirección postal</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Calle <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Calle Mayor, Av. de la Constitución..."
                value={form.calle} style={inputStyle('calle')}
                onChange={e => set('calle', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Número <span className="req">*</span></label>
              <input type="text" placeholder="Ej: 15, 7B, s/n..."
                value={form.numero} style={inputStyle('numero')}
                onChange={e => set('numero', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Piso y puerta</label>
              <input type="text" placeholder="Ej: 3ºB, Bajo dcha, Ático..."
                value={form.piso_puerta}
                onChange={e => set('piso_puerta', e.target.value)} />
              <span className="form-hint">Déjalo vacío si es casa de planta baja</span>
            </div>
            <div className="form-field">
              <label>Ciudad <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Tudela, Madrid, Barcelona..."
                value={form.ciudad} style={inputStyle('ciudad')}
                onChange={e => set('ciudad', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Código postal</label>
              <input type="text" placeholder="Ej: 31500" maxLength={5}
                value={form.codigo_postal}
                onChange={e => set('codigo_postal', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Provincia</label>
              <input type="text" placeholder="Ej: Navarra"
                value={form.provincia}
                onChange={e => set('provincia', e.target.value)} />
            </div>
          </div>
        </div>

        {/* UBICACIÓN GPS */}
        <div className="form-section">
          <div className="form-section-title">Ubicación exacta (GPS)</div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            La ubicación GPS es lo que hace este QR diferente a una dirección postal normal.
            El repartidor verá un pin exacto en Google Maps.
          </p>
          <div className="form-grid">
            <div className="form-field">
              <label>Latitud</label>
              <input type="text" placeholder="Ej: 42.061747"
                value={form.latitud}
                onChange={e => set('latitud', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Longitud</label>
              <input type="text" placeholder="Ej: -1.604780"
                value={form.longitud}
                onChange={e => set('longitud', e.target.value)} />
            </div>
          </div>
          <button
            type="button"
            onClick={obtenerUbicacion}
            style={{
              marginTop: '12px',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(0,200,255,.3)',
              background: 'rgba(0,200,255,.08)',
              color: 'var(--cyan)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            📍 Usar mi ubicación actual
          </button>
          {form.latitud && form.longitud && (
            <div style={{ marginTop: '12px' }}>
              <a
                href={`https://www.google.com/maps?q=${form.latitud},${form.longitud}`}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--cyan)', fontSize: '13px', textDecoration: 'none' }}
              >
                🗺️ Ver en Google Maps →
              </a>
            </div>
          )}
          <span className="form-hint" style={{ marginTop: '8px', display: 'block' }}>
            Pulsa el botón desde el móvil en tu puerta para máxima precisión.
            También puedes copiar las coordenadas desde Google Maps.
          </span>
        </div>

        {/* ACCESO E INSTRUCCIONES */}
        <div className="form-section">
          <div className="form-section-title">Acceso e instrucciones</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Código de acceso al portal</label>
              <input type="text" placeholder="Ej: 4532, # + 2B, llave electrónica..."
                value={form.codigo_acceso}
                onChange={e => set('codigo_acceso', e.target.value)} />
              <span className="form-hint">Déjalo vacío si no hay portal o código</span>
            </div>
          </div>
          <div className="form-field" style={{ marginTop: '12px' }}>
            <label>Instrucciones para el repartidor</label>
            <textarea rows={3}
              placeholder="Ej: El timbre no funciona, llamar al móvil. Entrada por la puerta lateral. Casa con puerta azul y maceta roja en la entrada."
              value={form.instrucciones}
              onChange={e => set('instrucciones', e.target.value)} />
            <span className="form-hint">Describe cómo encontrar tu puerta. Puedes cambiarlo en cualquier momento.</span>
          </div>
        </div>

        {/* PREFERENCIA DE ENTREGA */}
        <div className="form-section">
          <div className="form-section-title">¿Dónde dejar el paquete?</div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            Indica al repartidor qué hacer si no estás en casa. Puedes cambiarlo cuando quieras.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
            {PREFERENCIAS_ENTREGA.map(p => (
              <button
                key={p.valor}
                type="button"
                onClick={() => set('preferencia_entrega', p.valor)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: form.preferencia_entrega === p.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.preferencia_entrega === p.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.preferencia_entrega === p.valor ? 'var(--cyan)' : 'var(--muted)',
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
                <span style={{ fontSize: '20px' }}>{p.emoji}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTACTO */}
        <div className="form-section">
          <div className="form-section-title">Contacto</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Teléfono <span className="req">*</span></label>
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
                  value={form.tel_contacto} style={{ ...inputStyle('tel_contacto'), flex: 1 }}
                  onChange={e => set('tel_contacto', e.target.value)} />
              </div>
              <span className="form-hint">Recibirás un SMS cuando el repartidor pulse "Estoy en tu puerta"</span>
            </div>
            <div className="form-field">
              <label>Teléfono alternativo</label>
              <input type="tel" placeholder="Ej: +34 600 000 000"
                value={form.tel_alternativo}
                onChange={e => set('tel_alternativo', e.target.value)} />
              <span className="form-hint">Si no respondes al principal, el repartidor puede llamar a este</span>
            </div>
          </div>
        </div>

        {/* HORARIO */}
        <div className="form-section">
          <div className="form-section-title">Horario de disponibilidad (opcional)</div>
          <div className="form-field">
            <textarea rows={2}
              placeholder="Ej: Lunes a viernes de 9:00 a 14:00. Sábados todo el día. Domingos no estoy."
              value={form.horario_disponible}
              onChange={e => set('horario_disponible', e.target.value)} />
            <span className="form-hint">El repartidor verá esta información al escanear tu QR</span>
          </div>
        </div>

        {/* NOTIFICACIÓN */}
        <div className="form-section">
          <div className="form-section-title">Preferencia de notificación</div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            ¿Cómo quieres que te avise el repartidor?
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { val: 'sms', emoji: '📱', label: 'SMS' },
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

        {/* OBSERVACIONES */}
        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Cualquier información adicional que pueda ayudar al repartidor."
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
