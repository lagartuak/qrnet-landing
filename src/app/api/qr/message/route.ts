import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { qr_id, mensaje } = await req.json();

    if (!qr_id || !mensaje || !mensaje.trim()) {
      return NextResponse.json({ error: 'Escribe un mensaje' }, { status: 400 });
    }

    // Buscar el QR y el propietario
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
    const ownerEmail = qr.owner_email || data.email;

    if (!ownerEmail) {
      return NextResponse.json({ error: 'No se puede contactar con este usuario' }, { status: 400 });
    }

    // Guardar mensaje en qr_scans como registro
    await pool.query(
      'INSERT INTO qr_scans (qr_code_id, scanned_at) VALUES (?, NOW())',
      [qr.id]
    ).catch(() => {});

    // Enviar email al propietario
    const emailResult = await resend.emails.send({
      from: 'QRnet.io <noreply@qrnet.io>',
      to: ownerEmail,
      subject: `💬 Nuevo mensaje privado — QRnet.io`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
          <div style="background:#f8f9fa;border-radius:16px;padding:32px;border:1px solid #e9ecef">
            <h1 style="color:#1a1a1a;font-size:20px;margin-bottom:4px">💬 Mensaje privado</h1>
            <p style="color:#888;font-size:13px;margin-bottom:24px">
              Alguien ha enviado un mensaje a tu perfil <strong>@${data.username || 'personal'}</strong>
            </p>
            <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e9ecef;margin-bottom:24px">
              <p style="color:#333;font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap">${mensaje.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            </div>
            <p style="color:#888;font-size:12px;margin-bottom:16px">
              Este mensaje fue enviado de forma anónima a través de tu QR personal.
              No se ha compartido ningún dato del remitente.
            </p>
            <a href="${process.env.NEXTAUTH_URL || 'https://qrnet.io'}/dashboard"
               style="display:inline-block;background:#00c8ff;color:#000;padding:12px 24px;border-radius:40px;font-weight:700;text-decoration:none;font-size:13px">
              Ir a mi panel
            </a>
          </div>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:24px">
            QRnet.io · Perfil privado verificado
          </p>
        </div>
      `
    });

    console.log("Email result:", JSON.stringify(emailResult));
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error message:', error);
    return NextResponse.json({ error: 'Error al enviar mensaje' }, { status: 500 });
  }
}
