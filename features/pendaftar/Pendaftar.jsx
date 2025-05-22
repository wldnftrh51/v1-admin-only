'use client'

import { useState } from 'react';
import { Trash2} from "lucide-react";


export default function HalamanPendaftar() {
    const [search, setSearch] = useState('');

    const dataPendaftar = [
        { id: 1, nama: 'JohnDoe', ttl: 'Istanbul', jenisKelamin: 'Pria', agama: 'Islam' },
        { id: 2, nama: 'DoeJohn', ttl: 'Moskow', jenisKelamin: 'Wanita', agama: 'Katolik' },
        { id: 3, nama: 'John', ttl: 'Tokyo', jenisKelamin: 'Laki-laki', agama: 'Budha' },
        { id: 4, nama: 'Doe', ttl: 'New York', jenisKelamin: 'Perempuan', agama: 'Protestan' },
    ];

    const filteredData = dataPendaftar.filter((p) =>
        p.nama.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className=" items-center justify-center min-h-screen w-full p-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
                    Halaman Pendaftar
                </h1>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Cari pendaftar berdasarkan nama"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 text-sm md:text-lg border rounded-md w-full sm:w-80 shadow-sm"
                />
            </div>

            <div className="overflow-x-auto rounded-md bg-white shadow mt-10">
                <table className="min-w-full text-sm md:text-lg text-left ">
                    <thead className="bg-white text-gray-800">
                        <tr>
                            <th className="px-6 py-4">Id</th>
                            <th className="px-6 py-4">Nama</th>
                            <th className="px-6 py-4">Tempat, Tanggal Lahir</th>
                            <th className="px-6 py-4">Jenis Kelamin</th>
                            <th className="px-6 py-4">Agama</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, i) => (
                            <tr
                                key={item.id}
                                className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}
                            >
                                <td className="px-6 py-4">{item.id}</td>
                                <td className="px-6 py-4">{item.nama}</td>
                                <td className="px-6 py-4">{item.ttl}</td>
                                <td className="px-6 py-4">{item.jenisKelamin}</td>
                                <td className="px-6 py-4">{item.agama}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => deleteTestimoni(item)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end">
                <button className="px-4 py-2 bg-btn text-white text-sm md:text-lg rounded">
                    Unduh Selengkapnya
                </button>
            </div>
        </div>
    );
}