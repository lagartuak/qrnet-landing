'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const SECTORES = [
  'Tecnología', 'Comercio', 'Hostelería', 'Construcción', 'Salud',
  'Educación', 'Transporte', 'Consultoría', 'Marketing', 'Legal',
  'Inmobiliaria', 'Industria', 'Agricultura', 'Energía', 'Otro',
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

export default function EmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    nombre_comercial: '',
    razon_social: '',
    cif_nif: '',
    sector: '',
    tel_fijo: '',
    prefijo_movil: '+34',
    tel_movil: '',
    email: '',
    web: '',
    direccion: '',
    codigo_postal: '',
    ciudad: '',
    provincia: '',
    pais: 'España',
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    youtube: '',
    contacto_nombre: '',
    contacto_cargo: '',
    prefijo_contacto: '+34',
    contacto_movil: '',
    contacto_email: '',
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
    if (!form.nombre_comercial) vacios.push('nombre_comercial');
    if (!form.cif_nif) vacios.push('cif_nif');
    if (!form.tel_movil) vacios.push('tel_movil');
    if (!form.email) vacios.push('email');

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
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'empresa',
          title: `🏢 ${form.nombre_comercial}`,
          object_data: {
            ...form,
            tel_movil: form.prefijo_movil + form.tel_movil.replace(/\s/g, ''),
            contacto_movil: form.contacto_movil ? form.prefijo_contacto + form.contacto_movil.replace(/\s/g, '') : '',
            object_type: 'empresa',
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
        <div className="crear-chip">🏢 Empresa / Autónomo</div>
        <h1 className="crear-title">Tu tarjeta digital profesional</h1>
        <p className="crear-sub">
          Crea un QR con toda la información de tu empresa o negocio.
          Quien lo escanee verá tus datos de contacto, web y redes sociales al instante.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Datos de la empresa</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre comercial <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Mi Empresa S.L."
                value={form.nombre_comercial} style={inputStyle('nombre_comercial')}
                onChange={e => set('nombre_comercial', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Razón social</label>
              <input type="text" placeholder="Ej: Mi Empresa Servicios S.L."
                value={form.razon_social}
                onChange={e => set('razon_social', e.target.value)} />
            </div>
            <div className="form-field">
              <label>CIF / NIF <span className="req">*</span></label>
              <input type="text" placeholder="Ej: B12345678 o 12345678A"
                value={form.cif_nif} style={{ ...inputStyle('cif_nif'), textTransform: 'uppercase' }}
                onChange={e => set('cif_nif', e.target.value.toUpperCase())} />
            </div>
            <div className="form-field">
              <label>Sector / Actividad</label>
              <select value={form.sector} onChange={e => set('sector', e.target.value)}
                style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,.03)', color: '#f0f8ff', fontSize: '14px', width: '100%' }}>
                <option value="">Selecciona un sector</option>
                {SECTORES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Contacto de la empresa</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Teléfono fijo</label>
              <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="Ej: 948 123 456"
                value={form.tel_fijo}
                onChange={e => set('tel_fijo', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Teléfono móvil <span className="req">*</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.prefijo_movil} onChange={e => set('prefijo_movil', e.target.value)}
                  style={{ width: '130px', padding: '10px 8px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '13px' }}>
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="600 000 000"
                  value={form.tel_movil} style={{ ...inputStyle('tel_movil'), flex: 1 }}
                  onChange={e => set('tel_movil', e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" placeholder="info@miempresa.com"
                value={form.email} style={inputStyle('email')}
                onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Página web</label>
              <input type="url" placeholder="https://www.miempresa.com"
                value={form.web}
                onChange={e => set('web', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Dirección</div>
          <div className="form-grid">
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <label>Dirección</label>
              <input type="text" placeholder="Ej: Calle Mayor 10, 2º B"
                value={form.direccion}
                onChange={e => set('direccion', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Código postal</label>
              <input type="text" placeholder="Ej: 31001" maxLength={10}
                value={form.codigo_postal}
                onChange={e => set('codigo_postal', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Ciudad</label>
              <input type="text" placeholder="Ej: Pamplona"
                value={form.ciudad}
                onChange={e => set('ciudad', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Provincia</label>
              <input type="text" placeholder="Ej: Navarra"
                value={form.provincia}
                onChange={e => set('provincia', e.target.value)} />
            </div>
            <div className="form-field">
              <label>País</label>
              <input type="text" placeholder="Ej: España"
                value={form.pais}
                onChange={e => set('pais', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Redes sociales (opcional)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>LinkedIn</label>
              <input type="url" placeholder="https://linkedin.com/company/..."
                value={form.linkedin}
                onChange={e => set('linkedin', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Instagram</label>
              <input type="text" placeholder="@miempresa"
                value={form.instagram}
                onChange={e => set('instagram', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Facebook</label>
              <input type="url" placeholder="https://facebook.com/..."
                value={form.facebook}
                onChange={e => set('facebook', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Twitter / X</label>
              <input type="text" placeholder="@miempresa"
                value={form.twitter}
                onChange={e => set('twitter', e.target.value)} />
            </div>
            <div className="form-field">
              <label>TikTok</label>
              <input type="text" placeholder="@miempresa"
                value={form.tiktok}
                onChange={e => set('tiktok', e.target.value)} />
            </div>
            <div className="form-field">
              <label>YouTube</label>
              <input type="url" placeholder="https://youtube.com/@..."
                value={form.youtube}
                onChange={e => set('youtube', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Persona de contacto (opcional)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre</label>
              <input type="text" placeholder="Ej: Juan García"
                value={form.contacto_nombre}
                onChange={e => set('contacto_nombre', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Cargo</label>
              <input type="text" placeholder="Ej: Director comercial"
                value={form.contacto_cargo}
                onChange={e => set('contacto_cargo', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Móvil directo</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.prefijo_contacto} onChange={e => set('prefijo_contacto', e.target.value)}
                  style={{ width: '130px', padding: '10px 8px', borderRadius: '10px',
                    border: '1px solid var(--border)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '13px' }}>
                  {PREFIJOS.map(p => (
                    <option key={p.code} value={p.code}>{p.pais} {p.code}</option>
                  ))}
                </select>
                <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="600 000 000"
                  value={form.contacto_movil} style={{ flex: 1 }}
                  onChange={e => set('contacto_movil', e.target.value)} />
              </div>
            </div>
            <div className="form-field">
              <label>Email directo</label>
              <input type="email" placeholder="juan@miempresa.com"
                value={form.contacto_email}
                onChange={e => set('contacto_email', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Horario de atención, especialidades, información adicional..."
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
