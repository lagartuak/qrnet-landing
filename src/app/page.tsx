'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import './landing.css';

const faqs = [
  {
    q: '¿Necesito instalar alguna app para escanear los QRs?',
    a: 'No. Cualquier smartphone moderno puede escanear un QR directamente desde la cámara del sistema operativo, sin instalar nada. El usuario final no necesita crear ninguna cuenta ni descargar ninguna aplicación.',
  },
  {
    q: '¿Qué pasa si el QR físico se daña o se pierde?',
    a: 'Puedes descargar e imprimir el mismo QR desde tu panel de control tantas veces como necesites. El código vinculado al objeto no cambia nunca, así que la nueva etiqueta funciona exactamente igual que la anterior.',
  },
  {
    q: '¿Puedo actualizar los datos del objeto después de crear el QR?',
    a: 'Sí, esa es precisamente la ventaja clave de QRnet. El código QR físico es permanente, pero la información que hay detrás puede modificarse en cualquier momento desde tu panel de control. Cambio de propietario, número de contacto, ubicación… todo actualizable al instante.',
  },
  {
    q: '¿Mis datos personales son visibles para cualquiera que escanee?',
    a: 'Tú decides qué información es pública. Puedes mostrar solo un botón de contacto vía WhatsApp sin exponer tu número directamente, o limitar la visibilidad de ciertos campos. El control de privacidad es tuyo en todo momento.',
  },
  {
    q: '¿Cuánto tiempo se tarda en crear y configurar el primer QR?',
    a: 'Menos de 2 minutos. Creas tu cuenta, introduces los datos básicos del objeto (nombre, tipo, contacto), y el sistema genera el QR automáticamente. Puedes descargarlo e imprimirlo al momento.',
  },
  {
    q: '¿El plan gratuito tiene límite de tiempo o caduca?',
    a: 'No caduca nunca. El plan Básico con hasta 5 QRs activos es permanente y gratuito. Solo necesitas actualizar a Pro si quieres más de 5 QRs o acceder a funciones avanzadas como analítica, historial de incidencias o PDFs personalizados.',
  },
  {
    q: '¿Puedo cancelar el plan Pro cuando quiera?',
    a: 'Sí, sin permanencia ni penalizaciones. Puedes cancelar la suscripción en cualquier momento desde tu panel. Seguirás teniendo acceso Pro hasta el final del período facturado y después tu cuenta pasará automáticamente al plan gratuito.',
  },
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Scroll reveal
  useEffect(() => {
   const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Nav scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (navRef.current) {
        navRef.current.style.background =
          window.scrollY > 40 ? 'rgba(2,6,8,.95)' : 'rgba(2,6,8,.7)';
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div className="grid-bg" />

      {/* ── NAV ── */}
      <nav ref={navRef}>
        <Link href="/" className="nav-logo">
          <img src="/logo.png" alt="QRnet.io" style={{width:36,height:36}} />
          QRnet<span style={{ color: 'var(--cyan)' }}>.</span>io
        </Link>
        <ul className="nav-links">
          <li><a href="#como-funciona">Cómo funciona</a></li>
          <li><a href="#casos">Casos de uso</a></li>
          <li><a href="#precios">Precios</a></li>
          <li><a href="#faq">FAQ</a></li>
        </ul>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/login" style={{ fontSize: '13px', color: 'var(--muted)', textDecoration: 'none', fontWeight: 500 }}>
            Iniciar sesión
          </Link>
          <Link href="/registro" className="nav-cta">Empezar gratis</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-glow2" />
        <div className="qr-deco">
          <svg width="320" height="320" viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              .qr-deco rect:nth-child(7){animation:qrBlink 3s ease-in-out infinite}
              .qr-deco rect:nth-child(10){animation:qrBlink 2.4s ease-in-out infinite .3s}
              .qr-deco rect:nth-child(13){animation:qrBlink 2.8s ease-in-out infinite .6s}
              .qr-deco rect:nth-child(16){animation:qrBlink 3.2s ease-in-out infinite .2s}
              .qr-deco rect:nth-child(19){animation:qrBlink 2.6s ease-in-out infinite .5s}
              @keyframes qrBlink{0%,100%{opacity:.3}50%{opacity:.9}}
            `}</style>
            <rect x="40" y="40" width="90" height="90" rx="8" stroke="rgba(0,200,255,0.4)" strokeWidth="2" fill="none"/>
            <rect x="56" y="56" width="58" height="58" rx="4" fill="rgba(0,200,255,0.15)"/>
            <rect x="190" y="40" width="90" height="90" rx="8" stroke="rgba(0,200,255,0.4)" strokeWidth="2" fill="none"/>
            <rect x="206" y="56" width="58" height="58" rx="4" fill="rgba(0,200,255,0.15)"/>
            <rect x="40" y="190" width="90" height="90" rx="8" stroke="rgba(0,200,255,0.4)" strokeWidth="2" fill="none"/>
            <rect x="56" y="206" width="58" height="58" rx="4" fill="rgba(0,200,255,0.15)"/>
            <rect x="190" y="168" width="18" height="18" rx="2" fill="rgba(0,200,255,0.5)"/>
            <rect x="214" y="168" width="18" height="18" rx="2" fill="rgba(0,200,255,0.3)"/>
            <rect x="238" y="168" width="18" height="18" rx="2" fill="rgba(0,200,255,0.5)"/>
            <rect x="262" y="168" width="18" height="18" rx="2" fill="rgba(0,200,255,0.3)"/>
            <rect x="190" y="192" width="18" height="18" rx="2" fill="rgba(0,200,255,0.3)"/>
            <rect x="238" y="192" width="18" height="18" rx="2" fill="rgba(0,200,255,0.5)"/>
            <rect x="262" y="192" width="18" height="18" rx="2" fill="rgba(0,200,255,0.4)"/>
            <rect x="120" y="168" width="18" height="18" rx="2" fill="rgba(0,200,255,0.4)"/>
            <rect x="144" y="168" width="18" height="18" rx="2" fill="rgba(0,200,255,0.3)"/>
            <rect x="120" y="192" width="18" height="18" rx="2" fill="rgba(0,200,255,0.5)"/>
            <rect x="144" y="192" width="18" height="18" rx="2" fill="rgba(0,200,255,0.3)"/>
            <rect x="168" y="40" width="18" height="18" rx="2" fill="rgba(0,200,255,0.4)"/>
            <rect x="168" y="64" width="18" height="18" rx="2" fill="rgba(0,200,255,0.3)"/>
            <rect x="168" y="88" width="18" height="18" rx="2" fill="rgba(0,200,255,0.5)"/>
            <rect x="168" y="112" width="18" height="18" rx="2" fill="rgba(0,200,255,0.3)"/>
          </svg>
        </div>
        <div className="hero-inner">
          <div className="hero-chip">
            <div className="chip-dot" />
            Plataforma Universal de Identidad QR
          </div>
          <h1 className="hero-title">
            Cualquier objeto.{' '}
            <span className="accent">Un scan.</span>
            <span className="line2">Conectado para siempre.</span>
          </h1>
          <p className="hero-sub">
            QRnet.io vincula cualquier objeto físico al mundo digital mediante un código QR único.
            Tarjetas de visita digitales, gestión de incidencias, identificación de vehículos, trazabilidad y mucho más.
          </p>
          <div className="hero-actions">
            <Link href="/registro" className="btn-primary qr-btn-glow">Crear mi primer QR gratis</Link>
            <a href="#casos" className="btn-outline">Ver casos de uso</a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">10</div>
              <div className="stat-label">Tipos de QR activos</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">0€</div>
              <div className="stat-label">Para empezar</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">3s</div>
              <div className="stat-label">Para contactar</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">100%</div>
              <div className="stat-label">Sin apps</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ── */}
      <section className="how" id="como-funciona">
        <div className="container">
          <div className="reveal">
            <div className="section-label">El proceso</div>
            <h2 className="section-title">Tan simple como<br />escanear y listo</h2>
            <p className="section-sub">Sin aplicaciones, sin registros previos, sin complicaciones para el usuario final.</p>
          </div>
          <div className="steps reveal">
            {[
              { n: '01', icon: '📋', title: 'Registra tu objeto', text: 'Crea una cuenta gratuita e introduce los datos de tu objeto: nombre, ubicación, propietario, tipo y cualquier campo personalizado que necesites.' },
              { n: '02', icon: '🎯', title: 'Genera el QR único', text: 'El sistema genera automáticamente un código QR único e irrepetible vinculado a tu objeto. Descárgalo en PNG, PDF o formato pegatina listo para imprimir.' },
              { n: '03', icon: '📌', title: 'Coloca la etiqueta', text: 'Pega, atornilla o remacha el QR en tu objeto. Desde pegatinas económicas hasta placas metálicas de alta durabilidad para entornos exigentes.' },
              { n: '04', icon: '⚡', title: 'Escanea y conecta', text: 'Cualquier persona con un smartphone escanea el QR y accede instantáneamente a la información del objeto y puede contactar al responsable vía WhatsApp o email.' },
            ].map((s) => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div className="step-icon qr-icon-bounce">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CASOS DE USO ── */}
      <section id="casos" style={{ padding: '100px 40px' }}>
        <div className="container">
          <div className="reveal">
            <div className="section-label">Casos de uso</div>
            <h2 className="section-title">Un QR.<br />Infinitas aplicaciones.</h2>
            <p className="section-sub">10 tipos de QR activos y funcionando. Desde máquinas expendedoras hasta tarjetas de visita digitales, colas de espera o verificación de identidad.</p>
          </div>
          <div className="cases-grid reveal">

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">🚬</span>
              <div className="case-tag">Tabaco</div>
              <h3>Máquina de Tabaco</h3>
              <p>Gestión completa de incidencias para máquinas de tabaco. El usuario reporta el problema en segundos sin guardar ningún contacto.</p>
              <ul className="case-features">
                <li>WhatsApp pre-rellenado con datos de la máquina</li>
                <li>Control de Tasa PVR y caducidades</li>
                <li>Planograma de etiquetas adjunto</li>
                <li>Cambio de responsable sin cambiar el QR</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">🥤</span>
              <div className="case-tag">Vending</div>
              <h3>Máquina Vending</h3>
              <p>Café, bebidas, snacks, bocadillos, vapers y más. Gestión de incidencias por WhatsApp adaptada a cada tipo de máquina.</p>
              <ul className="case-features">
                <li>WhatsApp con datos de la máquina</li>
                <li>Múltiples tipos de máquinas</li>
                <li>Organización por zonas</li>
                <li>Cambio de responsable sin cambiar el QR</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">🚗</span>
              <div className="case-tag">Identificación</div>
              <h3>Vehículo</h3>
              <p>Registra tu vehículo con un QR y permite que cualquiera pueda contactarte de forma anónima si ocurre algo: golpe en el parking, luces encendidas o una emergencia.</p>
              <ul className="case-features">
                <li>Formulario de contacto anónimo al propietario</li>
                <li>Notificaciones SMS al instante</li>
                <li>Datos del vehículo: matrícula, marca, modelo y color</li>
                <li>Sin exponer datos personales al público</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">🚲</span>
              <div className="case-tag">Antirrobo</div>
              <h3>Bicicleta / Patinete</h3>
              <p>Bicicletas, e-bikes y patinetes eléctricos. Contacto anónimo, alerta de robo y verificación de segunda mano.</p>
              <ul className="case-features">
                <li>Contacto anónimo con el propietario</li>
                <li>Alerta de robo activable</li>
                <li>Verificación antes de compra de segunda mano</li>
                <li>Placa QR metálica remachable</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">🏢</span>
              <div className="case-tag">Profesional</div>
              <h3>Empresa / Autónomo</h3>
              <p>Tarjeta de visita digital con todos tus datos de contacto, web y redes sociales. Siempre actualizada, sin imprimir nada.</p>
              <ul className="case-features">
                <li>Actualiza teléfono, email o dirección al instante</li>
                <li>Tú decides qué campos son visibles</li>
                <li>Para furgonetas, mostradores, ferias y firmas de email</li>
                <li>Web y redes sociales integradas</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">👤</span>
              <div className="case-tag">Privacidad</div>
              <h3>QR Personal</h3>
              <p>Tu perfil privado con control total. Comparte solo lo que quieras con quien quieras. Mensajería anónima incluida.</p>
              <ul className="case-features">
                <li>Control total de privacidad</li>
                <li>Mensajería anónima incluida</li>
                <li>Comparte solo los campos que elijas</li>
                <li>Perfil actualizable en cualquier momento</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">🐾</span>
              <div className="case-tag">Mascotas</div>
              <h3>Mascota</h3>
              <p>Medalla QR para el collar de tu mascota. Si se pierde, cualquier persona puede escanear y contactar al dueño al instante.</p>
              <ul className="case-features">
                <li>Datos del propietario accesibles de inmediato</li>
                <li>Información médica y alergias</li>
                <li>Contacto de emergencia alternativo</li>
                <li>Sin app necesaria para el rescatador</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">✅</span>
              <div className="case-tag">Seguridad</div>
              <h3>Verificación / Autorización</h3>
              <p>Recogida de menores en colegios, entregas certificadas, encuentros seguros y control de acceso verificado.</p>
              <ul className="case-features">
                <li>Recogida autorizada en colegios</li>
                <li>Entregas certificadas con verificación</li>
                <li>Encuentros seguros entre desconocidos</li>
                <li>Control de acceso a eventos o zonas</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">📋</span>
              <div className="case-tag">Hostelería</div>
              <h3>Cola / Turno</h3>
              <p>Gestión de cola de espera para restaurantes y bares. El cliente escanea, se registra y recibe aviso cuando le toca.</p>
              <ul className="case-features">
                <li>El cliente escanea y se apunta a la cola</li>
                <li>Notificación cuando le toca</li>
                <li>Sin apps ni descargas para el cliente</li>
                <li>Panel de gestión para el local</li>
              </ul>
            </div>

            <div className="case-card featured">
              <div className="case-badge">Activo</div>
              <span className="case-emoji">🎒</span>
              <div className="case-tag">Personal</div>
              <h3>Objeto Personal</h3>
              <p>Maletas, instrumentos musicales, cámaras, equipos de deporte. Si lo pierdes, quien lo encuentre puede devolvértelo.</p>
              <ul className="case-features">
                <li>Contacto anónimo del encontrador</li>
                <li>Recompensa opcional configurable</li>
                <li>Sin datos personales expuestos</li>
                <li>Notificación al propietario</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="container">
          <div className="reveal" style={{ display: 'flex', gap: '80px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="qr-visual" style={{ flexShrink: 0 }}>
              <div className="qr-ring" />
              <div className="qr-ring2" />
              <div className="qr-box">
                <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '48px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '11px', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '.1em', textTransform: 'uppercase' }}>Escanea</div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div className="section-label">Tecnología</div>
              <h2 className="section-title">Actualiza los datos.<br />El QR nunca cambia.</h2>
              <p className="section-sub" style={{ marginBottom: '32px' }}>Esta es la ventaja clave. El código QR físico es permanente. La información digital que hay detrás puede actualizarse en cualquier momento desde tu panel de control.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { icon: '📞', title: 'Cambia el responsable, no el QR', text: 'Si cambia el propietario o el teléfono de contacto, actualizas el dato en el panel y el QR ya impreso funciona con la nueva información.' },
                  { icon: '🔒', title: 'Privacidad controlada', text: 'Tú decides qué información es pública y cuál solo accesible para roles autorizados. El propietario siempre tiene el control.' },
                  { icon: '📊', title: 'Analítica de escaneos', text: 'Sabe cuántas veces se ha escaneado tu QR, desde dónde y en qué momento. Información valiosa para gestionar tu flota de objetos.' },
                ].map((f) => (
                  <div key={f.title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(0,200,255,.1)', border: '1px solid rgba(0,200,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '16px' }}>{f.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: '14px', fontWeight: 700, color: 'var(--white)', marginBottom: '4px' }}>{f.title}</div>
                      <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{f.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="features-grid reveal" style={{ marginTop: '80px' }}>
            {[
              { icon: '🌍', title: 'Sin fronteras', text: 'Funciona en cualquier país, en cualquier idioma, con cualquier smartphone. Solo necesitas una cámara.' },
              { icon: '⚡', title: 'Instantáneo', text: 'De escaneo a contacto en menos de 3 segundos. Sin registros, sin descargas, sin fricciones.' },
              { icon: '💬', title: 'WhatsApp nativo', text: 'El mensaje se genera automáticamente con todos los datos del objeto. El usuario solo describe el problema.' },
              { icon: '🎨', title: 'QR personalizable', text: 'Logo, colores, forma. Tu QR puede tener identidad de marca sin perder compatibilidad de escaneo.' },
              { icon: '📁', title: 'Documentos adjuntos', text: 'Manuales, garantías, planogramas, fotos. Toda la documentación del objeto accesible desde el QR.' },
              { icon: '🔔', title: 'Notificaciones', text: 'Recibe alertas por email o WhatsApp cuando alguien escanea tu QR o envía una incidencia.' },
            ].map((f) => (
              <div className="feat" key={f.title}>
                <div className="feat-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRECIOS ── */}
      <section id="precios" style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div className="container">
          <div className="reveal">
            <div className="section-label" style={{ justifyContent: 'center' }}>Precios</div>
            <h2 className="section-title">Empieza gratis.<br />Escala cuando quieras.</h2>
            <p className="section-sub" style={{ margin: '0 auto 60px' }}>Sin sorpresas, sin letra pequeña. El plan gratuito es permanente.</p>
          </div>
          <div className="plans reveal">

            <div className="plan">
              <div className="plan-name">Básico</div>
              <div className="plan-price">0<span>€</span></div>
              <div className="plan-period">Para siempre</div>
              <ul className="plan-features">
                <li><span className="check">✓</span> Hasta 5 QRs activos</li>
                <li><span className="check">✓</span> Página pública del objeto</li>
                <li><span className="check">✓</span> Contacto vía WhatsApp</li>
                <li><span className="check">✓</span> Descarga PNG del QR</li>
                <li><span className="check">✓</span> 1 imagen por objeto</li>
                <li><span className="cross">–</span> <span style={{ color: 'var(--muted)' }}>PDF pegatina personalizada</span></li>
                <li><span className="cross">–</span> <span style={{ color: 'var(--muted)' }}>Analítica de escaneos</span></li>
                <li><span className="cross">–</span> <span style={{ color: 'var(--muted)' }}>Historial de incidencias</span></li>
              </ul>
              <Link href="/registro" className="plan-btn free">Empezar gratis</Link>
            </div>

            <div className="plan pro">
              <div className="plan-badge">Más popular</div>
              <div className="plan-name">Pro</div>
              <div className="plan-price">9<span>€</span></div>
              <div className="plan-period">por mes · hasta 50 QRs</div>
              <ul className="plan-features">
                <li><span className="check">✓</span> Hasta 50 QRs activos</li>
                <li><span className="check">✓</span> Todo lo del plan Básico</li>
                <li><span className="check">✓</span> PDF pegatina personalizada</li>
                <li><span className="check">✓</span> Analítica de escaneos</li>
                <li><span className="check">✓</span> Historial de incidencias</li>
                <li><span className="check">✓</span> Múltiples imágenes / docs</li>
                <li><span className="check">✓</span> Notificaciones por email</li>
                <li><span className="check">✓</span> Soporte prioritario</li>
              </ul>
              <Link href="/registro" className="plan-btn paid">Empezar prueba gratis</Link>
            </div>

            <div className="plan">
              <div className="plan-name">Business</div>
              <div className="plan-price" style={{ fontSize: '36px' }}>A medida</div>
              <div className="plan-period">para empresas y flotas grandes</div>
              <ul className="plan-features">
                <li><span className="check">✓</span> QRs ilimitados</li>
                <li><span className="check">✓</span> Todo lo del plan Pro</li>
                <li><span className="check">✓</span> White label (marca propia)</li>
                <li><span className="check">✓</span> API de integración</li>
                <li><span className="check">✓</span> Usuarios y roles múltiples</li>
                <li><span className="check">✓</span> Dashboard personalizado</li>
                <li><span className="check">✓</span> Facturación por proyecto</li>
                <li><span className="check">✓</span> Gestor de cuenta dedicado</li>
              </ul>
              <a href="mailto:info@qrnet.io" className="plan-btn free">Contactar</a>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div className="container">
          <div className="reveal">
            <div className="section-label" style={{ justifyContent: 'center' }}>FAQ</div>
            <h2 className="section-title">Preguntas frecuentes</h2>
            <p className="section-sub" style={{ margin: '0 auto' }}>Lo que más nos preguntan antes de empezar.</p>
          </div>
          <div className="faq-grid reveal">
            {faqs.map((item, i) => (
              <div className="faq-item" key={i}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <div className={`faq-arrow${openFaq === i ? ' open' : ''}`}>▾</div>
                </button>
                <div className={`faq-answer${openFaq === i ? ' open' : ''}`}>
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" id="registro">
        <div className="cta-bg" />
        <div className="container reveal">
          <h2>Tu objeto.<br />Su identidad digital.</h2>
          <p>Registra tu primer QR en menos de 2 minutos. Sin tarjeta de crédito, sin compromisos.</p>
          <div className="cta-actions">
            <Link href="/registro" className="btn-primary" style={{ fontSize: '16px', padding: '16px 40px' }}>Crear cuenta gratis →</Link>
            <a href="mailto:info@qrnet.io" className="btn-outline" style={{ fontSize: '16px', padding: '16px 40px' }}>Hablar con el equipo</a>
          </div>
          <p className="cta-note">
            ¿Ya tienes máquinas en maquinasdetabaco.com?{' '}
            <a href="https://www.maquinasdetabaco.com/index.php/mis-maquinas" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Accede directamente →</a>
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-inner">
          <Link href="/" className="footer-logo">
            <img src="/logo.png" alt="QRnet.io" style={{width:36,height:36}} />
            QRnet<span style={{ color: 'var(--cyan)' }}>.</span>io
          </Link>
          <ul className="footer-links">
            <li><a href="#como-funciona">Cómo funciona</a></li>
            <li><a href="#casos">Casos de uso</a></li>
            <li><a href="#precios">Precios</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="mailto:info@qrnet.io">Contacto</a></li>
            <li><a href="/aviso-legal">Aviso legal</a></li>
            <li><a href="/privacidad">Privacidad</a></li>
            <li><a href="https://www.youtube.com/@QRnet_world" target="_blank" rel="noreferrer">YouTube</a></li>
          </ul>
        </div>
        <div className="footer-copy">
          © 2026 QRnet.io · Desarrollado por{' '}
          <a href="mailto:info@qrnet.io" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>info@qrnet.io</a>
          {' '}· Tudela, Navarra
        </div>
      </footer>
    </>
  );
}
