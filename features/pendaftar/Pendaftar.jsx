'use client'

import { useState } from 'react';

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

//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
//             <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
//                 <div className="flex justify-between items-center mb-6">
//                     <h1 className="text-3xl font-bold text-gray-800">Halaman Pendaftar</h1>
//                     <button className="text-sm text-gray-600 hover:underline font-semibold">Log out</button>
//                 </div>

//                 <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
//                     <input
//                         type="text"
//                         placeholder="Cari pendaftar berdasarkan nama"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         className="px-4 py-2 text-sm border rounded-md w-full sm:w-80 shadow-sm"
//                     />
//                 </div>

//                 <div className="overflow-x-auto rounded-md bg-white shadow mt-10">
//                     <table className="min-w-full text-sm text-left ">
//                         <thead className="bg-white text-gray-800">
//                             <tr>
//                                 <th className="px-4 py-3">Id</th>
//                                 <th className="px-4 py-3">Nama</th>
//                                 <th className="px-4 py-3">Tempat, Tanggal Lahir</th>
//                                 <th className="px-4 py-3">Jenis Kelamin</th>
//                                 <th className="px-4 py-3">Agama</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {filteredData.map((item, i) => (
//                                 <tr
//                                     key={item.id}
//                                     className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}
//                                 >
//                                     <td className="px-4 py-2">{item.id}</td>
//                                     <td className="px-4 py-2">{item.nama}</td>
//                                     <td className="px-4 py-2">{item.ttl}</td>
//                                     <td className="px-4 py-2">{item.jenisKelamin}</td>
//                                     <td className="px-4 py-2">{item.agama}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="mt-6 flex justify-end">
//                     <button className="px-4 py-2 bg-btn text-white text-sm rounded">
//                         Unduh Selengkapnya
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
return (
    <div className="flex flex-col min-h-screen w-full p-4 sm:p-8 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
                Halaman Pendaftar
            </h1>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <button className="px-4 py-2 text-sm border rounded-md text-gray-700 bg-white shadow-sm hover:bg-gray-100 w-full sm:w-auto">
                Add filter
            </button>
            <input
                type="text"
                placeholder="Search for a student by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 text-sm border rounded-md w-full sm:w-80 shadow-sm"
            />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-md bg-white shadow mt-6">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-[#F3F6FD] text-gray-700">
                    <tr>
                        <th className="px-4 py-3">Id</th>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Tempat, Tanggal Lahir</th>
                        <th className="px-4 py-3">Jenis Kelamin</th>
                        <th className="px-4 py-3">Agama</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, i) => (
                        <tr
                            key={item.id}
                            className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}
                        >
                            <td className="px-4 py-2">{item.id}</td>
                            <td className="px-4 py-2">{item.nama}</td>
                            <td className="px-4 py-2">{item.ttl}</td>
                            <td className="px-4 py-2">{item.jenisKelamin}</td>
                            <td className="px-4 py-2">{item.agama}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
}
