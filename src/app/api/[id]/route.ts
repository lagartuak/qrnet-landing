import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { id } = await params;
    const [rows]: any = await pool.query(
      'SELECT id, public_code, object_type, title, object_data FROM qr_codes WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return NextResponse.json({ error: 'QR no encontrado' }, { status: 404 });
    }

    const qr = rows[0];
    return NextResponse.json({
      id: qr.id,
      public_code: qr.public_code,
      object_type: qr.object_type,
      title: qr.title,
    });
  } catch (error) {
    console.error('Error get QR:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
