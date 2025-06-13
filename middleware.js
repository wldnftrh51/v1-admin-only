// middleware.js
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your_jwt_secret_key'
)

const protectedRoutes = ['/dashboard', '/guru', '/kegiatan', '/pendaftar', '/siswa','/pengguna', '/testimoni']
const publicRoutes = ['/']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublic = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  if (!isProtected && !isPublic) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

  if (!isProtected) return NextResponse.next()

  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    const loginUrl = new URL('/', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    const headers = new Headers(request.headers)
    headers.set('x-user-id', payload.id?.toString() || '')
    headers.set('x-user-email', payload.email || '')
    headers.set('x-user-nama', payload.nama || '')

    return NextResponse.next({ request: { headers } })
  } catch (error) {
    console.error('Token verification failed:', error)
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
}
