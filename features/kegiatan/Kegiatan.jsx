'use client'
import React from 'react';

export default function HalamanKegiatan() {
  const dataKegiatan = [
    {
      judul: 'Kegiatan 1',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
    {
      judul: 'Kegiatan 2',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
    {
      judul: 'Kegiatan 3',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
    {
      judul: 'Kegiatan 4',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Halaman Kegiatan</h1>
          <button className="text-sm text-gray-600 hover:underline font-semibold">Log out</button>
        </div>

        <div className="overflow-x-auto rounded-md bg-white shadow mt-15">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-4 py-3">Judul</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Deskripsi</th>
                <th className="px-4 py-3">Foto</th>
              </tr>
            </thead>
            <tbody>
              {dataKegiatan.map((kegiatan, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}>
                  <td className="px-4 py-4">{kegiatan.judul}</td>
                  <td className="px-4 py-4">{kegiatan.tanggal}</td>
                  <td className="px-4 py-4">{kegiatan.deskripsi}</td>
                  <td className="px-4 py-4 text-blue-600 underline cursor-pointer">
                    {kegiatan.foto}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-btn text-white text-sm rounded ">
            Tambah Kegiatan
          </button>
        </div>
      </div>
    </div>
  );
}
