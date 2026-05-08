'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const DOT_STYLES = [
  { val: 'square', label: '■ Cuadrado' },
  { val: 'dots', label: '● Círculos' },
  { val: 'rounded', label: '◼ Redondeado' },
  { val: 'extra-rounded', label: '◯ Extra redondo' },
  { val: 'classy', label: '◆ Clásico' },
  { val: 'classy-rounded', label: '◇ Clásico redondo' },
];

const CORNER_STYLES = [
  { val: 'square', label: '■ Cuadrado' },
  { val: 'dot', label: '● Redondo' },
  { val: 'extra-rounded', label: '◼ Extra redondo' },
];

const COLORES_PRESET = [
  { color: '#000000', label: 'Negro' },
  { color: '#00c8ff', label: 'Cyan QRnet' },
  { color: '#0066cc', label: 'Azul' },
  { color: '#cc0000', label: 'Rojo' },
  { color: '#006600', label: 'Verde' },
  { color: '#663399', label: 'Morado' },
  { color: '#ff6600', label: 'Naranja' },
  { color: '#333333', label: 'Gris oscuro' },
];

const FONDOS_PRESET = [
  { color: '#ffffff', label: 'Blanco' },
  { color: '#f0f8ff', label: 'Azul claro' },
  { color: '#f5f5dc', label: 'Beige' },
  { color: '#ffffcc', label: 'Amarillo claro' },
  { color: '#000000', label: 'Negro' },
  { color: 'transparent', label: 'Transparente' },
];

const TAMANOS = [
  { val: 300, label: 'Pequeño (300px)' },
  { val: 500, label: 'Mediano (500px)' },
  { val: 800, label: 'Grande (800px)' },
  { val: 1200, label: 'XL (1200px)' },
];

