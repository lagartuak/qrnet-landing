'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';
import '../maquina-tabaco/maquina.css';

const TIPOS_VENDING = [
  { valor: 'cafe', emoji: '☕', label: 'Café / Bebidas calientes' },
  { valor: 'bebidas', emoji: '🥤', label: 'Bebidas frías (latas/botellas)' },
  { valor: 'snacks', emoji: '🍫', label: 'Snacks / Dulces' },
  { valor: 'bocadillos', emoji: '🥪', label: 'Bocadillos / Sándwiches' },
  { valor: 'vapers', emoji: '💨', label: 'Vapers / CBD' },
  { valor: 'mixta', emoji: '📦', label: 'Mixta' },
  { valor: 'otros', emoji: '🎮', label: 'Otros productos' },
];

export default function VendingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [camposError, setCamposError] = useState<string[]>([]);
  const [form, setForm] = useState({
    tipo_vending: 'cafe',
    estab_nombre: '',
    estab_dir: '',
    estab_cp: '',
    estab_ciudad: '',
    zona: '',
    tel_resp: '',
    email_resp: '',
    marca: '',
    modelo: '',
    num_serie: '',
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
      const tipoLabel = TIPOS_VENDING.find(t => t.valor === form.tipo_vending)?.label || form.tipo_vending;
      const res = await fetch('/api/qr/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          object_type: 'vending',
          title: `${tipoLabel} · ${form.estab_nombre}`,
          object_data: { ...form, object_type: 'vending' },
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
        <div className="crear-chip">🥤 Máquina Vending</div>
        <h1 className="crear-title">Registra tu máquina vending</h1>
        <p className="crear-sub">
          Rellena los datos. El QR se generará automáticamente y podrás
          descargarlo como PNG o PDF pegatina.
        </p>
      </div>

      <div className="maquina-form">

        <div className="form-section">
          <div className="form-section-title">Tipo de máquina</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
            {TIPOS_VENDING.map(t => (
              <button
                key={t.valor}
                type="button"
                onClick={() => set('tipo_vending', t.valor)}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: form.tipo_vending === t.valor ? '1px solid rgba(0,200,255,.4)' : '1px solid var(--border)',
                  background: form.tipo_vending === t.valor ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: form.tipo_vending === t.valor ? 'var(--cyan)' : 'var(--muted)',
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
          <div className="form-section-title">Establecimiento</div>
          <div className="form-grid">
            <div className="form-field full">
              <label>Nombre del establecimiento <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Fábrica Volkswagen / Centro Comercial X"
                value={form.estab_nombre} style={inputStyle('estab_nombre')}
                onChange={e => set('estab_nombre', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Dirección <span className="req">*</span></label>
              <input type="text" placeholder="Ej: Polígono Industrial, Calle Mayor 5"
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
            <div className="form-field full">
              <label>Zona / Ubicación dentro del establecimiento</label>
              <input type="text" placeholder="Ej: Planta 1, Cafetería, Entrada principal, Nave B"
                value={form.zona}
                onChange={e => set('zona', e.target.value)} />
              <span className="form-hint">Útil si hay varias máquinas en el mismo establecimiento</span>
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
          <div className="form-section-title">Datos de la máquina (opcional)</div>
          <div className="form-grid">
            <div className="form-field">
              <label>Marca</label>
              <input type="text" placeholder="Ej: Necta, Jofemar, Azkoyen..."
                value={form.marca}
                onChange={e => set('marca', e.target.value)} />
            </div>
            <div className="form-field">
              <label>Modelo</label>
              <input type="text" placeholder="Ej: Witty, Canto, G-Snack..."
                value={form.modelo}
                onChange={e => set('modelo', e.target.value)} />
            </div>
            <div className="form-field full">
              <label>Número de serie</label>
              <input type="text" placeholder="Ej: NEC-20847"
                value={form.num_serie}
                onChange={e => set('num_serie', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-section-title">Observaciones (opcional)</div>
          <textarea rows={3} placeholder="Notas adicionales sobre la máquina o la ubicación..."
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
