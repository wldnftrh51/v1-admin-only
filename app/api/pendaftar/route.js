import { NextResponse } from 'next/server';
import db from '../db';

export async function GET() {
  try {
    const [rows] = await db.execute(`
      SELECT 
        ps.*,
        a.nama as ayah_nama,
        a.tempat_lahir as ayah_tempat_lahir,
        a.tanggal_lahir as ayah_tanggal_lahir,
        a.agama as ayah_agama,
        a.kewarganegaraan as ayah_kewarganegaraan,
        a.pekerjaan as ayah_pekerjaan,
        a.pendidikan as ayah_pendidikan,
        a.status_dalam_keluarga as ayah_status_dalam_keluarga,
        i.nama as ibu_nama,
        i.tempat_lahir as ibu_tempat_lahir,
        i.tanggal_lahir as ibu_tanggal_lahir,
        i.agama as ibu_agama,
        i.kewarganegaraan as ibu_kewarganegaraan,
        i.pekerjaan as ibu_pekerjaan,
        i.pendidikan as ibu_pendidikan,
        i.status_dalam_keluarga as ibu_status_dalam_keluarga
      FROM pendaftar_siswa ps
      LEFT JOIN ayah a ON ps.id_ayah = a.id_ayah
      LEFT JOIN ibu i ON ps.id_ibu = i.id_ibu
      ORDER BY ps.id_siswa DESC
    `);
    
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
    // Ambil data siswa untuk mendapatkan id_ayah dan id_ibu
    const [siswaData] = await db.execute(
      "SELECT id_ayah, id_ibu FROM pendaftar_siswa WHERE id_siswa = ?", 
      [id]
    );

    if (siswaData.length === 0) {
      return new NextResponse("Siswa tidak ditemukan", { status: 404 });
    }

    const { id_ayah, id_ibu } = siswaData[0];

    // Hapus dalam urutan yang benar (child dulu, lalu parent)
    await db.execute("DELETE FROM pendaftar_siswa WHERE id_siswa = ?", [id]);
    
    // Hapus data ayah dan ibu jika ada
    if (id_ayah) {
      await db.execute("DELETE FROM ayah WHERE id_ayah = ?", [id_ayah]);
    }
    if (id_ibu) {
      await db.execute("DELETE FROM ibu WHERE id_ibu = ?", [id_ibu]);
    }

    return new NextResponse("Siswa berhasil dihapus", { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus siswa:", error);
    return new NextResponse("Gagal menghapus siswa", { status: 500 });
  }
}