import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { qr_id, motivo, mensaje, contacto } = await req.json();
    if (!qr_id || !motivo) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const [rows]: any = await pool.query(
      `SELECT qr_codes.*, users.email as owner_email, users.name as owner_name
       FROM qr_codes
       LEFT JOIN users ON qr_codes.user_id = users.id
       WHERE qr_codes.id = ? AND qr_codes.is_active = 1`,
      [qr_id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'QR no encontrado' }, { status: 404 });
    }

    const qr = rows[0];
    const data = typeof qr.object_data === 'string' ? JSON.parse(qr.object_data) : qr.object_data;

    // Buscar email del propietario (del usuario o del objeto)
    const ownerEmail = qr.owner_email || data.email_propietario || data.email;

    if (!ownerEmail) {
      return NextResponse.json({ error: 'No se puede contactar con el propietario' }, { status: 400 });
    }

    // Determinar tipo de objeto para el email
    const tipoEmoji = qr.object_type === 'vehiculo' ? '🚗' 
      : qr.object_type === 'bicicleta' ? '🚲' 
      : qr.object_type === 'empresa' ? '🏢'
      : '📱';

    const tipoLabel = qr.object_type === 'vehiculo' ? 'Vehículo' 
      : qr.object_type === 'bicicleta' ? 'Bicicleta / Patinete' 
      : qr.object_type === 'empresa' ? 'Empresa'
      : 'QR';

    const identificador = data.matricula || data.num_serie || data.nombre_comercial || qr.public_code;
    const descripcion = data.marca ? `${data.marca} ${data.modelo || ''}` : identificador;

    // Enviar email
    await resend.emails.send({
      from: 'QRnet.io <noreply@qrnet.io>',
      to: ownerEmail,
      subject: `${tipoEmoji} Aviso QRnet · ${motivo}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
          <div style="background:#f8f9fa;border-radius:16px;padding:32px;border:1px solid #e9ecef">
            <h1 style="color:#1a1a1a;font-size:20px;margin-bottom:4px">${tipoEmoji} Aviso para tu ${tipoLabel}</h1>
            <p style="color:#888;font-size:13px;margin-bottom:24px">
              Alguien ha enviado un aviso sobre <strong>${descripcion}</strong> · ${qr.public_code}
            </p>

            <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e9ecef;margin-bottom:16px">
              <div style="margin-bottom:12px">
                <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600">Motivo</span>
                <p style="color:#1a1a1a;font-size:16px;font-weight:700;margin:4px 0 0">${motivo}</p>
              </div>
              ${mensaje ? `
              <div style="border-top:1px solid #e9ecef;padding-top:12px">
                <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600">Mensaje</span>
                <p style="color:#333;font-size:14px;line-height:1.6;margin:4px 0 0">${mensaje.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>
              ` : ''}
            ${contacto ? `
              <div style="border-top:1px solid #e9ecef;padding-top:12px">
                <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600">Contacto del remitente</span>
                <p style="color:#00c8ff;font-size:16px;font-weight:700;margin:4px 0 0">${contacto}</p>
              </div>
            ` : ''}
            </div>

            <p style="color:#888;font-size:12px;margin-bottom:16px">
              Este aviso fue enviado de forma anónima. No se ha compartido ningún dato del remitente.
            </p>

            <a href="${process.env.NEXTAUTH_URL || 'https://qrnet.io'}/dashboard"
               style="display:inline-block;background:#00c8ff;color:#000;padding:12px 24px;border-radius:40px;font-weight:700;text-decoration:none;font-size:13px">
              Ir a mi panel
            </a>
          </div>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:24px">
            QRnet.io · Notificación automática
          </p>
        </div>
      `
    });

    // Registrar el escaneo
    await pool.query(
      'INSERT INTO qr_scans (qr_id, scanned_at) VALUES (?, NOW())',
      [qr.id]
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error notify:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
