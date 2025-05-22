'use client'
import React, { useState } from 'react';

export default function HalamanKegiatan() {
  const [dataKegiatan, setDataKegiatan] = useState([
    {
      judul: 'Kegiatan 1',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
    {
      judul: 'Kegiatan 1',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
    {
      judul: 'Kegiatan 1',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
    {
      judul: 'Kegiatan 1',
      tanggal: '2025/03/01',
      deskripsi: 'Lorem ipsum dolor sit amet consectetur...',
      foto: 'lorem.jpg',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    judul: '',
    tanggal: '',
    deskripsi: '',
    foto: '',
  });

  const handleSubmit = () => {
    setDataKegiatan([...dataKegiatan, form]);
    setForm({ judul: '', tanggal: '', deskripsi: '', foto: '' });
    setShowModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-8 bg-gray-50">
      <div className="flex-1 p-4 sm:p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">Halaman Kegiatan</h1>
        </div>

        <div className="overflow-x-auto rounded-md bg-white shadow mt-15">
          <table className="w-full text-sm md:text-lg text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Foto</th>
              </tr>
            </thead>
            <tbody>
              {dataKegiatan.map((kegiatan, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}>
                  <td className="px-6 py-4">{kegiatan.judul}</td>
                  <td className="px-6 py-4">{kegiatan.tanggal}</td>
                  <td className="px-6 py-4">{kegiatan.deskripsi}</td>
                  <td className="px-6 py-4 text-blue-600 underline cursor-pointer">
                    {kegiatan.foto}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-btn text-white text-sm md:text-lg rounded"
            onClick={() => setShowModal(true)}
          >
            Tambah Kegiatan
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-gray-200 p-10">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">Tambah Kegiatan</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Judul"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
              />
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              />
              <input
                type="text"
                placeholder="Deskripsi"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.deskripsi}
                onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              />
              <input
                type="text"
                placeholder="Nama File Foto (opsional)"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.foto}
                onChange={(e) => setForm({ ...form, foto: e.target.value })}
              />
            </div>

            <div className="flex justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm md:text-lg px-6 py-2 rounded-md mr-4"
                onClick={handleSubmit}
              >
                Tambah
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium text-sm md:text-lg px-6 py-2 rounded-md"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
