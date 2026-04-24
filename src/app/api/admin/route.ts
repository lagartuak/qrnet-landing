import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
/* eslint-disable @typescript-eslint/no-explicit-any */

const ADMIN_EMAIL = 'lagartuak@gmail.com';

async function isAdmin() {
  const session = await auth();
  return session?.user?.email === ADMIN_EMAIL;
}

export async function GET(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'users';

  if (action === 'users') {
    const [users]: any = await pool.query(
      `SELECT u.id, u.email, u.name, u.status, u.created_at,
        (SELECT COUNT(*) FROM qr_codes WHERE user_id = u.id) as qr_count,
        (SELECT plan FROM subscriptions WHERE user_id = u.id LIMIT 1) as plan
       FROM users u ORDER BY u.created_at DESC`
    );
    return NextResponse.json({ users });
  }

  if (action === 'qrs') {
    const [qrs]: any = await pool.query(
      `SELECT q.id, q.title, q.public_code, q.object_type, q.is_active, q.created_at,
        u.email as owner_email, u.name as owner_name,
        (SELECT COUNT(*) FROM qr_scans WHERE qr_id = q.id) as scan_count
       FROM qr_codes q
       LEFT JOIN users u ON q.user_id = u.id
       ORDER BY q.created_at DESC`
    );
    return NextResponse.json({ qrs });
  }

  if (action === 'stats') {
    const [userCount]: any = await pool.query('SELECT COUNT(*) as total FROM users');
    const [qrCount]: any = await pool.query('SELECT COUNT(*) as total FROM qr_codes');
    const [scanCount]: any = await pool.query('SELECT COUNT(*) as total FROM qr_scans');
    const [activeUsers]: any = await pool.query("SELECT COUNT(*) as total FROM users WHERE status = 'active'");
    return NextResponse.json({
      users: userCount[0].total,
      activeUsers: activeUsers[0].total,
      qrs: qrCount[0].total,
      scans: scanCount[0].total,
    });
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { action, userId, email } = await req.json();

  if (action === 'activate') {
    await pool.query("UPDATE users SET status = 'active' WHERE id = ?", [userId]);
    return NextResponse.json({ ok: true });
  }

  if (action === 'deactivate') {
    await pool.query("UPDATE users SET status = 'pending' WHERE id = ?", [userId]);
    return NextResponse.json({ ok: true });
  }

  if (action === 'delete_user') {
    await pool.query('DELETE FROM qr_scans WHERE qr_id IN (SELECT id FROM qr_codes WHERE user_id = ?)', [userId]);
    await pool.query('DELETE FROM qr_codes WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM subscriptions WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM email_verifications WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
}
