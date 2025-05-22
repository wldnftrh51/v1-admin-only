import { NextResponse } from 'next/server';
import db from '../db';
import bcrypt from 'bcryptjs';

// GET - Ambil semua pengguna
export async function GET() {
  try {
    const [rows] = await db.execute('SELECT * FROM pengguna ORDER BY id_pengguna DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database query error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// POST - Tambah pengguna baru
export async function POST(request) {
  try {
    const { nama, username, email, password } = await request.json();
    
    // Validasi input
    if (!nama || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' }, 
        { status: 400 }
      );
    }

    // Cek apakah email atau username sudah ada
    const [existingUsers] = await db.execute(
      'SELECT id_pengguna FROM pengguna WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'Email atau username sudah digunakan' }, 
        { status: 400 }
      );
    }

    // Hash password sebelum disimpan
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert ke database dengan password yang sudah di-hash
    const [result] = await db.execute(
      'INSERT INTO pengguna (nama, username, email, password, created_at) VALUES (?, ?, ?, ?, NOW())',
      [nama, username, email, hashedPassword]
    );

    // Return response tanpa password untuk keamanan
    return NextResponse.json({ 
      id_pengguna: result.insertId, 
      nama, 
      username, 
      email,
      message: 'Pengguna berhasil ditambahkan'
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json(
      { error: 'Gagal menambah pengguna' }, 
      { status: 500 }
    );
  }
}

// DELETE - Hapus pengguna
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "ID pengguna tidak ditemukan" }, 
      { status: 400 }
    );
  }

  try {
    // Cek apakah pengguna exists
    const [existingUser] = await db.execute(
      "SELECT id_pengguna FROM pengguna WHERE id_pengguna = ?", 
      [id]
    );

    if (existingUser.length === 0) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan" }, 
        { status: 404 }
      );
    }

    // Hapus pengguna
    await db.execute("DELETE FROM pengguna WHERE id_pengguna = ?", [id]);
    
    return NextResponse.json(
      { message: "Pengguna berhasil dihapus" }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Gagal menghapus pengguna:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pengguna" }, 
      { status: 500 }
    );
  }
}