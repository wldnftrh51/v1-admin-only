// api/logout/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const response = NextResponse.json({
      message: 'Logout berhasil'
    })

    // Hapus cookie token
    response.cookies.delete('token')

    return response
    
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}