export default function EditorQR() {
  const params = useParams();
  const router = useRouter();
  const qrId = params.id as string;
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<any>(null);
  const [publicUrl, setPublicUrl] = useState('');

  const [config, setConfig] = useState({
    dotColor: '#000000',
    bgColor: '#ffffff',
    dotStyle: 'square',
    cornerStyle: 'square',
    cornerDotStyle: 'square',
    size: 500,
    textoArriba: '',
    textoAbajo: '',
    useLogo: false,
  });

  // Load QR data
  useEffect(() => {
    fetch(`/api/qr/${qrId}`)
      .then(r => r.json())
      .then(data => {
        setQrData(data);
        setPublicUrl(`https://qrnet.io/q/${data.public_code}`);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [qrId]);

  // Initialize and update QR
  useEffect(() => {
    if (!publicUrl || typeof window === 'undefined') return;

    const initQR = async () => {
      const QRCodeStyling = (await import('qr-code-styling')).default;

      const options: any = {
        width: config.size,
        height: config.size,
        data: publicUrl,
        dotsOptions: {
          color: config.dotColor,
          type: config.dotStyle,
        },
        backgroundOptions: {
          color: config.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : config.bgColor,
        },
        cornersSquareOptions: {
          type: config.cornerStyle,
          color: config.dotColor,
        },
        cornersDotOptions: {
          type: config.cornerDotStyle,
          color: config.dotColor,
        },
        imageOptions: {
          crossOrigin: 'anonymous',
          margin: 8,
        },
      };

      if (config.useLogo) {
        options.image = '/logo.png';
        options.imageOptions.imageSize = 0.3;
      }

      if (qrCodeRef.current) {
        qrCodeRef.current._options = options;
        qrCodeRef.current.update(options);
      } else {
        qrCodeRef.current = new QRCodeStyling(options);
        if (qrRef.current) {
          qrRef.current.innerHTML = '';
          qrCodeRef.current.append(qrRef.current);
        }
      }
    };

    initQR();
  }, [publicUrl, config]);

  const set = (key: string, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const descargarPNG = async () => {
    if (!qrCodeRef.current) return;

    if (config.textoArriba || config.textoAbajo) {
      // Generate with text using canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const padding = 40;
      const fontSize = Math.max(24, config.size * 0.06);
      const gap = 20;

      let totalH = config.size + padding * 2;
      if (config.textoArriba) totalH += fontSize + gap;
      if (config.textoAbajo) totalH += fontSize + gap;
      const totalW = config.size + padding * 2;

      canvas.width = totalW;
      canvas.height = totalH;

      ctx.fillStyle = config.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : config.bgColor;
      ctx.fillRect(0, 0, totalW, totalH);

      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = config.dotColor;
      ctx.textAlign = 'center';

      let yOffset = padding;
      if (config.textoArriba) {
        ctx.fillText(config.textoArriba, totalW / 2, yOffset + fontSize);
        yOffset += fontSize + gap;
      }

      // Draw QR
      const blob = await qrCodeRef.current.getRawData('png');
      const img = new window.Image();
      img.src = URL.createObjectURL(blob);
      await new Promise(resolve => { img.onload = resolve; });
      ctx.drawImage(img, padding, yOffset, config.size, config.size);
      yOffset += config.size + gap;

      if (config.textoAbajo) {
        ctx.fillText(config.textoAbajo, totalW / 2, yOffset + fontSize * 0.8);
      }

      const link = document.createElement('a');
      link.download = `QR-${qrData?.public_code || 'custom'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      qrCodeRef.current.download({ name: `QR-${qrData?.public_code || 'custom'}`, extension: 'png' });
    }
  };

  const descargarSVG = () => {
    if (qrCodeRef.current) {
      qrCodeRef.current.download({ name: `QR-${qrData?.public_code || 'custom'}`, extension: 'svg' });
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6a8a95' }}>Cargando editor...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d1a20', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#f0f8ff', fontWeight: 700, fontSize: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="QRnet.io" style={{ width: 32, height: 32 }} />
          QRnet<span style={{ color: '#00c8ff' }}>.</span>io
        </a>
        <Link href={`/dashboard/qr/${qrId}`} style={{ color: '#00c8ff', fontSize: '14px', textDecoration: 'none' }}>← Volver al QR</Link>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

        {/* Panel izquierdo: opciones */}
        <div style={{ flex: '1 1 320px', minWidth: '300px' }}>
          <h1 style={{ color: '#f0f8ff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            🎨 Editor de QR
          </h1>
          <p style={{ color: '#6a8a95', fontSize: '14px', marginBottom: '24px' }}>
            {qrData?.public_code} · Personaliza y descarga tu QR
          </p>

          {/* Color del QR */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Color del QR</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {COLORES_PRESET.map(c => (
                <button key={c.color} onClick={() => set('dotColor', c.color)}
                  title={c.label}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: c.color, border: config.dotColor === c.color ? '3px solid #00c8ff' : '2px solid rgba(255,255,255,.15)',
                    cursor: 'pointer',
                  }} />
              ))}
              <input type="color" value={config.dotColor} onChange={e => set('dotColor', e.target.value)}
                style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'none' }} />
            </div>
          </div>

          {/* Color del fondo */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Color del fondo</div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {FONDOS_PRESET.map(c => (
                <button key={c.color} onClick={() => set('bgColor', c.color)}
                  title={c.label}
                  style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: c.color === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%)' : c.color,
                    backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px',
                    border: config.bgColor === c.color ? '3px solid #00c8ff' : '2px solid rgba(255,255,255,.15)',
                    cursor: 'pointer',
                  }} />
              ))}
            </div>
          </div>

          {/* Estilo de puntos */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Estilo de puntos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {DOT_STYLES.map(d => (
                <button key={d.val} onClick={() => set('dotStyle', d.val)}
                  style={{
                    padding: '10px', borderRadius: '8px',
                    border: config.dotStyle === d.val ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                    background: config.dotStyle === d.val ? 'rgba(0,200,255,.1)' : 'transparent',
                    color: config.dotStyle === d.val ? '#00c8ff' : '#6a8a95',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Estilo de esquinas */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Estilo de esquinas</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {CORNER_STYLES.map(c => (
                <button key={c.val} onClick={() => { set('cornerStyle', c.val); set('cornerDotStyle', c.val === 'dot' ? 'dot' : 'square'); }}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px',
                    border: config.cornerStyle === c.val ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                    background: config.cornerStyle === c.val ? 'rgba(0,200,255,.1)' : 'transparent',
                    color: config.cornerStyle === c.val ? '#00c8ff' : '#6a8a95',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Logo QRnet */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Logo en el centro</div>
            <button onClick={() => set('useLogo', !config.useLogo)}
              style={{
                padding: '12px 20px', borderRadius: '10px',
                border: config.useLogo ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                background: config.useLogo ? 'rgba(0,200,255,.1)' : 'transparent',
                color: config.useLogo ? '#00c8ff' : '#6a8a95',
                cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              }}>
              {config.useLogo ? '✅ Logo QRnet activado' : 'Añadir logo QRnet'}
            </button>
          </div>

          {/* Textos */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Textos</div>
            <input type="text" placeholder="Texto encima del QR (ej: ¿INCIDENCIAS?)"
              value={config.textoArriba}
              onChange={e => set('textoArriba', e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)',
                color: '#f0f8ff', fontSize: '13px', marginBottom: '8px', outline: 'none',
              }} />
            <input type="text" placeholder="Texto debajo del QR (ej: ¡ESCANEA Y CONTACTA!)"
              value={config.textoAbajo}
              onChange={e => set('textoAbajo', e.target.value)}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)',
                color: '#f0f8ff', fontSize: '13px', outline: 'none',
              }} />
          </div>

          {/* Tamaño */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Tamaño de descarga</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {TAMANOS.map(t => (
                <button key={t.val} onClick={() => set('size', t.val)}
                  style={{
                    padding: '10px', borderRadius: '8px',
                    border: config.size === t.val ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                    background: config.size === t.val ? 'rgba(0,200,255,.1)' : 'transparent',
                    color: config.size === t.val ? '#00c8ff' : '#6a8a95',
                    cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel derecho: preview + descarga */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'sticky', top: '100px', alignSelf: 'flex-start' }}>
          <div style={{
            background: '#0d1a20', borderRadius: '20px', padding: '32px',
            border: '1px solid rgba(0,200,255,.1)', width: '100%', maxWidth: '450px',
          }}>
            <div style={{ color: '#6a8a95', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>
              Previsualización
            </div>

            {config.textoArriba && (
              <div style={{ textAlign: 'center', color: config.dotColor, fontWeight: 800, fontSize: '20px', marginBottom: '12px' }}>
                {config.textoArriba}
              </div>
            )}

            <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center' }} />

            {config.textoAbajo && (
              <div style={{ textAlign: 'center', color: config.dotColor, fontWeight: 800, fontSize: '16px', marginTop: '12px' }}>
                {config.textoAbajo}
              </div>
            )}

            <div style={{ color: '#6a8a95', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
              {publicUrl}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', width: '100%', maxWidth: '450px' }}>
            <button onClick={descargarPNG}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                background: 'linear-gradient(135deg,#00c8ff,#00e5c0)',
                color: '#000', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              }}>
              ⬇ Descargar PNG
            </button>
            <button onClick={descargarSVG}
              style={{
                flex: 1, padding: '14px', borderRadius: '12px',
                background: 'rgba(0,200,255,.15)', color: '#00c8ff',
                border: '1px solid rgba(0,200,255,.3)', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              }}>
              ⬇ Descargar SVG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
