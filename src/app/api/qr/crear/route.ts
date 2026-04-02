import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

async function generarCodigo(ciudad: string): Promise<string> {
  const prefijo = ciudad
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 3)
    .padEnd(3, 'X');

  const [rows]: any = await pool.query(
    `SELECT public_code FROM qr_codes 
     WHERE public_code LIKE ? 
     ORDER BY public_code DESC LIMIT 1`,
    [`${prefijo}-%`]
  );

  let siguiente = 1;
  if (rows.length > 0) {
    const ultimo = rows[0].public_code;
    const num = parseInt(ultimo.split('-')[1], 10);
    siguiente = num + 1;
  }

  return `${prefijo}-${String(siguiente).padStart(3, '0')}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { object_type, title, object_data } = await req.json();

    if (!object_type || !title) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const [countRows]: any = await pool.query(
      'SELECT COUNT(*) as total FROM qr_codes WHERE user_id = ? AND is_active = 1',
      [session.user.id]
    );
    const total = countRows[0].total;

    if (total >= 5) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de 5 QRs del plan gratuito. Actualiza a Pro para crear más.' },
        { status: 403 }
      );
    }

    const ciudad = object_data?.estab_ciudad || object_data?.ciudad || 'GEN';
    const public_code = await generarCodigo(ciudad);
    const qr_url = `${process.env.NEXTAUTH_URL}/q/${public_code}`;

    const [result]: any = await pool.query(
      `INSERT INTO qr_codes 
        (user_id, object_type, title, object_data, public_code, qr_url, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
      [
        session.user.id,
        object_type,
        title,
        JSON.stringify(object_data),
        public_code,
        qr_url,
      ]
    );

    return NextResponse.json({ id: result.insertId, public_code, qr_url });

  } catch (error: any) {
    console.error('Error creando QR:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}