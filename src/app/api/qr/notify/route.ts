import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

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
    const tel = data.tel_propietario || data.tel_resp;

    if (!tel) {
      return NextResponse.json({ error: 'No hay teléfono registrado' }, { status: 400 });
    }

    const telLimpio = tel.replace(/\s/g, '');
    const smsBody =
      `🚗 AVISO QRnet.io\n` +
      `Vehículo: ${data.marca || ''} ${data.modelo || ''} · ${data.matricula || qr.public_code}\n` +
      `Motivo: ${motivo}\n` +
      (mensaje ? `Mensaje: ${mensaje}\n` : '') +
      `\nNadie ha visto tus datos personales.`;

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingSid = process.env.TWILIO_MESSAGING_SID;

    const params = new URLSearchParams();
    params.append('To', telLimpio);
    params.append('MessagingServiceSid', messagingSid || '');
    params.append('Body', smsBody);

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error('Twilio error:', twilioData);
      return NextResponse.json({ error: 'Error al enviar notificación' }, { status: 500 });
    }

    // Registrar la notificación en scans
    await pool.query(
      'INSERT INTO qr_scans (qr_code_id, scanned_at) VALUES (?, NOW())',
      [qr.id]
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error notify:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}