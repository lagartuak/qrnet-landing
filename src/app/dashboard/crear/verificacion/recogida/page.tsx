'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../../crear.css';
import '../../maquina-tabaco/maquina.css';

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

interface Autorizado {
  nombre: string;
  parentesco: string;
  dni: string;
  telefono: string;
}

export default function RecogidaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [autorizados, setAutorizados] = useState<Autorizado[]>([
    { nombre: '', parentesco: '', dni: '', telefono: '' },
  ]);

  const [form, setForm] = useState({
    nombre_menor: '',
    edad: '',
    curso: '',
    centro: '',
    direccion_centro: '',
    ciudad: '',
    nombre_tutor: '',
    dni_tutor: '',
    parentesco_tutor: '',
    prefijo_tel: '+34',
    tel_tutor: '',
    email_tutor: '',
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

  const addAutorizado = () => {
    setAutorizados([...autorizados, { nombre: '', parentesco: '', dni: '', telefono: '' }]);
  };

  const updateAutorizado = (index: number, field: string, value: string) => {
    const updated = [...autorizados];
    updated[index] = { ...updated[index], [field]: value };
    setAutorizados(updated);
  };

  const removeAutorizado = (index: number) => {
    if (autorizados.length > 1) {
      setAutorizados(autorizados.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    setError('');
    const vacios: string[] = [];
    if (!form.nombre_menor) vacios.push('nombre_menor');
    if (!form.centro) vacios.push('centro');
    if (!form.nombre_tutor) vacios.push('nombre_tutor');
    if (!form.tel_tutor) vacios.push('tel_tutor');
    if (!form.email_tutor) vacios.push('email_tutor');

    const autorizadosValidos = autorizados.filter(a => a.nombre && a.parentesco).map(a => ({...a, pin: String(Math.floor(1000 + Math.random() * 9000))}));
    if (autorizadosValidos.length === 0) {
      vacios.push('autorizados');
      setError('Añade al menos una persona autorizada con nombre y parentesco');
    }

    if (vacios.length > 0) {
      setCamposError(vacios);
      if (!error) setError('Por favor rellena los campos marcados en rojo (*)');
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
          object_type: 'verificacion_recogida',
          title: `🏫 Recogida · ${form.nombre_menor} · ${form.centro}`,
          object_data: {
            ...form,
            tel_tutor: form.prefijo_tel + form.tel_tutor.replace(/\s/g, ''),
            autorizados: autorizadosValidos,
            object_type: 'verificacion_recogida',
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
        <div className="crear-chip">🏫 Recogida de menores</div>
        <h1 className="crear-title">Autorización de recogida</h1>
        <p className="crear-sub">
          Registra al menor y a las personas autorizadas para recogerlo.
          El centro escaneará el QR para verificar la autorización al instante.
        </p>
      </div>

      <div style={{
        background: 'rgba(0,200,255,.06)', border: '1px solid rgba(0,200,255,.15)',
        borderRadius: '12px', padding: '16px 20px', marginBottom: '24px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>🔒</span>
        <p style={{ color: '#9CC', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
          El centro solo verá el nombre, parentesco y foto de la persona autorizada.
          Los datos del tutor (teléfono, email) se usan solo para notificaciones.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Datos del menor</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre completo del menor <span className="req">*</span></label>
              <input type="text" placeholder="Ej: María García López"
                value={form.nombre_menor} style={inputStyle('nombre_menor')}
                onChange={e => set('nombre_menor', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Edad</label>
              <input type="text" placeholder="Ej: 7 años"
                value={form.edad}
                onChange={e => set('edad', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Curso</label>
              <input type="text" placeholder="Ej: 2º Primaria"
                value={form.curso}
                onChange={e => set('curso', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Centro educativo</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre del centro <span className="req">*</span></label>
              <input type="text" placeholder="Ej: CEIP San Jorge, Guardería Arcoíris..."
                value={form.centro} style={inputStyle('centro')}
                onChange={e => set('centro', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Dirección</label>
              <input type="text" placeholder="Ej: Calle Mayor 10"
                value={form.direccion_centro}
                onChange={e => set('direccion_centro', e.target.value)} />
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
          <div className="form-section-title">Tutor principal (padre/madre)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Nombre completo <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Juan García Martínez"
                value={form.nombre_tutor} style={inputStyle('nombre_tutor')}
                onChange={e => set('nombre_tutor', e.target.value)} />
            </div>
            <div className="form-field">
              <label>DNI / NIE</label>
              <input type="text" placeholder="Ej: 12345678A"
                value={form.dni_tutor} style={{ textTransform: 'uppercase' }}
                onChange={e => set('dni_tutor', e.target.value.toUpperCase())} />
            </div>
            <div className="form-field">
              <label>Parentesco</label>
              <input type="text" placeholder="Ej: Padre, Madre"
                value={form.parentesco_tutor}
                onChange={e => set('parentesco_tutor', e.target.value)} />
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
                  value={form.tel_tutor} style={{ ...inputStyle('tel_tutor'), flex: 1 }}
                  onChange={e => set('tel_tutor', e.target.value)} />
              </div>
              <span className="form-hint">Recibirás notificación cada vez que se use la autorización</span>
            </div>
            <div className="form-field">
              <label>Email <span className="req">*</span></label>
              <input type="email" placeholder="tu@email.com"
                value={form.email_tutor} style={inputStyle('email_tutor')}
                onChange={e => set('email_tutor', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Personas autorizadas</span>
            <button type="button" onClick={addAutorizado}
              style={{
                background: 'rgba(0,200,255,.1)', border: '1px solid rgba(0,200,255,.3)',
                color: '#00c8ff', padding: '6px 16px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              }}>
              + Añadir persona
            </button>
          </div>
          <p style={{ color: '#6a8a95', fontSize: '12px', marginBottom: '16px' }}>
            Estas personas podrán recoger al menor mostrando su QR. Puedes añadir hasta 10.
          </p>

          {autorizados.map((a, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)',
              borderRadius: '12px', padding: '20px', marginBottom: '12px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ color: '#00c8ff', fontSize: '13px', fontWeight: 700 }}>
                  Persona autorizada #{i + 1}
                </span>
                {autorizados.length > 1 && (
                  <button type="button" onClick={() => removeAutorizado(i)}
                    style={{ background: 'rgba(255,80,80,.1)', border: 'none', color: '#ff6b6b',
                      padding: '4px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}>
                    Eliminar
                  </button>
                )}
              </div>
              <div className="form-grid">
                <div className="form-field">
                  <label>Nombre completo <span className="req">*</span></label>
                  <input type="text" placeholder="Ej: Ana López García"
                    value={a.nombre}
                    onChange={e => updateAutorizado(i, 'nombre', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Parentesco <span className="req">*</span></label>
                  <input type="text" placeholder="Ej: Abuela, Tío, Cuidadora..."
                    value={a.parentesco}
                    onChange={e => updateAutorizado(i, 'parentesco', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>DNI / NIE</label>
                  <input type="text" placeholder="Ej: 12345678A"
                    value={a.dni} style={{ textTransform: 'uppercase' }}
                    onChange={e => updateAutorizado(i, 'dni', e.target.value.toUpperCase())} />
                </div>
                <div className="form-field">
                  <label>Teléfono</label>
                  <input type="tel" placeholder="+34 600 000 000"
                    value={a.telefono}
                    onChange={e => updateAutorizado(i, 'telefono', e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Alergias, necesidades especiales, horario de recogida habitual..."
            value={form.observaciones}
            onChange={e => set('observaciones', e.target.value)} />
        </div>

        {error && <div className="form-error">⚠️ {error}</div>}

        <div className="form-actions">
          <Link href="/dashboard/crear/verificacion" className="btn-cancel">Cancelar</Link>
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando autorización...' : 'Generar autorización QR →'}
          </button>
        </div>

      </div>
    </div>
  );
}
