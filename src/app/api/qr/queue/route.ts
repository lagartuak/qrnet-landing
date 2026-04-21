import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST - Cliente se une a la cola
export async function POST(req: NextRequest) {
  try {
    const { qr_id, nombre, telefono, email, comensales, turno } = await req.json();

    if (!qr_id || !nombre) {
      return NextResponse.json({ error: 'Nombre es obligatorio' }, { status: 400 });
    }

    // Obtener datos del QR
    const [qrRows]: any = await pool.query(
      `SELECT qr_codes.*, users.email as owner_email
       FROM qr_codes
       LEFT JOIN users ON qr_codes.user_id = users.id
       WHERE qr_codes.id = ? AND qr_codes.is_active = 1`,
      [qr_id]
    );

    if (!qrRows.length) {
      return NextResponse.json({ error: 'Cola no encontrada' }, { status: 404 });
    }

    const qr = qrRows[0];
    const data = typeof qr.object_data === 'string' ? JSON.parse(qr.object_data) : qr.object_data;

    // Contar personas en espera hoy
    const [countRows]: any = await pool.query(
      `SELECT COUNT(*) as total FROM queue_entries 
       WHERE qr_id = ? AND estado = 'esperando' AND DATE(created_at) = CURDATE()`,
      [qr_id]
    );
    const posicion = (countRows[0].total || 0) + 1;
    const tiempoEstimado = posicion * parseInt(data.tiempo_estimado_mesa || '15');

    // Insertar en la cola
    const [result]: any = await pool.query(
      `INSERT INTO queue_entries (qr_id, nombre, telefono, email, comensales, turno, posicion, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'esperando')`,
      [qr_id, nombre, telefono || null, email || null, comensales || 1, turno || null, posicion]
    );

    // Notificar al restaurante
    const ownerEmail = qr.owner_email || data.email_local;
    if (ownerEmail) {
      await resend.emails.send({
        from: 'QRnet.io <noreply@qrnet.io>',
        to: ownerEmail,
        subject: `📋 Nueva entrada en cola · ${data.nombre_local}`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
            <div style="background:#f8f9fa;border-radius:16px;padding:32px;border:1px solid #e9ecef">
              <h1 style="color:#1a1a1a;font-size:20px;margin-bottom:16px">📋 Nueva entrada en cola</h1>
              <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e9ecef">
                <p style="margin:0 0 8px"><strong>Nombre:</strong> ${nombre}</p>
                <p style="margin:0 0 8px"><strong>Comensales:</strong> ${comensales || 1}</p>
                <p style="margin:0 0 8px"><strong>Posición:</strong> #${posicion}</p>
                ${telefono ? `<p style="margin:0 0 8px"><strong>Teléfono:</strong> ${telefono}</p>` : ''}
                ${email ? `<p style="margin:0 0 8px"><strong>Email:</strong> ${email}</p>` : ''}
                ${turno ? `<p style="margin:0"><strong>Turno:</strong> ${turno}</p>` : ''}
              </div>
              <a href="${process.env.NEXTAUTH_URL || 'https://qrnet.io'}/dashboard/cola/${qr.id}"
                 style="display:inline-block;background:#00c8ff;color:#000;padding:12px 24px;border-radius:40px;font-weight:700;text-decoration:none;font-size:13px;margin-top:20px">
                Ver cola completa
              </a>
            </div>
          </div>
        `
      }).catch(() => {});
    }

    return NextResponse.json({ 
      ok: true, 
      posicion,
      tiempo_estimado: tiempoEstimado,
      entry_id: result.insertId,
    });
  } catch (error: any) {
    console.error('Error cola:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// GET - Obtener cola actual (para el panel del restaurante)
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const qrId = searchParams.get('qr_id');

    if (!qrId) {
      return NextResponse.json({ error: 'Falta qr_id' }, { status: 400 });
    }

    const [entries]: any = await pool.query(
      `SELECT * FROM queue_entries 
       WHERE qr_id = ? AND DATE(created_at) = CURDATE()
       ORDER BY posicion ASC`,
      [qrId]
    );

    const esperando = entries.filter((e: any) => e.estado === 'esperando').length;
    const sentados = entries.filter((e: any) => e.estado === 'sentado').length;

    return NextResponse.json({ entries, esperando, sentados, total: entries.length });
  } catch (error: any) {
    console.error('Error get cola:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// PUT - Actualizar estado de una entrada (mesa lista, no show, etc.)
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { entry_id, estado } = await req.json();

    if (!entry_id || !estado) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const updateFields: any = { estado };
    if (estado === 'notificado') updateFields.notified_at = new Date();
    if (estado === 'sentado') updateFields.seated_at = new Date();

    await pool.query(
      `UPDATE queue_entries SET estado = ?, notified_at = ?, seated_at = ? WHERE id = ?`,
      [estado, updateFields.notified_at || null, updateFields.seated_at || null, entry_id]
    );

    // Si se notifica, enviar email al cliente
    if (estado === 'notificado') {
      const [entryRows]: any = await pool.query('SELECT * FROM queue_entries WHERE id = ?', [entry_id]);
      const entry = entryRows[0];

      if (entry && entry.email) {
        const [qrRows]: any = await pool.query('SELECT object_data FROM qr_codes WHERE id = ?', [entry.qr_id]);
        const qrData = typeof qrRows[0].object_data === 'string' ? JSON.parse(qrRows[0].object_data) : qrRows[0].object_data;

        await resend.emails.send({
          from: 'QRnet.io <noreply@qrnet.io>',
          to: entry.email,
          subject: `🍽️ ¡Tu mesa está lista! · ${qrData.nombre_local}`,
          html: `
            <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
              <div style="background:#f0fff4;border-radius:16px;padding:32px;border:1px solid #c6f6d5;text-align:center">
                <div style="font-size:56px;margin-bottom:16px">🍽️</div>
                <h1 style="color:#1a1a1a;font-size:24px;margin-bottom:8px">¡Tu mesa está lista!</h1>
                <p style="color:#333;font-size:16px;line-height:1.6">
                  Hola <strong>${entry.nombre}</strong>, tu mesa en <strong>${qrData.nombre_local}</strong> está preparada.
                </p>
                <p style="color:#00c864;font-size:18px;font-weight:700;margin-top:16px">
                  Por favor, acude al local ahora
                </p>
              </div>
            </div>
          `
        }).catch(() => {});
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error update cola:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
