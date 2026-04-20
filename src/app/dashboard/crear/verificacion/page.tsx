'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import '../crear.css';

const MODOS = [
  {
    slug: 'recogida',
    emoji: '🏫',
    titulo: 'Recogida de menores',
    desc: 'Autoriza personas para recoger niños en colegios, guarderías o actividades. Control total desde el móvil.',
    tags: ['Colegios', 'Guarderías', 'Actividades'],
    activo: true,
  },
  {
    slug: 'encuentro',
    emoji: '🤝',
    titulo: 'Encuentro / Entrega verificada',
    desc: 'Compraventa, entregas, quedadas o recados. Ambas personas se verifican con PIN. Confirmación con fecha y hora.',
    tags: ['Compraventa', 'Entregas', 'Seguridad'],
    activo: true,
  },
  
  {
    slug: 'invitacion',
    emoji: '🎫',
    titulo: 'Invitación / Evento',
    desc: 'Invita a alguien a un restaurante, evento o experiencia. Con PIN, límite de gasto y confirmación para las 3 partes.',
    tags: ['Restaurantes', 'Eventos', 'Regalos'],
    activo: true,
  },
];

export default function VerificacionPage() {
  const router = useRouter();

  return (
    <div className="crear-wrap">
      <Link href="/dashboard/crear" className="crear-back">← Cambiar tipo</Link>

      <div className="crear-header">
        <div className="crear-chip">✅ Verificación / Autorización</div>
        <h1 className="crear-title">¿Qué necesitas verificar?</h1>
        <p className="crear-sub">
          Usa códigos QR para autorizar personas, certificar entregas
          o verificar encuentros de forma segura.
        </p>
      </div>

      <div className="tipos-grid">
        {MODOS.map(m => (
          <div
            key={m.slug}
            className={`tipo-card ${m.activo ? 'activo' : 'proximamente'}`}
            onClick={() => m.activo && router.push(`/dashboard/crear/verificacion/${m.slug}`)}
          >
            {!m.activo && <div className="tipo-badge">Próximamente</div>}
            <div className="tipo-emoji">{m.emoji}</div>
            <h3 className="tipo-nombre">{m.titulo}</h3>
            <p className="tipo-desc">{m.desc}</p>
            <div className="tipo-tags">
              {m.tags.map(tag => (
                <span key={tag} className="tipo-tag">{tag}</span>
              ))}
            </div>
            {m.activo && <div className="tipo-cta">Crear QR →</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
