// api/login/route.js
import db from '../db'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your_jwt_secret_key'
)

export async function POST(req) {
  try {
    const { email, password } = await req.json()

    const [rows] = await db.execute(
      'SELECT * FROM pengguna WHERE email = ? LIMIT 1',
      [email]
    )

    const user = rows[0]

    if (!user) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
    }

    const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      nama: user.nama 
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

    const response = NextResponse.json({
      message: 'Login berhasil',
      token,
      user: { id: user.id, email: user.email, nama: user.nama }
    }, { status: 200 })

    response.cookies.set('token', token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === 'production',
      secure: false,
      sameSite: 'strict', 
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
