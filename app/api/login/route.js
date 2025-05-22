import db from '../db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    // Cari user di database RDS
    const [rows] = await db.execute(
      'SELECT * FROM pengguna WHERE email = ? LIMIT 1',
      [email]
    )

    const user = rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    // Verifikasi password
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    // Generate JWT Token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        nama: user.nama 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      message: 'Login berhasil',
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        nama: user.nama 
      }
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}