import { notFound } from 'next/navigation';
import pool from '@/lib/db';
import './qr-public.css';
import ContactForm from './ContactForm';
import PinVerificacion from './PinVerificacion';
import PinEncuentro from './PinEncuentro';
import QueueForm from './QueueForm';

interface Props {
  params: Promise<{ codigo: string }>;
}

function pvrStatus(fecha: string | null) {
  if (!fecha) return null;
  const hoy = new Date();
  const cad = new Date(fecha);
  const dias = Math.round((cad.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  if (dias < 0)  return { estado: 'expirado', texto: 'Permiso caducado', clase: 'pvr-err' };
  if (dias <= 30) return { estado: 'aviso', texto: `Caduca en ${dias} días`, clase: 'pvr-warn' };
  return { estado: 'ok', texto: `Vigente · caduca ${new Date(fecha).toLocaleDateString('es-ES')}`, clase: 'pvr-ok' };
}

export default async function QRPublicPage({ params }: Props) {
  const { codigo: codigoRaw } = await params;
  const codigo = codigoRaw.toUpperCase();

  const [rows]: any = await pool.query(
    `SELECT qr_codes.*, users.name as owner_name
     FROM qr_codes 
     LEFT JOIN users ON qr_codes.user_id = users.id
     WHERE qr_codes.public_code = ? AND qr_codes.is_active = 1 LIMIT 1`,
    [codigo]
  );

  if (!rows.length) notFound();

  const qr = rows[0];
  const data = typeof qr.object_data === 'string'
    ? JSON.parse(qr.object_data)
    : qr.object_data;

  pool.query(
    'INSERT INTO qr_scans (qr_code_id, scanned_at) VALUES (?, NOW())',
    [qr.id]
  ).catch(() => {});

  // --- VEHÍCULO ---
  if (qr.object_type === 'vehiculo') {
    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">🚗 QRnet · Vehículo</span>
          <span className="qr-badge">Contacto anónimo</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon">🚗</div>
              <div>
                <div className="qr-sublabel">Vehículo registrado</div>
                <div className="qr-estab-name">
                  {data.marca} {data.modelo}
                  {data.color ? ` · ${data.color}` : ''}
                </div>
              </div>
            </div>
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            <div className="qr-section-title">¿Necesitas contactar con el propietario?</div>
            <p style={{ color: '#9C8672', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Selecciona el motivo y envía un aviso. El propietario recibirá una
              notificación al instante. <strong>Tus datos no serán compartidos.</strong>
            </p>

            <ContactForm qrId={qr.id} matricula={data.matricula || ''} />
          </div>
        </div>

        <div className="qr-footer">
          <span>Servicio de contacto anónimo</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:36,height:36}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }
// --- BICICLETA / PATINETE ---
  if (qr.object_type === 'bicicleta') {
    const tipoLabel = data.tipo === 'ebike' ? '⚡ E-Bike' 
      : data.tipo === 'patinete' ? '🛴 Patinete eléctrico' 
      : '🚲 Bicicleta';

    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">{tipoLabel} · QRnet</span>
          <span className="qr-badge">Contacto anónimo</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon">{data.tipo === 'patinete' ? '🛴' : '🚲'}</div>
              <div>
                <div className="qr-sublabel">Registrado en QRnet</div>
                <div className="qr-estab-name">
                  {data.marca} {data.modelo}
                  {data.color ? ` · ${data.color}` : ''}
                </div>
              </div>
            </div>
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            <div className="qr-section-title">¿Necesitas contactar con el propietario?</div>
            <p style={{ color: '#9C8672', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Selecciona el motivo y envía un aviso. El propietario recibirá una
              notificación al instante. <strong>Tus datos no serán compartidos.</strong>
            </p>

           <ContactForm qrId={qr.id} matricula={data.num_serie || ''} tipo="bicicleta" />
          </div>
        </div>

        <div className="qr-footer">
          <span>Servicio de contacto anónimo</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:36,height:36}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }
  // --- BICICLETA / PATINETE ---
  if (qr.object_type === 'bicicleta') {
    const tipoLabel = data.tipo === 'ebike' ? '⚡ E-Bike' 
      : data.tipo === 'patinete' ? '🛴 Patinete eléctrico' 
      : '🚲 Bicicleta';

    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">{tipoLabel} · QRnet</span>
          <span className="qr-badge">Contacto anónimo</span>
        </div>
        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon">{data.tipo === 'patinete' ? '🛴' : '🚲'}</div>
              <div>
                <div className="qr-sublabel">Registrado en QRnet</div>
                <div className="qr-estab-name">
                  {data.marca} {data.modelo}
                  {data.color ? ` · ${data.color}` : ''}
                </div>
              </div>
            </div>
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>
          <div className="qr-body">
            <div className="qr-section-title">¿Necesitas contactar con el propietario?</div>
            <p style={{ color: '#9C8672', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Selecciona el motivo y envía un aviso. El propietario recibirá una
              notificación al instante. <strong>Tus datos no serán compartidos.</strong>
            </p>
            <ContactForm qrId={qr.id} matricula={data.num_serie || ''} />
          </div>
        </div>
        <div className="qr-footer">
          <span>Servicio de contacto anónimo</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:36,height:36}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }


  // --- QR PERSONAL ---

  // --- EMPRESA / AUTÓNOMO ---
  if (qr.object_type === 'empresa') {
    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">🏢 QRnet · Empresa</span>
          <span className="qr-badge">Tarjeta digital</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon">🏢</div>
              <div>
                <div className="qr-sublabel">{data.sector || 'Empresa'}</div>
                <div className="qr-estab-name">{data.nombre_comercial}</div>
              </div>
            </div>
            {data.direccion && (
              <div className="qr-addr">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{data.direccion}{data.codigo_postal ? `, ${data.codigo_postal}` : ''} {data.ciudad}{data.provincia ? ` (${data.provincia})` : ''}</span>
              </div>
            )}
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            <div className="qr-section-title">Datos de la empresa</div>
            <div className="qr-info-grid">
              {data.razon_social && (
                <div className="qr-info-item full">
                  <div className="qr-ikey">Razón social</div>
                  <div className="qr-ival">{data.razon_social}</div>
                </div>
              )}
              {data.cif_nif && (
                <div className="qr-info-item">
                  <div className="qr-ikey">CIF / NIF</div>
                  <div className="qr-ival">{data.cif_nif}</div>
                </div>
              )}
              {data.sector && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Sector</div>
                  <div className="qr-ival">{data.sector}</div>
                </div>
              )}
            </div>

            <div className="qr-divider" />

            <div className="qr-section-title">Contacto</div>
            <div className="qr-info-grid">
              {data.tel_movil && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Móvil</div>
                  <div className="qr-ival"><a href={`tel:${data.tel_movil}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.tel_movil}</a></div>
                </div>
              )}
              {data.tel_fijo && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Teléfono fijo</div>
                  <div className="qr-ival"><a href={`tel:${data.tel_fijo}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.tel_fijo}</a></div>
                </div>
              )}
              {data.email && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Email</div>
                  <div className="qr-ival"><a href={`mailto:${data.email}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.email}</a></div>
                </div>
              )}
              {data.web && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Web</div>
                  <div className="qr-ival"><a href={data.web} target="_blank" rel="noreferrer" style={{color:'#00c8ff',textDecoration:'none'}}>{data.web.replace('https://','').replace('http://','')}</a></div>
                </div>
              )}
            </div>

            {(data.linkedin || data.instagram || data.facebook || data.twitter || data.tiktok || data.youtube) && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Redes sociales</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginTop:'12px'}}>
                  {data.linkedin && (
                    <a href={data.linkedin} target="_blank" rel="noreferrer" style={{background:'rgba(0,119,181,.15)',color:'#0077b5',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>LinkedIn</a>
                  )}
                  {data.instagram && (
                    <a href={`https://instagram.com/${data.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{background:'rgba(225,48,108,.15)',color:'#e1306c',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>Instagram</a>
                  )}
                  {data.facebook && (
                    <a href={data.facebook} target="_blank" rel="noreferrer" style={{background:'rgba(24,119,242,.15)',color:'#1877f2',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>Facebook</a>
                  )}
                  {data.twitter && (
                    <a href={`https://x.com/${data.twitter.replace('@','')}`} target="_blank" rel="noreferrer" style={{background:'rgba(255,255,255,.1)',color:'#f0f8ff',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>X / Twitter</a>
                  )}
                  {data.tiktok && (
                    <a href={`https://tiktok.com/@${data.tiktok.replace('@','')}`} target="_blank" rel="noreferrer" style={{background:'rgba(255,0,80,.15)',color:'#ff0050',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>TikTok</a>
                  )}
                  {data.youtube && (
                    <a href={data.youtube} target="_blank" rel="noreferrer" style={{background:'rgba(255,0,0,.15)',color:'#ff0000',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>YouTube</a>
                  )}
                </div>
              </>
            )}

            {data.contacto_nombre && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Persona de contacto</div>
                <div className="qr-resp-block">
                  <div className="qr-avatar">{(data.contacto_nombre || 'E').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="qr-resp-name">{data.contacto_nombre}</div>
                    {data.contacto_cargo && <div className="qr-resp-role">{data.contacto_cargo}</div>}
                    {data.contacto_movil && (
                      <div className="qr-resp-tel">
                        <a href={`tel:${data.contacto_movil}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.contacto_movil}</a>
                      </div>
                    )}
                    {data.contacto_email && (
                      <div className="qr-resp-tel">
                        <a href={`mailto:${data.contacto_email}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.contacto_email}</a>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {data.observaciones && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Información adicional</div>
                <p style={{color:'#9C8672',fontSize:'14px',lineHeight:'1.6'}}>{data.observaciones}</p>
              </>
            )}
          </div>
        </div>

        <div className="qr-footer">
          <span>Tarjeta digital verificada</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:22,height:22}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }
  if (qr.object_type === 'personal') {
    const v = data.visible || {};

    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">👤 QRnet · Personal</span>
          <span className="qr-badge">Perfil privado</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon" style={{fontSize:'32px'}}>👤</div>
              <div>
                <div className="qr-estab-name">{data.nombre}</div>
                <div className="qr-sublabel" style={{color:'#00c8ff'}}>@{data.username}</div>
              </div>
            </div>
            {v.profesion && data.profesion && (
              <div style={{color:'#9C8672',fontSize:'13px',marginTop:'8px'}}>{data.profesion}</div>
            )}
            {v.ciudad && data.ciudad && (
              <div className="qr-addr">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{data.ciudad}</span>
              </div>
            )}
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            {v.bio && data.bio && (
              <>
                <div className="qr-section-title">Sobre mí</div>
                <p style={{color:'#c8dde5',fontSize:'14px',lineHeight:'1.6',marginBottom:'24px'}}>{data.bio}</p>
              </>
            )}

            {(v.telefono && data.telefono) || (v.email && data.email) || (v.web && data.web) ? (
              <>
                <div className="qr-section-title">Contacto</div>
                <div className="qr-info-grid">
                  {v.telefono && data.telefono && (
                    <div className="qr-info-item">
                      <div className="qr-ikey">Teléfono</div>
                      <div className="qr-ival"><a href={`tel:${data.telefono}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.telefono}</a></div>
                    </div>
                  )}
                  {v.email && data.email && (
                    <div className="qr-info-item">
                      <div className="qr-ikey">Email</div>
                      <div className="qr-ival"><a href={`mailto:${data.email}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.email}</a></div>
                    </div>
                  )}
                  {v.web && data.web && (
                    <div className="qr-info-item">
                      <div className="qr-ikey">Web</div>
                      <div className="qr-ival"><a href={data.web} target="_blank" rel="noreferrer" style={{color:'#00c8ff',textDecoration:'none'}}>{data.web.replace('https://','').replace('http://','')}</a></div>
                    </div>
                  )}
                </div>
              </>
            ) : null}

            {((v.linkedin && data.linkedin) || (v.instagram && data.instagram) || (v.facebook && data.facebook) || (v.twitter && data.twitter) || (v.tiktok && data.tiktok) || (v.youtube && data.youtube)) && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Redes sociales</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:'10px',marginTop:'12px'}}>
                  {v.linkedin && data.linkedin && (
                    <a href={data.linkedin} target="_blank" rel="noreferrer" style={{background:'rgba(0,119,181,.15)',color:'#0077b5',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>LinkedIn</a>
                  )}
                  {v.instagram && data.instagram && (
                    <a href={`https://instagram.com/${data.instagram.replace('@','')}`} target="_blank" rel="noreferrer" style={{background:'rgba(225,48,108,.15)',color:'#e1306c',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>Instagram</a>
                  )}
                  {v.facebook && data.facebook && (
                    <a href={data.facebook} target="_blank" rel="noreferrer" style={{background:'rgba(24,119,242,.15)',color:'#1877f2',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>Facebook</a>
                  )}
                  {v.twitter && data.twitter && (
                    <a href={`https://x.com/${data.twitter.replace('@','')}`} target="_blank" rel="noreferrer" style={{background:'rgba(255,255,255,.1)',color:'#f0f8ff',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>X / Twitter</a>
                  )}
                  {v.tiktok && data.tiktok && (
                    <a href={`https://tiktok.com/@${data.tiktok.replace('@','')}`} target="_blank" rel="noreferrer" style={{background:'rgba(255,0,80,.15)',color:'#ff0050',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>TikTok</a>
                  )}
                  {v.youtube && data.youtube && (
                    <a href={data.youtube} target="_blank" rel="noreferrer" style={{background:'rgba(255,0,0,.15)',color:'#ff0000',padding:'10px 16px',borderRadius:'10px',fontSize:'13px',fontWeight:600,textDecoration:'none'}}>YouTube</a>
                  )}
                </div>
              </>
            )}

            <div className="qr-divider" />

            <div className="qr-section-title">💬 Enviar mensaje privado</div>
            <p style={{color:'#9C8672',fontSize:'13px',lineHeight:'1.6',marginBottom:'16px'}}>
              Envía un mensaje a <strong style={{color:'#00c8ff'}}>{data.nombre}</strong> sin revelar tus datos personales.
              Recibirá tu mensaje de forma anónima.
            </p>
            <ContactForm qrId={qr.id} matricula="" tipo="personal" />
          </div>
        </div>

        <div className="qr-footer">
          <span>Perfil privado verificado</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:36,height:36}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }


  // --- MASCOTA ---
  if (qr.object_type === 'mascota') {
    const tipoEmoji = data.tipo_mascota === 'gato' ? '🐈' 
      : data.tipo_mascota === 'ave' ? '🦜'
      : data.tipo_mascota === 'conejo' ? '🐇'
      : '🐕';

    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">{tipoEmoji} QRnet · Mascota</span>
          <span className="qr-badge">Contacto inmediato</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon" style={{fontSize:'32px'}}>{tipoEmoji}</div>
              <div>
                <div className="qr-sublabel">{data.raza || 'Mascota registrada'}</div>
                <div className="qr-estab-name">{data.nombre}</div>
              </div>
            </div>
            {data.ciudad && (
              <div className="qr-addr">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{data.ciudad}</span>
              </div>
            )}
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            <div className="qr-section-title">Datos de la mascota</div>
            <div className="qr-info-grid">
              {data.color && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Color</div>
                  <div className="qr-ival">{data.color}</div>
                </div>
              )}
              {data.sexo && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Sexo</div>
                  <div className="qr-ival">{data.sexo === 'Macho' ? '♂️' : '♀️'} {data.sexo}</div>
                </div>
              )}
              {data.edad && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Edad</div>
                  <div className="qr-ival">{data.edad}</div>
                </div>
              )}
              {data.peso && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Peso</div>
                  <div className="qr-ival">{data.peso}</div>
                </div>
              )}
              {data.microchip && (
                <div className="qr-info-item full">
                  <div className="qr-ikey">Nº Microchip</div>
                  <div className="qr-ival">{data.microchip}</div>
                </div>
              )}
            </div>

            {(data.alergias || data.medicacion || data.vacunas_dia) && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Salud</div>
                <div className="qr-info-grid">
                  <div className="qr-info-item">
                    <div className="qr-ikey">Vacunas al día</div>
                    <div className="qr-ival">{data.vacunas_dia === 'si' ? '✅ Sí' : '❌ No'}</div>
                  </div>
                  {data.alergias && (
                    <div className="qr-info-item">
                      <div className="qr-ikey">⚠️ Alergias</div>
                      <div className="qr-ival" style={{color:'#ff6b35'}}>{data.alergias}</div>
                    </div>
                  )}
                  {data.medicacion && (
                    <div className="qr-info-item full">
                      <div className="qr-ikey">💊 Medicación</div>
                      <div className="qr-ival">{data.medicacion}</div>
                    </div>
                  )}
                </div>
              </>
            )}

            {data.veterinario && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Veterinario</div>
                <div className="qr-info-grid">
                  <div className="qr-info-item">
                    <div className="qr-ikey">Clínica</div>
                    <div className="qr-ival">{data.veterinario}</div>
                  </div>
                  {data.tel_veterinario && (
                    <div className="qr-info-item">
                      <div className="qr-ikey">Teléfono</div>
                      <div className="qr-ival"><a href={`tel:${data.tel_veterinario}`} style={{color:'#00c8ff',textDecoration:'none'}}>{data.tel_veterinario}</a></div>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="qr-divider" />

            <div className="qr-section-title">¿Has encontrado a esta mascota?</div>
            <p style={{ color: '#9C8672', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Selecciona el motivo y avisa al propietario. Recibirá una
              notificación al instante. <strong>Tus datos no serán compartidos.</strong>
            </p>

            <ContactForm qrId={qr.id} matricula={data.microchip || ''} tipo="mascota" />
          </div>
        </div>

        <div className="qr-footer">
          <span>Servicio de contacto inmediato</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:22,height:22}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }

  // --- OBJETO PERSONAL ---
  if (qr.object_type === 'objeto') {
    const tipoEmoji = data.tipo_objeto === 'llaves' ? '🔑'
      : data.tipo_objeto === 'cartera' ? '👛'
      : data.tipo_objeto === 'mochila' ? '🎒'
      : data.tipo_objeto === 'maleta' ? '🧳'
      : data.tipo_objeto === 'portatil' ? '💻'
      : data.tipo_objeto === 'camara' ? '📷'
      : data.tipo_objeto === 'auriculares' ? '🎧'
      : data.tipo_objeto === 'instrumento' ? '🎸'
      : data.tipo_objeto === 'deporte' ? '⚽'
      : data.tipo_objeto === 'paraguas' ? '☂️'
      : data.tipo_objeto === 'gafas' ? '👓'
      : data.tipo_objeto === 'herramientas' ? '🔧'
      : '📦';

    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">{tipoEmoji} QRnet · Objeto</span>
          <span className="qr-badge">Contacto inmediato</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon" style={{fontSize:'32px'}}>{tipoEmoji}</div>
              <div>
                <div className="qr-sublabel">Objeto registrado</div>
                <div className="qr-estab-name">{data.descripcion}</div>
              </div>
            </div>
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            {data.recompensa === 'si' && (
              <div style={{background:'rgba(255,200,0,.1)',border:'1px solid rgba(255,200,0,.3)',borderRadius:'12px',padding:'16px 20px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'12px'}}>
                <span style={{fontSize:'28px'}}>🎁</span>
                <div>
                  <div style={{color:'#f0f8ff',fontSize:'15px',fontWeight:700}}>Recompensa por devolución</div>
                  <div style={{color:'#ffc800',fontSize:'14px',fontWeight:600}}>{data.recompensa_cantidad || 'El propietario ofrece recompensa'}</div>
                </div>
              </div>
            )}

            <div className="qr-section-title">Datos del objeto</div>
            <div className="qr-info-grid">
              {data.marca && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Marca</div>
                  <div className="qr-ival">{data.marca}</div>
                </div>
              )}
              {data.modelo && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Modelo</div>
                  <div className="qr-ival">{data.modelo}</div>
                </div>
              )}
              {data.color && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Color</div>
                  <div className="qr-ival">{data.color}</div>
                </div>
              )}
              {data.num_serie && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Nº de serie</div>
                  <div className="qr-ival">{data.num_serie}</div>
                </div>
              )}
            </div>

            {data.nombre_propietario && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Propietario</div>
                <div className="qr-resp-block">
                  <div className="qr-avatar">{(data.nombre_propietario || 'P').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="qr-resp-name">{data.nombre_propietario}</div>
                    {data.ciudad && <div className="qr-resp-role">{data.ciudad}</div>}
                  </div>
                </div>
              </>
            )}

            <div className="qr-divider" />

            <div className="qr-section-title">¿Has encontrado este objeto?</div>
            <p style={{ color: '#9C8672', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Avisa al propietario. Recibirá una notificación al instante.
              <strong> Tus datos no serán compartidos.</strong>
              {data.recompensa === 'si' && (
                <span style={{color:'#ffc800'}}> El propietario ofrece recompensa por la devolución.</span>
              )}
            </p>

            <ContactForm qrId={qr.id} matricula={data.num_serie || ''} tipo="objeto" />
          </div>
        </div>

        <div className="qr-footer">
          <span>Servicio de contacto inmediato</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:22,height:22}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }

  // --- OBJETO PERSONAL ---
  if (qr.object_type === 'objeto') {
    const tipoEmoji = data.tipo_objeto === 'llaves' ? '🔑'
      : data.tipo_objeto === 'cartera' ? '👛'
      : data.tipo_objeto === 'mochila' ? '🎒'
      : data.tipo_objeto === 'maleta' ? '🧳'
      : data.tipo_objeto === 'portatil' ? '💻'
      : data.tipo_objeto === 'camara' ? '📷'
      : data.tipo_objeto === 'auriculares' ? '🎧'
      : data.tipo_objeto === 'instrumento' ? '🎸'
      : data.tipo_objeto === 'deporte' ? '⚽'
      : data.tipo_objeto === 'paraguas' ? '☂️'
      : data.tipo_objeto === 'gafas' ? '👓'
      : data.tipo_objeto === 'herramientas' ? '🔧'
      : '📦';

    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">{tipoEmoji} QRnet · Objeto</span>
          <span className="qr-badge">Contacto inmediato</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon" style={{fontSize:'32px'}}>{tipoEmoji}</div>
              <div>
                <div className="qr-sublabel">Objeto registrado</div>
                <div className="qr-estab-name">{data.descripcion}</div>
              </div>
            </div>
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              QR verificado · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            {data.recompensa === 'si' && (
              <div style={{background:'rgba(255,200,0,.1)',border:'1px solid rgba(255,200,0,.3)',borderRadius:'12px',padding:'16px 20px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'12px'}}>
                <span style={{fontSize:'28px'}}>🎁</span>
                <div>
                  <div style={{color:'#f0f8ff',fontSize:'15px',fontWeight:700}}>Recompensa por devolución</div>
                  <div style={{color:'#ffc800',fontSize:'14px',fontWeight:600}}>{data.recompensa_cantidad || 'El propietario ofrece recompensa'}</div>
                </div>
              </div>
            )}

            <div className="qr-section-title">Datos del objeto</div>
            <div className="qr-info-grid">
              {data.marca && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Marca</div>
                  <div className="qr-ival">{data.marca}</div>
                </div>
              )}
              {data.modelo && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Modelo</div>
                  <div className="qr-ival">{data.modelo}</div>
                </div>
              )}
              {data.color && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Color</div>
                  <div className="qr-ival">{data.color}</div>
                </div>
              )}
              {data.num_serie && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Nº de serie</div>
                  <div className="qr-ival">{data.num_serie}</div>
                </div>
              )}
            </div>

            {data.nombre_propietario && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Propietario</div>
                <div className="qr-resp-block">
                  <div className="qr-avatar">{(data.nombre_propietario || 'P').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="qr-resp-name">{data.nombre_propietario}</div>
                    {data.ciudad && <div className="qr-resp-role">{data.ciudad}</div>}
                  </div>
                </div>
              </>
            )}

            <div className="qr-divider" />

            <div className="qr-section-title">¿Has encontrado este objeto?</div>
            <p style={{ color: '#9C8672', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
              Avisa al propietario. Recibirá una notificación al instante.
              <strong> Tus datos no serán compartidos.</strong>
              {data.recompensa === 'si' && (
                <span style={{color:'#ffc800'}}> El propietario ofrece recompensa por la devolución.</span>
              )}
            </p>

            <ContactForm qrId={qr.id} matricula={data.num_serie || ''} tipo="objeto" />
          </div>
        </div>

        <div className="qr-footer">
          <span>Servicio de contacto inmediato</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:22,height:22}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }

  // --- VERIFICACIÓN RECOGIDA ---
  if (qr.object_type === 'verificacion_recogida') {
    const autorizados = data.autorizados || [];

    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">🏫 QRnet · Autorización</span>
          <span className="qr-badge">Verificación activa</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon" style={{fontSize:'32px'}}>🏫</div>
              <div>
                <div className="qr-sublabel">{data.centro}</div>
                <div className="qr-estab-name">Recogida de {data.nombre_menor}</div>
              </div>
            </div>
            {data.ciudad && (
              <div className="qr-addr">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{data.direccion_centro ? `${data.direccion_centro}, ` : ''}{data.ciudad}</span>
              </div>
            )}
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              Autorización activa · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            <div className="qr-section-title">Datos del menor</div>
            <div className="qr-info-grid">
              <div className="qr-info-item full">
                <div className="qr-ikey">Nombre</div>
                <div className="qr-ival" style={{fontSize:'16px',fontWeight:700}}>{data.nombre_menor}</div>
              </div>
              {data.edad && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Edad</div>
                  <div className="qr-ival">{data.edad}</div>
                </div>
              )}
              {data.curso && (
                <div className="qr-info-item">
                  <div className="qr-ikey">Curso</div>
                  <div className="qr-ival">{data.curso}</div>
                </div>
              )}
            </div>

            <div className="qr-divider" />

            <div className="qr-section-title">Tutor principal</div>
            <div className="qr-resp-block">
              <div className="qr-avatar">{(data.nombre_tutor || 'T').charAt(0).toUpperCase()}</div>
              <div>
                <div className="qr-resp-name">{data.nombre_tutor}</div>
                <div className="qr-resp-role">{data.parentesco_tutor || 'Tutor'}</div>
                {data.dni_tutor && (
                  <div style={{color:'#6a8a95',fontSize:'12px',marginTop:'4px'}}>DNI: {data.dni_tutor}</div>
                )}
              </div>
            </div>
            <div className="qr-divider" />
            <PinVerificacion
              autorizados={autorizados}
              nombreMenor={data.nombre_menor}
              centro={data.centro}
              publicCode={qr.public_code}
            />
          </div>
        </div>

        <div className="qr-footer">
          <span>Autorización verificada por QRnet</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:22,height:22}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );

  }

  // --- VERIFICACIÓN ENCUENTRO ---
  if (qr.object_type === 'verificacion_encuentro') {
    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">🤝 QRnet · Verificación</span>
          <span className="qr-badge">{data.fecha_verificacion ? 'Verificado ✅' : 'Pendiente'}</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon" style={{fontSize:'32px'}}>🤝</div>
              <div>
                <div className="qr-sublabel">{data.motivo_label}</div>
                <div className="qr-estab-name">{data.descripcion}</div>
              </div>
            </div>
            {data.lugar && (
              <div className="qr-addr">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{data.lugar}{data.ciudad ? `, ${data.ciudad}` : ''}</span>
              </div>
            )}
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              {data.fecha_verificacion ? 'Encuentro verificado' : 'Verificación pendiente'} · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            <div className="qr-section-title">Participantes</div>
            <div style={{display:'flex',gap:'12px',marginBottom:'24px',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:'140px',background:'rgba(0,200,255,.05)',borderRadius:'12px',padding:'16px',textAlign:'center'}}>
                <div style={{fontSize:'24px',marginBottom:'8px'}}>👤</div>
                <div style={{color:'#f0f8ff',fontSize:'15px',fontWeight:700}}>{data.nombre_a}</div>
                <div style={{color:'#9C8672',fontSize:'12px'}}>Persona A</div>
              </div>
              <div style={{display:'flex',alignItems:'center',fontSize:'20px',color:'#6a8a95'}}>↔</div>
              <div style={{flex:1,minWidth:'140px',background:'rgba(0,200,255,.05)',borderRadius:'12px',padding:'16px',textAlign:'center'}}>
                <div style={{fontSize:'24px',marginBottom:'8px'}}>👤</div>
                <div style={{color:'#f0f8ff',fontSize:'15px',fontWeight:700}}>{data.nombre_b}</div>
                <div style={{color:'#9C8672',fontSize:'12px'}}>Persona B</div>
              </div>
            </div>

            {data.fecha_prevista && (
              <div className="qr-info-grid" style={{marginBottom:'24px'}}>
                <div className="qr-info-item">
                  <div className="qr-ikey">Fecha prevista</div>
                  <div className="qr-ival">{new Date(data.fecha_prevista).toLocaleDateString('es-ES', {dateStyle:'long'})}</div>
                </div>
              </div>
            )}

            {data.fecha_verificacion ? (
              <div style={{
                background:'rgba(0,200,100,.1)',
                border:'2px solid rgba(0,200,100,.4)',
                borderRadius:'16px',
                padding:'24px',
                textAlign:'center',
              }}>
                <div style={{fontSize:'48px',marginBottom:'12px'}}>✅</div>
                <h3 style={{color:'#00c864',fontSize:'20px',fontWeight:800,marginBottom:'8px'}}>
                  ENCUENTRO VERIFICADO
                </h3>
                <p style={{color:'#9C8672',fontSize:'14px'}}>
                  Verificado el {new Date(data.fecha_verificacion).toLocaleString('es-ES', {dateStyle:'long',timeStyle:'short'})}
                </p>
              </div>
            ) : (
              <>
                <div className="qr-divider" />
                <PinEncuentro
                  nombreA={data.nombre_a}
                  nombreB={data.nombre_b}
                  descripcion={data.descripcion}
                  motivoLabel={data.motivo_label}
                  qrId={qr.id}
                  publicCode={qr.public_code}
                />
              </>
            )}

            {data.observaciones && (
              <>
                <div className="qr-divider" />
                <div className="qr-section-title">Observaciones</div>
                <p style={{color:'#9C8672',fontSize:'14px',lineHeight:'1.6'}}>{data.observaciones}</p>
              </>
            )}
          </div>
        </div>

        <div className="qr-footer">
          <span>Verificación certificada</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:22,height:22}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }

  // --- COLA / TURNO ---
  if (qr.object_type === 'cola') {
    return (
      <div className="qr-page">
        <div className="qr-topbar">
          <span className="qr-brand">📋 QRnet · Cola</span>
          <span className="qr-badge">Lista de espera</span>
        </div>

        <div className="qr-card">
          <div className="qr-card-header">
            <div className="qr-estab-row">
              <div className="qr-estab-icon" style={{fontSize:'32px'}}>
                {data.tipo_local === 'bar' ? '🍺' : data.tipo_local === 'tapas' ? '🫒' : data.tipo_local === 'brunch' ? '🥞' : '🍽️'}
              </div>
              <div>
                <div className="qr-sublabel">{data.tipo_label}</div>
                <div className="qr-estab-name">{data.nombre_local}</div>
              </div>
            </div>
            {data.direccion && (
              <div className="qr-addr">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{data.direccion}{data.ciudad ? `, ${data.ciudad}` : ''}</span>
              </div>
            )}
            <div className="qr-status-pill">
              <div className="qr-status-dot" />
              Cola activa · {qr.public_code}
            </div>
          </div>

          <div className="qr-body">
            {data.mensaje_bienvenida && (
              <div style={{background:'rgba(0,200,255,.06)',border:'1px solid rgba(0,200,255,.15)',borderRadius:'12px',padding:'16px',marginBottom:'24px'}}>
                <p style={{color:'#c8dde5',fontSize:'14px',lineHeight:'1.6',margin:0}}>{data.mensaje_bienvenida}</p>
              </div>
            )}

            <div className="qr-section-title">Únete a la lista de espera</div>
            <p style={{color:'#9C8672',fontSize:'14px',lineHeight:'1.6',marginBottom:'20px'}}>
              Regístrate y te avisaremos cuando tu mesa esté lista.
              <strong> No pierdas tu sitio en la cola.</strong>
            </p>

            <QueueForm qrId={qr.id} turnos={data.usa_turnos ? data.turnos : undefined} />
          </div>
        </div>

        <div className="qr-footer">
          <span>Gestión de cola</span>
          <span className="qr-footer-logo" style={{display:"flex",alignItems:"center",gap:"8px"}}><img src="/logo.png" alt="QRnet.io" style={{width:22,height:22}} />QRnet.io</span>
          <a href="https://qrnet.io" target="_blank" rel="noreferrer">qrnet.io</a>
        </div>
      </div>
    );
  }

  // --- MÁQUINAS (código original) ---
  const waTel = (data.tel_resp || '').replace(/\D/g, '');
  const waTxt = encodeURIComponent(
    `🚨 *INCIDENCIA ${data.tipo_maquina === 'vending' ? 'MÁQUINA VENDING' : 'MÁQUINA DE TABACO'}*\n\n` +
    `🔷 *ID:* ${qr.public_code}\n` +
    `🏪 *Establecimiento:* ${data.estab_nombre}\n` +
    `📍 *Dirección:* ${data.estab_dir}, ${data.estab_ciudad}\n\n` +
    `✏️ *Problema:* `
  );

  const pvr = pvrStatus(data.pvr_caducidad);
  const inicial = (data.estab_nombre || 'N').charAt(0).toUpperCase();
  const esMaquinaTabaco = data.tipo_maquina !== 'vending';

  return (
    <div className="qr-page">
      <div className="qr-topbar">
        <span className="qr-brand">
          {data.tipo_maquina === 'vending' ? '🥤 NVM · Vending' : '🚬 NVM · Máquinas de Tabaco'}
        </span>
        <span className="qr-badge">Gestión de incidencias</span>
      </div>

      <div className="qr-card">
        <div className="qr-card-header">
          <div className="qr-estab-row">
            <div className="qr-estab-icon">🏪</div>
            <div>
              <div className="qr-sublabel">Establecimiento</div>
              <div className="qr-estab-name">{data.estab_nombre}</div>
            </div>
          </div>
          <div className="qr-addr">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>{data.estab_dir}{data.estab_cp ? `, ${data.estab_cp}` : ''} {data.estab_ciudad}</span>
          </div>
          <div className="qr-status-pill">
            <div className="qr-status-dot" />
            Máquina operativa
          </div>
        </div>

        <div className="qr-body">
          <div className="qr-section-title">Datos de la máquina</div>
          <div className="qr-info-grid">
            <div className="qr-info-item full">
              <div className="qr-ikey">Identificador</div>
              <div className="qr-ival">{qr.public_code}</div>
            </div>
            {data.fabricante && (
              <div className="qr-info-item">
                <div className="qr-ikey">Fabricante</div>
                <div className="qr-ival">{data.fabricante}</div>
              </div>
            )}
            {data.modelo && (
              <div className="qr-info-item">
                <div className="qr-ikey">Modelo</div>
                <div className="qr-ival">{data.modelo}</div>
              </div>
            )}
            {data.num_serie && (
              <div className="qr-info-item">
                <div className="qr-ikey">Nº de serie</div>
                <div className="qr-ival">{data.num_serie}</div>
              </div>
            )}
            {data.fecha_inst && (
              <div className="qr-info-item">
                <div className="qr-ikey">Fecha instalación</div>
                <div className="qr-ival">
                  {new Date(data.fecha_inst).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                </div>
              </div>
            )}
            {esMaquinaTabaco && pvr && (
              <div className="qr-info-item full">
                <div className="qr-ikey">Tasa PVR · Permiso de Venta en Ruta</div>
                <div className={`qr-ival ${pvr.clase}`}>
                  {pvr.estado === 'ok' ? '✔' : pvr.estado === 'aviso' ? '⚠' : '✘'} {pvr.texto}
                </div>
              </div>
            )}
          </div>

          <div className="qr-divider" />

          <div className="qr-section-title">Responsable</div>
          <div className="qr-resp-block">
            <div className="qr-avatar">{inicial}</div>
            <div>
              <div className="qr-resp-name">{data.estab_nombre}</div>
              <div className="qr-resp-role">Gestor · {data.estab_ciudad}</div>
              <div className="qr-resp-addr">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9C8672" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {data.estab_dir}, {data.estab_ciudad}
              </div>
              <div className="qr-resp-tel">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.08 3.4 2 2 0 0 1 3.05 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
                </svg>
                {data.tel_resp}
              </div>
            </div>
          </div>

          <div className="qr-divider" />

          <a className="qr-btn-wa"
            href={`https://wa.me/${waTel}?text=${waTxt}`}
            target="_blank" rel="noreferrer">
            <svg width="21" height="21" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Reportar incidencia por WhatsApp
          </a>
          <p className="qr-hint">
            WhatsApp se abrirá con los datos de la máquina ya incluidos.<br />
            Solo describe el problema y pulsa enviar.
          </p>
        </div>
      </div>

      <div className="qr-footer">
        <span>Servicio gestionado por</span>
        <span className="qr-footer-logo">NVM · Nueva Vending Machines</span>
        <a href="https://www.maquinasdetabaco.com" target="_blank" rel="noreferrer">maquinasdetabaco.com</a>
        <span style={{marginTop: '8px', opacity: .4}}>
          Powered by <a href="https://qrnet.io" style={{color: 'inherit'}}>QRnet.io</a>
        </span>
      </div>
    </div>
  );
}