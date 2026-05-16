'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EditarQRPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [qr, setQr] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/qr/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setQr(data);
          const objData = typeof data.object_data === 'string'
            ? JSON.parse(data.object_data)
            : data.object_data;
          setForm(objData || {});
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Error al cargar el QR');
        setLoading(false);
      });
  }, [id]);

  const set = (k: string, v: string) => {
    setForm((f: any) => ({ ...f, [k]: v }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/qr/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ object_data: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar');
      setSuccess('Cambios guardados correctamente');
      setTimeout(() => router.push(`/dashboard/qr/${id}`), 1500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6a8a95', fontSize: '16px' }}>Cargando...</p>
      </div>
    );
  }

  if (!qr) {
    return (
      <div style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ff6b35', fontSize: '16px' }}>{error || 'QR no encontrado'}</p>
      </div>
    );
  }

  const fieldStyle: React.CSSProperties = {
    background: '#111e25',
    border: '1px solid rgba(0,200,255,.1)',
    borderRadius: '8px',
    padding: '12px 16px',
    color: '#f0f8ff',
    fontSize: '14px',
    width: '100%',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    color: '#9C8672',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '.05em',
    marginBottom: '6px',
    display: 'block',
  };

  // Determinar campos según tipo
  const tipo = qr.object_type;
  const campos = getFields(tipo, form);

  return (
    <div style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d1a20', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#f0f8ff', fontWeight: 700, fontSize: '20px', textDecoration: 'none' }}>
          <img src="/logo.png" alt="QRnet.io" style={{ width: 32, height: 32, verticalAlign: 'middle', marginRight: 8 }} />
          QRnet<span style={{ color: '#00c8ff' }}>.</span>io
        </a>
        <Link href={`/dashboard/qr/${id}`} style={{ color: '#00c8ff', fontSize: '14px', textDecoration: 'none' }}>
          ← Volver al QR
        </Link>
      </nav>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 20px' }}>
        <h1 style={{ color: '#f0f8ff', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
          Editar QR · {qr.title}
        </h1>
        <p style={{ color: '#6a8a95', fontSize: '14px', marginBottom: '32px' }}>
          Código: <strong style={{ color: '#00c8ff' }}>{qr.public_code}</strong>
        </p>

        <div style={{ background: '#0d1a20', borderRadius: '16px', padding: '32px', border: '1px solid rgba(0,200,255,.1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {campos.map((campo: any) => (
              <div key={campo.key}>
                <label style={labelStyle}>{campo.label}</label>
                {campo.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={form[campo.key] || ''}
                    onChange={e => set(campo.key, e.target.value)}
                    style={{ ...fieldStyle, resize: 'none' }}
                  />
                ) : (
                  <input
                    type={campo.type || 'text'}
                    value={form[campo.key] || ''}
                    onChange={e => set(campo.key, e.target.value)}
                    style={fieldStyle}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Preferencia de notificación */}
          <div style={{ marginTop: '24px' }}>
            <label style={labelStyle}>Preferencia de notificación</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { val: 'sms', emoji: '📱', label: 'SMS' },
                { val: 'email', emoji: '✉️', label: 'Email' },
                { val: 'whatsapp', emoji: '💬', label: 'WhatsApp' },
                { val: 'ambos', emoji: '📲', label: 'Todos' },
              ].map(o => (
                <button key={o.val} type="button" onClick={() => set('notificacion', o.val)}
                  style={{
                    flex: '1 1 60px', padding: '12px 8px', borderRadius: '10px',
                    border: (form.notificacion || 'sms') === o.val ? '2px solid #00c8ff' : '1px solid rgba(0,200,255,.1)',
                    background: (form.notificacion || 'sms') === o.val ? 'rgba(0,200,255,.1)' : '#111e25',
                    color: (form.notificacion || 'sms') === o.val ? '#00c8ff' : '#6a8a95',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600, textAlign: 'center',
                  }}>
                  <span style={{ fontSize: '18px', display: 'block', marginBottom: '4px' }}>{o.emoji}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(255,80,80,.1)', border: '1px solid rgba(255,80,80,.2)', borderRadius: '10px', padding: '12px', color: '#ff6b6b', fontSize: '13px', marginTop: '20px', textAlign: 'center' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(0,200,255,.1)', border: '1px solid rgba(0,200,255,.2)', borderRadius: '10px', padding: '12px', color: '#00c8ff', fontSize: '13px', marginTop: '20px', textAlign: 'center' }}>
              {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
            <Link href={`/dashboard/qr/${id}`} style={{ border: '1px solid rgba(0,200,255,.2)', color: '#00c8ff', padding: '12px 24px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Cancelar
            </Link>
            <button onClick={handleSave} disabled={saving}
              style={{ background: '#00c8ff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '40px', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? .7 : 1 }}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getFields(tipo: string, form: any) {
  switch (tipo) {
    case 'vehiculo':
      return [
        { key: 'marca', label: 'Marca' },
        { key: 'modelo', label: 'Modelo' },
        { key: 'color', label: 'Color' },
        { key: 'matricula', label: 'Matrícula' },
        { key: 'anio', label: 'Año' },
        { key: 'num_bastidor', label: 'Número de bastidor' },
        { key: 'tel_propietario', label: 'Teléfono propietario' },
        { key: 'email_propietario', label: 'Email propietario', type: 'email' },
        { key: 'aseguradora', label: 'Aseguradora' },
        { key: 'num_poliza', label: 'Nº de póliza' },
        { key: 'contacto_emergencia', label: 'Contacto emergencia' },
        { key: 'tel_emergencia', label: 'Teléfono emergencia' },
        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      ];
    case 'bicicleta':
      return [
        { key: 'marca', label: 'Marca' },
        { key: 'modelo', label: 'Modelo' },
        { key: 'color', label: 'Color' },
        { key: 'anio', label: 'Año' },
        { key: 'num_serie', label: 'Número de serie' },
        { key: 'talla', label: 'Talla' },
        { key: 'tel_propietario', label: 'Teléfono propietario' },
        { key: 'email_propietario', label: 'Email propietario', type: 'email' },
        { key: 'aseguradora', label: 'Aseguradora' },
        { key: 'num_poliza', label: 'Nº de póliza' },
        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      ];
    case 'empresa':
      return [
        { key: 'nombre_comercial', label: 'Nombre comercial' },
        { key: 'razon_social', label: 'Razón social' },
        { key: 'cif_nif', label: 'CIF / NIF' },
        { key: 'sector', label: 'Sector' },
        { key: 'tel_fijo', label: 'Teléfono fijo' },
        { key: 'tel_movil', label: 'Teléfono móvil' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'web', label: 'Web', type: 'url' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'codigo_postal', label: 'Código postal' },
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'provincia', label: 'Provincia' },
        { key: 'linkedin', label: 'LinkedIn', type: 'url' },
        { key: 'instagram', label: 'Instagram' },
        { key: 'facebook', label: 'Facebook', type: 'url' },
        { key: 'twitter', label: 'Twitter / X' },
        { key: 'tiktok', label: 'TikTok' },
        { key: 'youtube', label: 'YouTube', type: 'url' },
        { key: 'contacto_nombre', label: 'Persona de contacto' },
        { key: 'contacto_cargo', label: 'Cargo' },
        { key: 'contacto_movil', label: 'Móvil contacto' },
        { key: 'contacto_email', label: 'Email contacto', type: 'email' },
        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      ];
    case 'personal':
      return [
        { key: 'nombre', label: 'Nombre' },
        { key: 'username', label: 'Usuario' },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'ciudad', label: 'Ciudad' },
        { key: 'profesion', label: 'Profesión' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'web', label: 'Web', type: 'url' },
        { key: 'linkedin', label: 'LinkedIn', type: 'url' },
        { key: 'instagram', label: 'Instagram' },
        { key: 'facebook', label: 'Facebook', type: 'url' },
        { key: 'twitter', label: 'Twitter / X' },
        { key: 'tiktok', label: 'TikTok' },
        { key: 'youtube', label: 'YouTube', type: 'url' },
      ];
    default: // máquinas
      return [
        { key: 'estab_nombre', label: 'Establecimiento' },
        { key: 'estab_dir', label: 'Dirección' },
        { key: 'estab_cp', label: 'Código postal' },
        { key: 'estab_ciudad', label: 'Ciudad' },
        { key: 'fabricante', label: 'Fabricante' },
        { key: 'modelo', label: 'Modelo' },
        { key: 'num_serie', label: 'Nº de serie' },
        { key: 'tel_resp', label: 'Teléfono responsable' },
        { key: 'observaciones', label: 'Observaciones', type: 'textarea' },
      ];
  }
}
