'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
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
  { color: '#ffffff', label: 'Blanco' },
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

const PLANTILLAS = [
  {
    id: 'default', label: '🎨 Personalizado', emoji: '🎨',
    config: { dotColor: '#000000', bgColor: '#ffffff', dotStyle: 'square', cornerStyle: 'square', useLogo: false, textoArriba: '', textoAbajo: '', marco: 'none' },
  },
  {
    id: 'mascota', label: '🐾 Mascota', emoji: '🐾',
    config: { dotColor: '#8B4513', bgColor: '#FFF8DC', dotStyle: 'dots', cornerStyle: 'dot', useLogo: true, textoArriba: '🐾 SI ME ENCUENTRAS', textoAbajo: '¡ESCANEA Y AVISA A MI DUEÑO!', marco: 'rounded' },
  },
  {
    id: 'vehiculo', label: '🚗 Vehículo', emoji: '🚗',
    config: { dotColor: '#1a1a1a', bgColor: '#ffffff', dotStyle: 'square', cornerStyle: 'square', useLogo: true, textoArriba: '', textoAbajo: '', marco: 'metallic' },
  },
  {
    id: 'moto', label: '🏍️ Moto', emoji: '🏍️',
    config: { dotColor: '#000000', bgColor: '#ffffff', dotStyle: 'classy-rounded', cornerStyle: 'dot', useLogo: false, textoArriba: '', textoAbajo: '', marco: 'none' },
  },
  {
    id: 'empresa', label: '🏢 Empresa', emoji: '🏢',
    config: { dotColor: '#0066cc', bgColor: '#ffffff', dotStyle: 'rounded', cornerStyle: 'extra-rounded', useLogo: true, textoArriba: '', textoAbajo: 'qrnet.io', marco: 'professional' },
  },
  {
    id: 'vending', label: '🚬 Vending', emoji: '🚬',
    config: { dotColor: '#cc0000', bgColor: '#ffffff', dotStyle: 'square', cornerStyle: 'square', useLogo: false, textoArriba: '¿INCIDENCIAS?', textoAbajo: '¡ESCANEA Y CONTACTA!', marco: 'warning' },
  },
  {
    id: 'cola', label: '📋 Cola', emoji: '📋',
    config: { dotColor: '#006600', bgColor: '#ffffff', dotStyle: 'dots', cornerStyle: 'dot', useLogo: true, textoArriba: 'LISTA DE ESPERA', textoAbajo: 'ESCANEA Y ESPERA TU TURNO', marco: 'rounded' },
  },
  {
    id: 'cyan', label: '💎 QRnet Cyan', emoji: '💎',
    config: { dotColor: '#00c8ff', bgColor: '#020608', dotStyle: 'dots', cornerStyle: 'dot', useLogo: true, textoArriba: '', textoAbajo: 'qrnet.io', marco: 'glow' },
  },
];

