import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { to_email, to_name, nombre_menor, centro, public_code, pin } = await req.json();

    if (!to_email || !to_name || !nombre_menor || !centro || !public_code) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const publicUrl = `https://qrnet.io/q/${public_code}`;

    await resend.emails.send({
      from: 'QRnet.io <noreply@qrnet.io>',
      to: to_email,
      subject: `✅ Autorización de recogida — ${nombre_menor}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
          <div style="background:#f8f9fa;border-radius:16px;padding:32px;border:1px solid #e9ecef">
            <h1 style="color:#1a1a1a;font-size:20px;margin-bottom:4px">🏫 Autorización de recogida</h1>
            <p style="color:#333;font-size:15px;line-height:1.6;margin-bottom:24px">
              Hola <strong>${to_name}</strong>,<br><br>
              Tu PIN de verificación:</p><p style="text-align:center;font-size:32px;font-weight:800;color:#00c8ff;letter-spacing:6px;margin:16px 0"></p><p style="color:#333;font-size:15px;line-height:1.6">Has sido autorizado/a para recoger a <strong>${nombre_menor}</strong> en <strong>${centro}</strong>.
            </p>

            <div style="background:#fff;border-radius:12px;padding:20px;border:1px solid #e9ecef;margin-bottom:24px;text-align:center">
              <p style="color:#888;font-size:13px;margin-bottom:16px">
                Cuando vayas a recogerlo/a, muestra este enlace en el centro:
              </p>
              <a href="${publicUrl}"
                 style="display:inline-block;background:#00c8ff;color:#000;padding:14px 32px;border-radius:40px;font-weight:700;text-decoration:none;font-size:15px">
                Mostrar autorización
              </a>
              <p style="color:#aaa;font-size:12px;margin-top:16px">
                ${publicUrl}
              </p>
            </div>

            <p style="color:#888;font-size:12px">
              Tu nombre aparecerá en la lista de personas autorizadas con el estado ✅ AUTORIZADO.
              El centro podrá verificar tu identidad al instante.
            </p>
          </div>
          <p style="color:#aaa;font-size:11px;text-align:center;margin-top:24px">
            QRnet.io · Autorización verificada
          </p>
        </div>
      `
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error share:', error);
    return NextResponse.json({ error: 'Error al enviar' }, { status: 500 });
  }
}
