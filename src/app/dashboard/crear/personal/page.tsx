'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

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

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}
      title={active ? 'Visible para otros' : 'Oculto para otros'}
      style={{
        width: '40px', height: '22px', borderRadius: '11px', border: 'none',
        background: active ? '#00c8ff' : 'rgba(255,255,255,.1)',
        position: 'relative', cursor: 'pointer', transition: '.2s', flexShrink: 0,
      }}>
      <div style={{
        width: '16px', height: '16px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '3px',
        left: active ? '21px' : '3px', transition: '.2s',
      }} />
    </button>
  );
}

export default function PersonalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);

  const [form, setForm] = useState({
    nombre: '',
    username: '',
    bio: '',
    ciudad: '',
    profesion: '',
    prefijo_tel: '+34',
    telefono: '',
    email: '',
    web: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: '',
    youtube: '',
  });

  const [visible, setVisible] = useState({
    bio: true,
    ciudad: true,
    profesion: true,
    telefono: false,
    email: false,
    web: true,
    linkedin: true,
    instagram: true,
    facebook: true,
    twitter: true,
    tiktok: true,
    youtube: true,
  });

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    setCamposError(prev => prev.filter(c => c !== k));
  };

  const toggleVisible = (k: string) => {
    setVisible(v => ({ ...v, [k]: !v[k as keyof typeof v] }));
  };

  const inputStyle = (campo: string) => ({
    borderColor: camposError.includes(campo) ? 'rgba(255,80,80,.6)' : undefined,
    background: camposError.includes(campo) ? 'rgba(255,80,80,.05)' : undefined,
  });

  const handleSubmit = async () => {
    setError('');
    const vacios: string[] = [];
    if (!form.nombre) vacios.push('nombre');
    if (!form.username) vacios.push('username');

    if (vacios.length > 0) {
      setCamposError(vacios);
      setError('Nombre y usuario son obligatorios');
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
          object_type: 'personal',
          title: `👤 ${form.nombre} (@${form.username})`,
          object_data: {
            ...form,
            telefono: form.telefono ? form.prefijo_tel + form.telefono.replace(/\s/g, '') : '',
            visible,
            object_type: 'personal',
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
        <div className="crear-chip">👤 QR Personal</div>
        <h1 className="crear-title">Tu perfil privado</h1>
        <p className="crear-sub">
          Crea tu QR personal y decide qué datos son visibles.
          Quien lo escanee podrá enviarte mensajes sin ver tu información privada.
        </p>
      </div>

      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>🔒</span>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          Usa el interruptor <span style={{ color: '#00c8ff', fontWeight: 700 }}>azul</span> junto
          a cada campo para decidir si se muestra públicamente.
          Tu nombre y usuario siempre serán visibles. El teléfono y email están ocultos por defecto.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Identidad (siempre visible)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre <span className="req">*</span></label>
              <input type="text" placeholder="Solo tu nombre (sin apellidos si prefieres)"
                value={form.nombre} style={inputStyle('nombre')}
                onChange={e => set('nombre', e.target.value)} />
              <span className="form-hint">Siempre visible en tu perfil público</span>
            </div>
            <div className="form-field">
              <label>Usuario <span className="req">*</span></label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#00c8ff', fontSize: '16px', fontWeight: 700 }}>@</span>
                <input type="text" placeholder="tu_usuario"
                  value={form.username} style={{ ...inputStyle('username'), flex: 1 }}
                  onChange={e => set('username', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} />
              </div>
              <span className="form-hint">Identificador único. Solo letras, números y guion bajo</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Sobre ti</div>
          <div className="form-grid">
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Bio / Descripción</label>
                <Toggle active={visible.bio} onToggle={() => toggleVisible('bio')} />
              </div>
              <textarea rows={2} placeholder="Cuéntale al mundo algo sobre ti..."
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                style={{ width: '100%', resize: 'none' }} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Ciudad</label>
                <Toggle active={visible.ciudad} onToggle={() => toggleVisible('ciudad')} />
              </div>
              <input type="text" placeholder="Ej: Pamplona"
                value={form.ciudad}
                onChange={e => set('ciudad', e.target.value)} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Profesión</label>
                <Toggle active={visible.profesion} onToggle={() => toggleVisible('profesion')} />
              </div>
              <input type="text" placeholder="Ej: Diseñadora, Ingeniero, Chef..."
                value={form.profesion}
                onChange={e => set('profesion', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Contacto privado</div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            Estos campos están ocultos por defecto. Actívalos solo si quieres compartirlos.
          </p>
          <div className="form-grid">
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Teléfono</label>
                <Toggle active={visible.telefono} onToggle={() => toggleVisible('telefono')} />
              </div>
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
                  value={form.telefono} style={{ flex: 1 }}
                  onChange={e => set('telefono', e.target.value)} />
              </div>
              <span className="form-hint">Necesario para recibir SMS de notificación (no se muestra si está desactivado)</span>
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Email</label>
                <Toggle active={visible.email} onToggle={() => toggleVisible('email')} />
              </div>
              <input type="email" placeholder="tu@email.com"
                value={form.email}
                onChange={e => set('email', e.target.value)} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Página web</label>
                <Toggle active={visible.web} onToggle={() => toggleVisible('web')} />
              </div>
              <input type="url" placeholder="https://..."
                value={form.web}
                onChange={e => set('web', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Redes sociales</div>
          <div className="form-grid">
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>LinkedIn</label>
                <Toggle active={visible.linkedin} onToggle={() => toggleVisible('linkedin')} />
              </div>
              <input type="url" placeholder="https://linkedin.com/in/..."
                value={form.linkedin}
                onChange={e => set('linkedin', e.target.value)} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Instagram</label>
                <Toggle active={visible.instagram} onToggle={() => toggleVisible('instagram')} />
              </div>
              <input type="text" placeholder="@usuario"
                value={form.instagram}
                onChange={e => set('instagram', e.target.value)} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Facebook</label>
                <Toggle active={visible.facebook} onToggle={() => toggleVisible('facebook')} />
              </div>
              <input type="url" placeholder="https://facebook.com/..."
                value={form.facebook}
                onChange={e => set('facebook', e.target.value)} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>Twitter / X</label>
                <Toggle active={visible.twitter} onToggle={() => toggleVisible('twitter')} />
              </div>
              <input type="text" placeholder="@usuario"
                value={form.twitter}
                onChange={e => set('twitter', e.target.value)} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>TikTok</label>
                <Toggle active={visible.tiktok} onToggle={() => toggleVisible('tiktok')} />
              </div>
              <input type="text" placeholder="@usuario"
                value={form.tiktok}
                onChange={e => set('tiktok', e.target.value)} />
            </div>
            <div className="form-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label>YouTube</label>
                <Toggle active={visible.youtube} onToggle={() => toggleVisible('youtube')} />
              </div>
              <input type="url" placeholder="https://youtube.com/@..."
                value={form.youtube}
                onChange={e => set('youtube', e.target.value)} />
            </div>
          </div>
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
