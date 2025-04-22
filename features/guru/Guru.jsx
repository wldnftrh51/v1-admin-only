'use client'
import { useState } from 'react';

export default function HalamanGuru() {
  const [search, setSearch] = useState('');

  const dataGuru = [
    {
      nama: 'Selwin Saputra, S.Pd.,Gr',
      jabatan: 'Kepala Sekolah',
      nip: '-',
      ttl: '-',
      jenisKelamin: 'Cowok Cewek',
      foto: 'https://ui-avatars.com/api/?name=Rahmi+Annisa&background=0D8ABC&color=fff',
    },
    {
      nama: 'Wildan Hasanah Fitrah, S.Pd.I',
      jabatan: 'Guru TK B',
      nip: '-',
      ttl: '-',
      jenisKelamin: '-',
      foto: 'https://ui-avatars.com/api/?name=Ihwana&background=0D8ABC&color=fff',
    },
    {
      nama: 'Yudisthira, S.Pd.I',
      jabatan: 'Guru PAI',
      nip: '-',
      ttl: '-',
      jenisKelamin: 'Tidak Ingin Memberitahu',
      foto: 'https://ui-avatars.com/api/?name=Megawati&background=0D8ABC&color=fff',
    },
    {
      nama: 'Surya Miftahul, S.Pd',
      jabatan: 'Guru TK A',
      nip: '-',
      ttl: '-',
      jenisKelamin: 'Netral',
      foto: 'https://ui-avatars.com/api/?name=Jumriana&background=0D8ABC&color=fff',
    },
  ];

  const filteredGuru = dataGuru.filter((guru) =>
    guru.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Halaman Guru</h1>
          <button className="text-sm text-gray-600 hover:underline font-semibold">Log out</button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <button className="px-4 py-2 text-sm border rounded-md text-gray-700 bg-white shadow-sm hover:bg-gray-100">
            Add filter
          </button>
          <input
            type="text"
            placeholder="Search for a teachers by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 text-sm border rounded-md w-full sm:w-80 shadow-sm"
          />
        </div>

        <div className="overflow-x-auto rounded-md bg-white shadow mt-10">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Jabatan</th>
                <th className="px-4 py-3">NIP</th>
                <th className="px-4 py-3">Tempat, Tanggal Lahir</th>
                <th className="px-4 py-3">Jenis Kelamin</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuru.map((guru, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={guru.foto}
                        alt={guru.nama}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{guru.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">{guru.jabatan}</td>
                  <td className="px-4 py-2">{guru.nip}</td>
                  <td className="px-4 py-2">{guru.ttl}</td>
                  <td className="px-4 py-2">{guru.jenisKelamin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button className="px-4 py-2 border border-blue-500 text-blue-500 text-sm rounded hover:bg-blue-50">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-hover-sidebar text-white text-sm rounded">
            Tambahkan Guru
          </button>
        </div>
      </div>
    </div>
  );
}
