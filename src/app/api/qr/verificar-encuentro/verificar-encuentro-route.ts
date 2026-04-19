import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { qr_id, pin_a, pin_b } = await req.json();

    if (!qr_id || !pin_a || !pin_b) {
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

    if (data.pin_a !== pin_a || data.pin_b !== pin_b) {
      return NextResponse.json({ error: 'PINs incorrectos. Verificación fallida.' }, { status: 400 });
    }

    const ahora = new Date().toISOString();

    // Actualizar objeto con verificación
    data.verificado_a = true;
    data.verificado_b = true;
    data.fecha_verificacion = ahora;

    await pool.query(
      'UPDATE qr_codes SET object_data = ? WHERE id = ?',
      [JSON.stringify(data), qr_id]
    );

    // Registrar escaneo
    await pool.query(
      'INSERT INTO qr_scans (qr_id, scanned_at) VALUES (?, NOW())',
      [qr.id]
    ).catch(() => {});

    const fechaFormateada = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });

    const htmlEmail = (nombre: string, otraParte: string) => `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
        <div style="background:#f8f9fa;border-radius:16px;padding:32px;border:1px solid #e9ecef">
          <h1 style="color:#1a1a1a;font-size:20px;margin-bottom:4px">✅ Encuentro verificado</h1>
          <p style="color:#333;font-size:15px;line-height:1.6;margin-bottom:24px">
            Hola <strong>${nombre}</strong>, el encuentro ha sido confirmado por ambas partes.
          </p>
          <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e9ecef;margin-bottom:24px">
            <div style="margin-bottom:12px">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600">Motivo</span>
              <p style="color:#1a1a1a;font-size:16px;font-weight:700;margin:4px 0 0">${data.motivo_label}</p>
            </div>
            <div style="margin-bottom:12px;border-top:1px solid #e9ecef;padding-top:12px">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600">Descripción</span>
              <p style="color:#333;font-size:14px;margin:4px 0 0">${data.descripcion}</p>
            </div>
            <div style="margin-bottom:12px;border-top:1px solid #e9ecef;padding-top:12px">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600">Participantes</span>
              <p style="color:#333;font-size:14px;margin:4px 0 0">${data.nombre_a} ↔ ${data.nombre_b}</p>
            </div>
            <div style="border-top:1px solid #e9ecef;padding-top:12px">
              <span style="color:#888;font-size:12px;text-transform:uppercase;font-weight:600">Verificado el</span>
              <p style="color:#00c864;font-size:16px;font-weight:700;margin:4px 0 0">${fechaFormateada}</p>
            </div>
          </div>
          <p style="color:#888;font-size:12px">
            Código de verificación: ${qr.public_code}. Este comprobante certifica que ambas partes
            confirmaron el encuentro mediante verificación mutua con PIN.
          </p>
        </div>
        <p style="color:#aaa;font-size:11px;text-align:center;margin-top:24px">
          QRnet.io · Verificación certificada
        </p>
      </div>
    `;

    // Enviar email a persona A
    if (data.email_a) {
      await resend.emails.send({
        from: 'QRnet.io <noreply@qrnet.io>',
        to: data.email_a,
        subject: `✅ Encuentro verificado — ${data.motivo_label}`,
        html: htmlEmail(data.nombre_a, data.nombre_b),
      });
    }

    // Enviar email a persona B
    if (data.email_b) {
      await resend.emails.send({
        from: 'QRnet.io <noreply@qrnet.io>',
        to: data.email_b,
        subject: `✅ Encuentro verificado — ${data.motivo_label}`,
        html: htmlEmail(data.nombre_b, data.nombre_a),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error verificar encuentro:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
