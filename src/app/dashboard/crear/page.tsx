'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './crear.css';

const tipos = [
  {
    slug: 'maquina-tabaco',
    emoji: '🚬',
    titulo: 'Máquina de Tabaco',
    desc: 'Gestión de incidencias, control PVR, planograma y contacto de responsable.',
    tags: ['WhatsApp', 'Control PVR', 'Planograma'],
    activo: true,
  },
  {
    slug: 'vending',
    emoji: '🥤',
    titulo: 'Máquina Vending',
    desc: 'Café, bebidas, snacks, bocadillos, vapers y más. Gestión de incidencias por WhatsApp.',
    tags: ['WhatsApp', 'Múltiples tipos', 'Por zonas'],
    activo: true,
  },
  {
    slug: 'vehiculo',
    emoji: '🚗',
    titulo: 'Vehículo',
    desc: 'Identificación de propietario, datos del seguro y cambio de titularidad verificado.',
    tags: ['Antirrobo', 'Seguro', 'Titularidad'],
    activo: false,
  },
  {
    slug: 'bicicleta',
    emoji: '🚲',
    titulo: 'Bicicleta',
    desc: 'Identificación, alerta de robo comunitaria y verificación antes de compra de segunda mano.',
    tags: ['Antirrobo', 'Alerta robo', 'Segunda mano'],
    activo: false,
  },
  {
    slug: 'mascota',
    emoji: '🐾',
    titulo: 'Mascota',
    desc: 'Medalla QR para el collar. Si se pierde, cualquiera puede contactar al dueño al instante.',
    tags: ['Contacto inmediato', 'Info médica', 'Sin app'],
    activo: false,
  },
  {
    slug: 'objeto',
    emoji: '🎒',
    titulo: 'Objeto Personal',
    desc: 'Maletas, instrumentos, cámaras... Si lo pierdes, quien lo encuentre puede devolvértelo.',
    tags: ['Contacto anónimo', 'Recompensa', 'Privacidad'],
    activo: false,
  },
];
export default function CrearPage() {
  const router = useRouter();

  return (
    <div className="crear-wrap">
      <div className="crear-header">
        <Link href="/dashboard" className="crear-back">
          ← Volver al panel
        </Link>
        <div className="crear-chip">Nuevo QR</div>
        <h1 className="crear-title">¿Qué quieres registrar?</h1>
        <p className="crear-sub">
          Elige el tipo de objeto. Cada categoría tiene campos específicos
          y una página pública adaptada a su uso.
        </p>
      </div>

      <div className="tipos-grid">
        {tipos.map((t) => (
          <div
            key={t.slug}
            className={`tipo-card ${t.activo ? 'activo' : 'proximamente'}`}
            onClick={() => t.activo && router.push(`/dashboard/crear/${t.slug}`)}
          >
            {!t.activo && <div className="tipo-badge">Próximamente</div>}
            <div className="tipo-emoji">{t.emoji}</div>
            <h3 className="tipo-nombre">{t.titulo}</h3>
            <p className="tipo-desc">{t.desc}</p>
            <div className="tipo-tags">
              {t.tags.map((tag) => (
                <span key={tag} className="tipo-tag">{tag}</span>
              ))}
            </div>
            {t.activo && (
              <div className="tipo-cta">Crear QR →</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}