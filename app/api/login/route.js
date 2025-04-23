import db from '../db' // koneksi ke MySQL dari file lib/db.js
import bcrypt from 'bcrypt' // kalau kamu hash password-nya
import { NextResponse } from 'next/server'

export async function POST(req) {
  const { email, password } = await req.json()

  const [rows] = await db.execute(
    'SELECT * FROM admin WHERE email = ? LIMIT 1',
    [email]
  )

  const user = rows[0]

  if (!user) {
    return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 })
  }

//   const passwordMatch = await bcrypt.compare(password, user.password)

  const passwordMatch = password === user.password // atau pakai bcrypt.compareSync(password, user.password)

  if (!passwordMatch) {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 })
  }

  // Simpan session/token/cookie (optional)
  return NextResponse.json({ message: 'Login berhasil', user })
}
