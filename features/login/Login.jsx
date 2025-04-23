'use client'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

    const handleSubmit = async(e) => {
        e.preventDefault()
        // Logika autentikasi bisa ditaruh di sini juga kalau ada
        // const email = e.target.email.value
        // const password = e.target.password.value
      
        // const res = await fetch('/api/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ email, password })
        // })
      
        // const data = await res.json()
      
        // if (res.ok) {
        //   console.log('Berhasil login:', data)
        //   // redirect ke dashboard
        //   window.location.href = '/dashboard'
        // } else {
        //   alert(data.error)
        // }
        router.push('/dashboard') // Arahkan ke halaman dashboard
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <img src="/logo.png" alt="TK AZIZAH 2 Logo" className="h-16 mb-2" />
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
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-btn text-white font-medium py-2 px-4 rounded-lg transition duration-300"
                    >
                        Masuk
                    </button>
                </form>
            </div>
        </div>
    )
}