const MARCOS = [
  { val: 'none', label: 'Sin marco' },
  { val: 'simple', label: 'Simple' },
  { val: 'rounded', label: 'Redondeado' },
  { val: 'professional', label: 'Profesional' },
  { val: 'metallic', label: 'Metálico' },
  { val: 'warning', label: 'Advertencia' },
  { val: 'glow', label: 'Neón' },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function EditorQR() {
  const params = useParams();
  const qrId = params.id as string;
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimerRef = useRef<any>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [publicUrl, setPublicUrl] = useState('');
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('plantillas');
  const [designLoaded, setDesignLoaded] = useState(false);

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
    marco: 'none',
  });

  // --- GUARDAR diseño (auto-save con debounce) ---
  const guardarDiseno = useCallback(async (configToSave: typeof config) => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/qr/${qrId}/design`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design: configToSave }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Error guardando diseño:', e);
    } finally {
      setSaving(false);
    }
  }, [qrId]);

  // Auto-save cuando cambia config (después de cargar el diseño guardado)
  useEffect(() => {
    if (!designLoaded) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      guardarDiseno(config);
    }, 1000);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  }, [config, designLoaded, guardarDiseno]);

  // --- CARGAR datos del QR + diseño guardado ---
  useEffect(() => {
    const loadAll = async () => {
      try {
        // Cargar datos del QR
        const qrRes = await fetch(`/api/qr/${qrId}`);
        const qrJson = await qrRes.json();
        setQrData(qrJson);
        setPublicUrl(`https://qrnet.io/q/${qrJson.public_code}`);

        // Cargar diseño guardado
        const designRes = await fetch(`/api/qr/${qrId}/design`);
        const designJson = await designRes.json();
        if (designJson.design) {
          setConfig(prev => ({ ...prev, ...designJson.design }));
        }
      } catch (e) {
        console.error('Error cargando:', e);
      } finally {
        setLoading(false);
        // Marcar como cargado con un pequeño delay para evitar auto-save inmediato
        setTimeout(() => setDesignLoaded(true), 500);
      }
    };
    loadAll();
  }, [qrId]);

  // --- Renderizar QR preview ---
  useEffect(() => {
    if (!publicUrl || typeof window === 'undefined') return;

    const initQR = async () => {
      const QRCodeStyling = (await import('qr-code-styling')).default;

      const options: any = {
        width: 350,
        height: 350,
        data: publicUrl,
        dotsOptions: { color: config.dotColor, type: config.dotStyle },
        backgroundOptions: { color: config.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : config.bgColor },
        cornersSquareOptions: { type: config.cornerStyle, color: config.dotColor },
        cornersDotOptions: { type: config.cornerDotStyle, color: config.dotColor },
        imageOptions: { crossOrigin: 'anonymous', margin: 8 },
      };

      if (config.useLogo || customLogo) {
        options.image = customLogo || '/logo.png';
        options.imageOptions.imageSize = 0.3;
      }

      if (qrRef.current) { qrRef.current.innerHTML = ''; }
      qrCodeRef.current = new QRCodeStyling(options);
      if (qrRef.current) { qrCodeRef.current.append(qrRef.current); }
    };

    initQR();
  }, [publicUrl, config, customLogo]);

  const set = (key: string, val: any) => {
    setConfig(prev => ({ ...prev, [key]: val }));
  };

  const aplicarPlantilla = (plantilla: any) => {
    setConfig(prev => ({
      ...prev,
      ...plantilla.config,
      size: prev.size,
      cornerDotStyle: plantilla.config.cornerStyle === 'dot' ? 'dot' : 'square',
    }));
    if (plantilla.id === 'default') setCustomLogo(null);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCustomLogo(ev.target?.result as string);
      set('useLogo', false);
    };
    reader.readAsDataURL(file);
  };

  const getMarcoStyle = () => {
    switch (config.marco) {
      case 'simple': return { border: '3px solid ' + config.dotColor, borderRadius: '4px', padding: '16px' };
      case 'rounded': return { border: '3px solid ' + config.dotColor, borderRadius: '20px', padding: '20px' };
      case 'professional': return { border: '2px solid #ccc', borderRadius: '8px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,.1)' };
      case 'metallic': return { border: '3px solid #888', borderRadius: '4px', padding: '16px', background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0, #f5f5f5)' };
      case 'warning': return { border: '4px solid #cc0000', borderRadius: '8px', padding: '16px', background: '#fff' };
      case 'glow': return { border: '2px solid #00c8ff', borderRadius: '16px', padding: '20px', boxShadow: '0 0 20px rgba(0,200,255,.3)' };
      default: return { padding: '8px' };
    }
  };

  // --- DESCARGA PNG (sin cambios) ---
  const descargarPNG = async () => {
    if (!qrCodeRef.current || typeof window === 'undefined') return;
    const QRCodeStyling = (await import('qr-code-styling')).default;

    const fullOptions: any = {
      width: config.size,
      height: config.size,
      data: publicUrl,
      dotsOptions: { color: config.dotColor, type: config.dotStyle },
      backgroundOptions: { color: config.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : config.bgColor },
      cornersSquareOptions: { type: config.cornerStyle, color: config.dotColor },
      cornersDotOptions: { type: config.cornerDotStyle, color: config.dotColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 8 },
    };

    if (config.useLogo || customLogo) {
      fullOptions.image = customLogo || '/logo.png';
      fullOptions.imageOptions.imageSize = 0.3;
    }

    const fullQR = new QRCodeStyling(fullOptions);

    if (config.textoArriba || config.textoAbajo || config.marco !== 'none') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const pad = 60;
      const fontSize = Math.max(28, config.size * 0.05);
      const gap = 24;

      let totalH = config.size + pad * 2;
      if (config.textoArriba) totalH += fontSize + gap;
      if (config.textoAbajo) totalH += fontSize + gap;
      const totalW = config.size + pad * 2;

      canvas.width = totalW;
      canvas.height = totalH;

      ctx.fillStyle = config.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : (config.marco === 'metallic' ? '#e8e8e8' : config.bgColor);
      ctx.fillRect(0, 0, totalW, totalH);

      if (config.marco === 'warning') {
        ctx.strokeStyle = '#cc0000'; ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, totalW - 6, totalH - 6);
      } else if (config.marco === 'simple' || config.marco === 'rounded' || config.marco === 'professional') {
        ctx.strokeStyle = config.marco === 'professional' ? '#cccccc' : config.dotColor;
        ctx.lineWidth = 4; ctx.strokeRect(2, 2, totalW - 4, totalH - 4);
      } else if (config.marco === 'glow') {
        ctx.strokeStyle = '#00c8ff'; ctx.lineWidth = 3;
        ctx.shadowColor = '#00c8ff'; ctx.shadowBlur = 15;
        ctx.strokeRect(4, 4, totalW - 8, totalH - 8); ctx.shadowBlur = 0;
      }

      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = config.dotColor;
      ctx.textAlign = 'center';

      let yOff = pad;
      if (config.textoArriba) {
        ctx.fillText(config.textoArriba, totalW / 2, yOff + fontSize * 0.8);
        yOff += fontSize + gap;
      }

      const blob = await fullQR.getRawData('png');
      const img = new window.Image();
      img.src = URL.createObjectURL(blob as Blob);
      await new Promise(resolve => { img.onload = resolve; });
      ctx.drawImage(img, pad, yOff, config.size, config.size);
      yOff += config.size + gap;

      if (config.textoAbajo) {
        ctx.font = `bold ${fontSize * 0.85}px sans-serif`;
        ctx.fillText(config.textoAbajo, totalW / 2, yOff + fontSize * 0.6);
      }

      const link = document.createElement('a');
      link.download = `QR-${qrData?.public_code || 'custom'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else {
      fullQR.download({ name: `QR-${qrData?.public_code || 'custom'}`, extension: 'png' });
    }
  };

  // --- DESCARGA SVG (CORREGIDO: incluye texto, marco y tamaño correcto) ---
  const descargarSVG = async () => {
    if (typeof window === 'undefined') return;
    const QRCodeStyling = (await import('qr-code-styling')).default;

    // Generar QR al tamaño real seleccionado
    const fullOptions: any = {
      width: config.size,
      height: config.size,
      data: publicUrl,
      type: 'svg',
      dotsOptions: { color: config.dotColor, type: config.dotStyle },
      backgroundOptions: { color: config.bgColor === 'transparent' ? 'rgba(0,0,0,0)' : config.bgColor },
      cornersSquareOptions: { type: config.cornerStyle, color: config.dotColor },
      cornersDotOptions: { type: config.cornerDotStyle, color: config.dotColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 8 },
    };

    if (config.useLogo || customLogo) {
      fullOptions.image = customLogo || '/logo.png';
      fullOptions.imageOptions.imageSize = 0.3;
    }

    const fullQR = new QRCodeStyling(fullOptions);

    // Si no hay texto ni marco, descarga directa
    if (!config.textoArriba && !config.textoAbajo && config.marco === 'none') {
      fullQR.download({ name: `QR-${qrData?.public_code || 'custom'}`, extension: 'svg' });
      return;
    }

    // Obtener el SVG interno del QR
    const blob = await fullQR.getRawData('svg');
    const svgText = await (blob as Blob).text();

    // Calcular dimensiones del SVG completo
    const pad = 60;
    const fontSize = Math.max(28, config.size * 0.05);
    const gap = 24;

    let totalH = config.size + pad * 2;
    if (config.textoArriba) totalH += fontSize + gap;
    if (config.textoAbajo) totalH += fontSize + gap;
    const totalW = config.size + pad * 2;

    // Construir SVG wrapper
    let yOff = pad;
    let elements = '';

    // Fondo
    const bgFill = config.bgColor === 'transparent' ? 'none' : (config.marco === 'metallic' ? '#e8e8e8' : config.bgColor);
    elements += `<rect width="${totalW}" height="${totalH}" fill="${bgFill}"/>\n`;

    // Marco
    if (config.marco === 'warning') {
      elements += `<rect x="3" y="3" width="${totalW - 6}" height="${totalH - 6}" fill="none" stroke="#cc0000" stroke-width="6"/>\n`;
    } else if (config.marco === 'simple' || config.marco === 'rounded' || config.marco === 'professional') {
      const strokeColor = config.marco === 'professional' ? '#cccccc' : config.dotColor;
      const rx = config.marco === 'rounded' ? '20' : '0';
      elements += `<rect x="2" y="2" width="${totalW - 4}" height="${totalH - 4}" fill="none" stroke="${strokeColor}" stroke-width="4" rx="${rx}"/>\n`;
    } else if (config.marco === 'glow') {
      elements += `<rect x="4" y="4" width="${totalW - 8}" height="${totalH - 8}" fill="none" stroke="#00c8ff" stroke-width="3" rx="16"/>\n`;
    }

    // Texto arriba
    if (config.textoArriba) {
      elements += `<text x="${totalW / 2}" y="${yOff + fontSize * 0.8}" font-family="sans-serif" font-weight="bold" font-size="${fontSize}" fill="${config.dotColor}" text-anchor="middle">${escapeXml(config.textoArriba)}</text>\n`;
      yOff += fontSize + gap;
    }

    // QR embebido
    // Extraer contenido interno del SVG (sin la etiqueta <svg> exterior)
    const innerSvg = svgText
      .replace(/<\?xml[^?]*\?>\s*/g, '')
      .replace(/<!DOCTYPE[^>]*>\s*/g, '');

    elements += `<g transform="translate(${pad}, ${yOff})">\n`;
    // Usar un foreignObject con el SVG o embeber directamente
    // Mejor: embeber el SVG como un grupo con viewBox via nested svg
    elements += `<svg width="${config.size}" height="${config.size}" viewBox="0 0 ${config.size} ${config.size}">\n`;
    // Extraer solo el contenido dentro de las tags <svg>...</svg>
    const svgContent = innerSvg.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    elements += svgContent;
    elements += `\n</svg>\n`;
    elements += `</g>\n`;
    yOff += config.size + gap;

    // Texto abajo
    if (config.textoAbajo) {
      const fontSizeBottom = fontSize * 0.85;
      elements += `<text x="${totalW / 2}" y="${yOff + fontSizeBottom * 0.6}" font-family="sans-serif" font-weight="bold" font-size="${fontSizeBottom}" fill="${config.dotColor}" text-anchor="middle">${escapeXml(config.textoAbajo)}</text>\n`;
    }

    const finalSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
${elements}
</svg>`;

    // Descargar
    const svgBlob = new Blob([finalSvg], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.download = `QR-${qrData?.public_code || 'custom'}.svg`;
    link.href = URL.createObjectURL(svgBlob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // --- DESCARGA CARTEL A4 (sin cambios) ---
  const descargarCartelA4 = async () => {
    if (!qrCodeRef.current || typeof window === 'undefined') return;
    const QRCodeStyling = (await import('qr-code-styling')).default;

    const qrSize = 1400;
    const a4W = 2480;
    const a4H = 3508;

    const fullOptions: any = {
      width: qrSize, height: qrSize, data: publicUrl,
      dotsOptions: { color: config.dotColor, type: config.dotStyle },
      backgroundOptions: { color: 'rgba(0,0,0,0)' },
      cornersSquareOptions: { type: config.cornerStyle, color: config.dotColor },
      cornersDotOptions: { type: config.cornerDotStyle, color: config.dotColor },
      imageOptions: { crossOrigin: 'anonymous', margin: 10 },
    };
    if (config.useLogo || customLogo) {
      fullOptions.image = customLogo || '/logo.png';
      fullOptions.imageOptions.imageSize = 0.3;
    }

    const fullQR = new QRCodeStyling(fullOptions);
    const blob = await fullQR.getRawData('png');
    const qrImg = new window.Image();
    qrImg.src = URL.createObjectURL(blob as Blob);
    await new Promise(resolve => { qrImg.onload = resolve; });

    const canvas = document.createElement('canvas');
    canvas.width = a4W;
    canvas.height = a4H;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, a4W, a4H);

    ctx.fillStyle = config.dotColor;
    ctx.font = 'bold 120px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(config.textoArriba || '¿INCIDENCIAS?', a4W / 2, 300);

    const qrX = (a4W - qrSize) / 2;
    ctx.drawImage(qrImg, qrX, 450, qrSize, qrSize);

    ctx.font = 'bold 90px sans-serif';
    ctx.fillText(config.textoAbajo || '¡ESCANEA Y CONTACTA!', a4W / 2, 2050);

    ctx.fillStyle = '#666666';
    ctx.font = '50px sans-serif';
    ctx.fillText('Abre la cámara de tu móvil y apunta al código QR', a4W / 2, 2250);

    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(400, 2350); ctx.lineTo(a4W - 400, 2350); ctx.stroke();

    ctx.fillStyle = '#888888';
    ctx.font = '45px sans-serif';
    ctx.fillText(`Código: ${qrData?.public_code || ''}`, a4W / 2, 2480);

    ctx.fillStyle = '#00c8ff';
    ctx.font = 'bold 70px sans-serif';
    ctx.fillText('qrnet.io', a4W / 2, 2650);
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '40px sans-serif';
    ctx.fillText('Identidad digital para el mundo físico', a4W / 2, 2750);

    if (config.marco === 'warning') {
      ctx.strokeStyle = '#cc0000'; ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, a4W - 80, a4H - 80);
    } else {
      ctx.strokeStyle = '#dddddd'; ctx.lineWidth = 4;
      ctx.strokeRect(60, 60, a4W - 120, a4H - 120);
    }

    const link = document.createElement('a');
    link.download = `Cartel-A4-${qrData?.public_code || 'QR'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#020608', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6a8a95' }}>Cargando editor...</p>
      </div>
    );
  }

  const tabs = [
    { id: 'plantillas', label: '📋 Plantillas' },
    { id: 'colores', label: '🎨 Colores' },
    { id: 'estilo', label: '✨ Estilo' },
    { id: 'logo', label: '🖼️ Logo' },
    { id: 'texto', label: '✏️ Texto' },
    { id: 'marco', label: '🖼 Marco' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#020608', color: '#c8dde5', fontFamily: 'sans-serif' }}>
      <nav style={{ background: '#0d1a20', borderBottom: '1px solid rgba(0,200,255,.1)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" style={{ color: '#f0f8ff', fontWeight: 700, fontSize: '20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="/logo.png" alt="QRnet.io" style={{ width: 32, height: 32 }} />
          QRnet<span style={{ color: '#00c8ff' }}>.</span>io
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Indicador de guardado */}
          <span style={{ fontSize: '12px', color: saving ? '#ffc800' : saved ? '#00c864' : 'transparent', transition: 'color .3s' }}>
            {saving ? '💾 Guardando...' : saved ? '✅ Guardado' : '·'}
          </span>
          <Link href={`/dashboard/qr/${qrId}`} style={{ color: '#00c8ff', fontSize: '14px', textDecoration: 'none' }}>← Volver al QR</Link>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

        {/* Panel izquierdo */}
        <div style={{ flex: '1 1 320px', minWidth: '300px' }}>
          <h1 style={{ color: '#f0f8ff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
            🎨 Editor de QR
          </h1>
          <p style={{ color: '#6a8a95', fontSize: '14px', marginBottom: '24px' }}>
            {qrData?.public_code} · Personaliza y descarga
          </p>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  border: activeTab === t.id ? '1px solid rgba(0,200,255,.4)' : '1px solid rgba(255,255,255,.06)',
                  background: activeTab === t.id ? 'rgba(0,200,255,.1)' : 'transparent',
                  color: activeTab === t.id ? '#00c8ff' : '#6a8a95',
                  cursor: 'pointer',
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Plantillas */}
          {activeTab === 'plantillas' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {PLANTILLAS.map(p => (
                <button key={p.id} onClick={() => aplicarPlantilla(p)}
                  style={{
                    padding: '16px', borderRadius: '12px', textAlign: 'center',
                    border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.02)',
                    color: '#f0f8ff', cursor: 'pointer', transition: '.2s',
                  }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>{p.emoji}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{p.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Colores */}
          {activeTab === 'colores' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Color del QR</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLORES_PRESET.map(c => (
                    <button key={c.color} onClick={() => set('dotColor', c.color)} title={c.label}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', background: c.color,
                        border: config.dotColor === c.color ? '3px solid #00c8ff' : c.color === '#ffffff' ? '2px solid rgba(255,255,255,.4)' : '2px solid rgba(255,255,255,.15)', cursor: 'pointer' }} />
                  ))}
                  <input type="color" value={config.dotColor} onChange={e => set('dotColor', e.target.value)}
                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }} />
                </div>
              </div>
              <div>
                <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Color del fondo</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {FONDOS_PRESET.map(c => (
                    <button key={c.color} onClick={() => set('bgColor', c.color)} title={c.label}
                      style={{ width: '36px', height: '36px', borderRadius: '8px',
                        background: c.color === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px' : c.color,
                        border: config.bgColor === c.color ? '3px solid #00c8ff' : '2px solid rgba(255,255,255,.15)', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Estilo */}
          {activeTab === 'estilo' && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Estilo de puntos</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {DOT_STYLES.map(d => (
                    <button key={d.val} onClick={() => set('dotStyle', d.val)}
                      style={{ padding: '10px', borderRadius: '8px',
                        border: config.dotStyle === d.val ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                        background: config.dotStyle === d.val ? 'rgba(0,200,255,.1)' : 'transparent',
                        color: config.dotStyle === d.val ? '#00c8ff' : '#6a8a95', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Estilo de esquinas</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {CORNER_STYLES.map(c => (
                    <button key={c.val} onClick={() => { set('cornerStyle', c.val); set('cornerDotStyle', c.val === 'dot' ? 'dot' : 'square'); }}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px',
                        border: config.cornerStyle === c.val ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                        background: config.cornerStyle === c.val ? 'rgba(0,200,255,.1)' : 'transparent',
                        color: config.cornerStyle === c.val ? '#00c8ff' : '#6a8a95', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>Tamaño de descarga</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {TAMANOS.map(t => (
                    <button key={t.val} onClick={() => set('size', t.val)}
                      style={{ padding: '10px', borderRadius: '8px',
                        border: config.size === t.val ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                        background: config.size === t.val ? 'rgba(0,200,255,.1)' : 'transparent',
                        color: config.size === t.val ? '#00c8ff' : '#6a8a95', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Logo */}
          {activeTab === 'logo' && (
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <button onClick={() => { set('useLogo', true); setCustomLogo(null); }}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px',
                    border: config.useLogo && !customLogo ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                    background: config.useLogo && !customLogo ? 'rgba(0,200,255,.1)' : 'transparent',
                    color: config.useLogo && !customLogo ? '#00c8ff' : '#6a8a95', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  Logo QRnet
                </button>
                <button onClick={() => { set('useLogo', false); setCustomLogo(null); }}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px',
                    border: !config.useLogo && !customLogo ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                    background: !config.useLogo && !customLogo ? 'rgba(0,200,255,.1)' : 'transparent',
                    color: !config.useLogo && !customLogo ? '#00c8ff' : '#6a8a95', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  Sin logo
                </button>
              </div>
              <div style={{
                border: '2px dashed rgba(0,200,255,.2)', borderRadius: '12px', padding: '30px',
                textAlign: 'center', cursor: 'pointer', background: customLogo ? 'rgba(0,200,255,.05)' : 'transparent',
              }} onClick={() => fileInputRef.current?.click()}>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                {customLogo ? (
                  <>
                    <img src={customLogo} style={{ width: '60px', height: '60px', objectFit: 'contain', marginBottom: '8px' }} />
                    <div style={{ color: '#00c864', fontSize: '13px', fontWeight: 600 }}>✅ Logo personalizado cargado</div>
                    <div style={{ color: '#6a8a95', fontSize: '11px', marginTop: '4px' }}>Pulsa para cambiar</div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>📤</div>
                    <div style={{ color: '#6a8a95', fontSize: '13px' }}>Sube tu propio logo</div>
                    <div style={{ color: '#6a8a95', fontSize: '11px', marginTop: '4px' }}>PNG o JPG, fondo transparente recomendado</div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Texto */}
          {activeTab === 'texto' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Texto encima</div>
                <input type="text" placeholder="Ej: ¿INCIDENCIAS?"
                  value={config.textoArriba} onChange={e => set('textoArriba', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '14px', outline: 'none' }} />
              </div>
              <div>
                <div style={{ color: '#f0f8ff', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Texto debajo</div>
                <input type="text" placeholder="Ej: ¡ESCANEA Y CONTACTA!"
                  value={config.textoAbajo} onChange={e => set('textoAbajo', e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)',
                    color: '#f0f8ff', fontSize: '14px', outline: 'none' }} />
              </div>
            </div>
          )}

          {/* Marco */}
          {activeTab === 'marco' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {MARCOS.map(m => (
                <button key={m.val} onClick={() => set('marco', m.val)}
                  style={{ padding: '12px', borderRadius: '8px',
                    border: config.marco === m.val ? '1px solid rgba(0,200,255,.5)' : '1px solid rgba(255,255,255,.1)',
                    background: config.marco === m.val ? 'rgba(0,200,255,.1)' : 'transparent',
                    color: config.marco === m.val ? '#00c8ff' : '#6a8a95', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>
                  {m.label}
                </button>
              ))}
            </div>
          )}
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

            <div style={{ ...getMarcoStyle(), display: 'inline-block', margin: '0 auto', width: 'fit-content' }}>
              {config.textoArriba && (
                <div style={{ textAlign: 'center', color: config.dotColor, fontWeight: 800, fontSize: '18px', marginBottom: '12px' }}>
                  {config.textoArriba}
                </div>
              )}
              <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center' }} />
              {config.textoAbajo && (
                <div style={{ textAlign: 'center', color: config.dotColor, fontWeight: 800, fontSize: '15px', marginTop: '12px' }}>
                  {config.textoAbajo}
                </div>
              )}
            </div>

            <div style={{ color: '#6a8a95', fontSize: '11px', textAlign: 'center', marginTop: '16px' }}>
              {publicUrl}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', width: '100%', maxWidth: '450px', flexWrap: 'wrap' }}>
            <button onClick={descargarPNG}
              style={{ flex: '1 1 45%', padding: '13px', borderRadius: '12px',
                background: 'linear-gradient(135deg,#00c8ff,#00e5c0)',
                color: '#000', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              ⬇ PNG
            </button>
            <button onClick={descargarSVG}
              style={{ flex: '1 1 45%', padding: '13px', borderRadius: '12px',
                background: 'rgba(0,200,255,.15)', color: '#00c8ff',
                border: '1px solid rgba(0,200,255,.3)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              ⬇ SVG
            </button>
            <button onClick={descargarCartelA4}
              style={{ flex: '1 1 100%', padding: '13px', borderRadius: '12px',
                background: 'rgba(255,200,0,.15)', color: '#ffc800',
                border: '1px solid rgba(255,200,0,.3)', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              🖨️ Descargar Cartel A4 (para imprimir)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utilidad para escapar caracteres XML en textos
function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
