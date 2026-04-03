'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import './maquina.css';

const FABRICANTES = ['Azkoyen', 'GMV', 'Jofemar', 'Sumatic', 'Wurlitzer', 'Otro'];

export default function MaquinaTabacoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    estab_nombre: '',
    estab_dir: '',
    estab_cp: '',
    estab_ciudad: '',
    tel_resp: '',
    email_resp: '',
    fabricante: 'Azkoyen',
    modelo: '',
    num_serie: '',
    fecha_inst: '',
    pvr_caducidad: '',
    tipo_maquina: 'tabaco',
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
    if (!form.estab_nombre) vacios.push('estab_nombre');
    if (!form.estab_dir)    vacios.push('estab_dir');
    if (!form.estab_ciudad) vacios.push('estab_ciudad');
    if (!form.tel_resp)     vacios.push('tel_resp');
    if (!form.modelo)       vacios.push('modelo');

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
          object_type: 'maquina-tabaco',
          title: `${form.fabricante} ${form.modelo} · ${form.estab_nombre}`,
          object_data: form,
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
        <div className="crear-chip">🚬 Máquina de Tabaco / Vending</div>
        <h1 className="crear-title">Registra tu máquina</h1>
        <p className="crear-sub">
          Rellena los datos. El QR se generará automáticamente y podrás
          descargarlo como PNG o PDF pegatina.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo de máquina</div>
          <div className="tipo-toggle">
            <button type="button"
              className={`toggle-btn ${form.tipo_maquina === 'tabaco' ? 'active' : ''}`}
              onClick={() => set('tipo_maquina', 'tabaco')}>
              🚬 Tabaco
            </button>
            <button type="button"
              className={`toggle-btn ${form.tipo_maquina === 'vending' ? 'active' : ''}`}
              onClick={() => set('tipo_maquina', 'vending')}>
              🥤 Vending
            </button>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Establecimiento</div>
          <div className="form-grid">
            <div className="form-field full">
              <label>Nombre del establecimiento <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Bar El Rincón / Estanco Hernández"
                value={form.estab_nombre} style={inputStyle('estab_nombre')}
                onChange={e => set('estab_nombre', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Dirección <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Calle Gayarre 12"
                value={form.estab_dir} style={inputStyle('estab_dir')}
                onChange={e => set('estab_dir', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Código postal</label>
              <input type="text" placeholder="31500" maxLength={5}
                value={form.estab_cp}
                onChange={e => set('estab_cp', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Ciudad / Municipio <span className="req">*</span></label>
              <input type="text" placeholder="Tudela"
                value={form.estab_ciudad} style={inputStyle('estab_ciudad')}
                onChange={e => set('estab_ciudad', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Responsable y contacto</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Teléfono WhatsApp <span className="req">*</span></label>
              <input type="tel" placeholder="+34 600 000 000"
                value={form.tel_resp} style={inputStyle('tel_resp')}
                onChange={e => set('tel_resp', e.target.value)} />
              <span className="form-hint">Las incidencias llegarán a este número</span>
            </div>
            <div className="form-field">
              <label>Email de contacto</label>
              <input type="email" placeholder="responsable@email.com"
                value={form.email_resp}
                onChange={e => set('email_resp', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Datos de la máquina</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Fabricante</label>
              <select value={form.fabricante} onChange={e => set('fabricante', e.target.value)}>
                {FABRICANTES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Modelo <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Serie N v13"
                value={form.modelo} style={inputStyle('modelo')}
                onChange={e => set('modelo', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Número de serie</label>
              <input type="text" placeholder="Ej: AZ-N-20847"
                value={form.num_serie}
                onChange={e => set('num_serie', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Fecha de instalación</label>
              <input type="date" value={form.fecha_inst}
                onChange={e => set('fecha_inst', e.target.value)} />
            </div>
          </div>
        </div>

        {form.tipo_maquina === 'tabaco' && (
          <div className="form-section">
            <div className="form-section-title">Tasa PVR · Permiso de Venta en Ruta</div>
            <div className="pvr-info">
              ℹ️ Te avisaremos por email cuando el permiso esté a menos de 30 días de caducar.
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label>Fecha de caducidad del PVR</label>
                <input type="date" value={form.pvr_caducidad}
                  onChange={e => set('pvr_caducidad', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Notas adicionales..."
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