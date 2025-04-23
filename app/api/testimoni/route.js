import { NextResponse } from 'next/server';
import db from '../db';

// GET: ambil semua testimoni
export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM testimoni ORDER BY id_testimoni DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST: tambah testimoni
export async function POST(request) {
  const { nama, no_telepon, isi_pesan, tampilkan } = await request.json();
  const [result] = await db.execute(
    'INSERT INTO testimoni (nama, no_telepon, isi_pesan, tampilkan) VALUES (?, ?, ?, ?)',
    [nama, no_telepon, isi_pesan, tampilkan]
  );
  return NextResponse.json({ id_testimoni: result.insertId, nama, no_telepon, isi_pesan, tampilkan }, { status: 201 });
}

// DELETE: hapus testimoni berdasarkan id
export async function DELETE(request) {
  const { id_testimoni } = await request.json();
  await db.execute('DELETE FROM testimoni WHERE id_testimoni = ?', [id_testimoni]);
  return NextResponse.json({ message: 'Deleted' });
}

// PUT: update status tampilkan
export async function PUT(request) {
  const { id_testimoni, tampilkan } = await request.json();
  await db.execute('UPDATE testimoni SET tampilkan = ? WHERE id_testimoni = ?', [tampilkan, id_testimoni]);
  return NextResponse.json({ message: 'Updated' });
}
