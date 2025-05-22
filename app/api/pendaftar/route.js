import { NextResponse } from 'next/server';
import db from '../db';


export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM pendaftar_siswa ORDER BY id_siswa DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new NextResponse("ID siswa tidak ditemukan", { status: 400 });
  }

  try {
    await db.execute("DELETE FROM pendaftar_siswa WHERE id_siswa = ?", [id]);
    return new NextResponse("siswa berhasil dihapus", { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus siswa:", error);
    return new NextResponse("Gagal menghapus siswa", { status: 500 });
  }
}

