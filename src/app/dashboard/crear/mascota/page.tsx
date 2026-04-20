'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const TIPOS_MASCOTA = [
  { valor: 'perro', emoji: '🐕', label: 'Perro' },
  { valor: 'gato', emoji: '🐈', label: 'Gato' },
  { valor: 'ave', emoji: '🦜', label: 'Ave' },
  { valor: 'conejo', emoji: '🐇', label: 'Conejo' },
  { valor: 'otro', emoji: '🐾', label: 'Otro' },
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

export default function MascotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    tipo_mascota: 'perro',
    nombre: '',
    raza: '',
    color: '',
    sexo: '',
    edad: '',
    peso: '',
    microchip: '',
    vacunas_dia: 'si',
    alergias: '',
    medicacion: '',
    veterinario: '',
    tel_veterinario: '',
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
    if (!form.nombre) vacios.push('nombre');
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
      const tipoLabel = TIPOS_MASCOTA.find(t => t.valor === form.tipo_mascota)?.label || form.tipo_mascota;
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'mascota',
          title: `${tipoLabel} · ${form.nombre}${form.raza ? ` · ${form.raza}` : ''}`,
          object_data: {
            ...form,
            tel_propietario: form.prefijo_tel + form.tel_propietario.replace(/\s/g, ''),
            object_type: 'mascota',
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
        <div className="crear-chip">🐾 Mascota</div>
        <h1 className="crear-title">Registra tu mascota</h1>
        <p className="crear-sub">
          Crea un QR para el collar de tu mascota. Si se pierde, quien la encuentre
          podrá contactarte al instante sin necesidad de apps.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo de mascota</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px' }}>
            {TIPOS_MASCOTA.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo_mascota', t.valor)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: form.tipo_mascota === t.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.tipo_mascota === t.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.tipo_mascota === t.valor ? 'var(--cyan)' : 'var(--muted)',
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
          <div className="form-section-title">Datos de la mascota</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre de la mascota <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Luna, Max, Coco..."
                value={form.nombre} style={inputStyle('nombre')}
                onChange={e => set('nombre', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Raza</label>
              <input type="text" placeholder="Ej: Labrador, Siamés, Mestizo..."
                value={form.raza}
                onChange={e => set('raza', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Color</label>
              <input type="text" placeholder="Ej: Negro, Marrón, Tricolor..."
                value={form.color}
                onChange={e => set('color', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Sexo</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['Macho', 'Hembra'].map(s => (
                  <button key={s} type="button" onClick={() => set('sexo', s)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      border: form.sexo === s ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                      background: form.sexo === s ? 'rgba(0,200,255,.1)' : 'transparent',
                      color: form.sexo === s ? 'var(--cyan)' : 'var(--muted)',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    }}>
                    {s === 'Macho' ? '♂️' : '♀️'} {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Edad</label>
              <input type="text" placeholder="Ej: 3 años, 6 meses..."
                value={form.edad}
                onChange={e => set('edad', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Peso</label>
              <input type="text" placeholder="Ej: 12 kg"
                value={form.peso}
                onChange={e => set('peso', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Nº de microchip</label>
              <input type="text" placeholder="15 dígitos del chip"
                value={form.microchip}
                onChange={e => set('microchip', e.target.value)} />
              <span className="form-hint">Importante para identificación oficial</span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Salud</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Vacunas al día</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {['si', 'no'].map(v => (
                  <button key={v} type="button" onClick={() => set('vacunas_dia', v)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px',
                      border: form.vacunas_dia === v ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                      background: form.vacunas_dia === v ? 'rgba(0,200,255,.1)' : 'transparent',
                      color: form.vacunas_dia === v ? 'var(--cyan)' : 'var(--muted)',
                      cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    }}>
                    {v === 'si' ? '✅ Sí' : '❌ No'}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Alergias</label>
              <input type="text" placeholder="Ej: Pollo, polen..."
                value={form.alergias}
                onChange={e => set('alergias', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Medicación</label>
              <input type="text" placeholder="Ej: Antiinflamatorio cada 12h..."
                value={form.medicacion}
                onChange={e => set('medicacion', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Veterinario</label>
              <input type="text" placeholder="Nombre de la clínica veterinaria"
                value={form.veterinario}
                onChange={e => set('veterinario', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Teléfono del veterinario</label>
              <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="+34 948 000 000"
                value={form.tel_veterinario}
                onChange={e => set('tel_veterinario', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Propietario y contacto</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre del propietario</label>
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
                <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="600 000 000"
                  value={form.tel_propietario} style={{ ...inputStyle('tel_propietario'), flex: 1 }}
                  onChange={e => set('tel_propietario', e.target.value)} />
              </div>
              <span className="form-hint">Te contactarán aquí si encuentran a tu mascota</span>
            </div>
            <div className="form-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" placeholder="tu@email.com"
                value={form.email_propietario} style={inputStyle('email_propietario')}
                onChange={e => set('email_propietario', e.target.value)} />
              <span className="form-hint">Recibirás notificaciones en este email</span>
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
              <input type="tel" inputMode="numeric" pattern="[0-9]*" placeholder="+34 600 000 000"
                value={form.tel_emergencia}
                onChange={e => set('tel_emergencia', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Comportamiento, miedos, zona habitual de paseo, si lleva GPS..."
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
