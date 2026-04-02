import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QRDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;

  const [rows]: any = await pool.query(
    'SELECT * FROM qr_codes WHERE id = ? AND user_id = ?',
    [id, session.user.id]
  );

  if (!rows.length) notFound();

  const qr = rows[0];
  const data = typeof qr.object_data === 'string'
    ? JSON.parse(qr.object_data)
    : qr.object_data;

  const publicUrl = process.env.NEXTAUTH_URL + '/q/' + qr.public_code;

  return (
    <main style={{



cat > src/app/dashboard/qr/\[id\]/page.tsx << 'ENDOFFILE'
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function QRDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const { id } = await params;

  const [rows]: any = await pool.query(
    'SELECT * FROM qr_codes WHERE id = ? AND user_id = ?',
    [id, session.user.id]
  );

  if (!rows.length) notFound();

  const qr = rows[0];
  const data = typeof qr.object_data === 'string'
    ? JSON.parse(qr.object_data)
    : qr.object_data;

  const publicUrl = process.env.NEXTAUTH_URL + '/q/' + qr.public_code;

  return (
    <main style={{
