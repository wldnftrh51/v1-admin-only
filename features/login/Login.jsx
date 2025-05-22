'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from "next/image"

export default function Home() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        const email = e.target.email.value
        const password = e.target.password.value

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            })

            const data = await res.json()

            if (res.ok) {
                localStorage.setItem('token', data.token)
                localStorage.setItem('user', JSON.stringify(data.user))
                router.push('/dashboard')
            } else {
                alert(data.error || 'Login gagal')
            }
        } catch (error) {
            alert('Terjadi kesalahan jaringan')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src="https://gwn-bucket.s3.us-east-1.amazonaws.com/images/logoo.png"
                        alt="Logo"
                        width={80}
                        height={80}
                    />
                    <h1 className="text-2xl font-semibold text-gray-800">Login Admin</h1>
                    <p className="text-sm text-gray-500">Masuk ke dashboard TK AZIZAH 2</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="admin@example.com"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 disabled:bg-gray-400"
                    >
                        {loading ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    )
}