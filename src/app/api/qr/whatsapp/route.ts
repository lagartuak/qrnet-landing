import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  try {
    const { qr_id, motivo, mensaje } = await req.json();
    if (!qr_id || !motivo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      'SELECT * FROM qr_codes WHERE id = ? AND is_active = 1',
      [qr_id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'QR no encontrado' }, { status: 404 });
    }

    const qr = rows[0];
    const data = typeof qr.object_data === 'string' ? JSON.parse(qr.object_data) : qr.object_data;

    // Verificar que acepta WhatsApp
    const pref = data.notificacion || 'email';
    if (pref !== 'whatsapp' && pref !== 'ambos') {
      return NextResponse.json({ error: 'WhatsApp no habilitado' }, { status: 400 });
    }

    // Buscar teléfono del propietario
    const tel = data.tel_propietario || data.telefono || data.tel_resp || data.tel_movil || '';
    if (!tel) {
      return NextResponse.json({ error: 'No hay teléfono configurado' }, { status: 400 });
    }

    // Limpiar teléfono
    const telLimpio = tel.replace(/\D/g, '');

    // Determinar tipo para el mensaje
    const tipoLabel = qr.object_type === 'vehiculo' ? 'Vehículo'
      : qr.object_type === 'bicicleta' ? 'Bicicleta/Patinete'
      : qr.object_type === 'mascota' ? 'Mascota'
      : qr.object_type === 'empresa' ? 'Empresa'
      : qr.object_type === 'objeto' ? 'Objeto'
      : 'QR';

    const tipoEmoji = qr.object_type === 'vehiculo' ? '🚗'
      : qr.object_type === 'bicicleta' ? '🚲'
      : qr.object_type === 'mascota' ? '🐾'
      : qr.object_type === 'empresa' ? '🏢'
      : qr.object_type === 'objeto' ? '🎒'
      : '📱';

    const identificador = data.matricula || data.num_serie || data.nombre_comercial || data.nombre || qr.public_code;

    // Construir mensaje prellenado
    let textoWA = `${tipoEmoji} *Aviso QRnet - ${tipoLabel}*\n\n`;
    textoWA += `🔷 *${identificador}*\n`;
    textoWA += `📋 *Motivo:* ${motivo}\n`;
    if (mensaje) {
      textoWA += `💬 *Mensaje:* ${mensaje}\n`;
    }
    textoWA += `\n_Enviado desde QRnet.io_`;

    const waUrl = `https://wa.me/${telLimpio}?text=${encodeURIComponent(textoWA)}`;

    // Guardar registro del contacto
    try {
      await pool.query(
        `INSERT INTO qr_messages (qr_id, motivo, mensaje, contacto, es_anonimo, created_at)
         VALUES (?, ?, ?, 'whatsapp', 0, NOW())`,
        [qr_id, motivo, mensaje || '']
      );
    } catch (e) {
      // Si la tabla no existe, no bloqueamos
      console.error('Error guardando mensaje:', e);
    }

    // Registrar escaneo
    await pool.query(
      'INSERT INTO qr_scans (qr_id, scanned_at) VALUES (?, NOW())',
      [qr_id]
    ).catch(() => {});

    return NextResponse.json({ ok: true, waUrl });

  } catch (error: any) {
    console.error('Error whatsapp:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
