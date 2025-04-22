'use client';

import { useState } from 'react';
import { Trash2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';

export default function HalamanTestimoni() {
  const [search, setSearch] = useState('');
  const [testimoniData, setTestimoniData] = useState([
    { nama: 'John Doe', email: 'john@gmail.com', telepon: '08123xxxxx', pesan: 'Pesan 1...', tampilkan: true },
    { nama: 'Jane Doe', email: 'jane@gmail.com', telepon: '08123xxxxx', pesan: 'Pesan 2...', tampilkan: false },
  ]);

  const toggleTampilkan = (index) => {
    const updatedData = [...testimoniData];
    updatedData[index].tampilkan = !updatedData[index].tampilkan;
    setTestimoniData(updatedData);
  };

  const filteredTestimoni = testimoniData.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Halaman Testimoni</h1>
          <button className="text-sm text-gray-600 hover:underline font-semibold">Log out</button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <button className="px-4 py-2 text-sm border rounded-md text-gray-700 bg-white shadow-sm hover:bg-gray-100">
            Add filter
          </button>
          <input
            type="text"
            placeholder="Search by name"
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
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">No. Telp</th>
                <th className="px-4 py-3">Isi Pesan</th>
                <th className="px-5 py-3">Tampilkan</th>
                <th className="px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimoni.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}>
                  <td className="px-4 py-3 text-gray-800">{item.nama}</td>
                  <td className="px-4 py-3 text-gray-800">{item.email}</td>
                  <td className="px-4 py-3 text-gray-800">{item.telepon}</td>
                  <td className="px-4 py-3 text-gray-800">{item.pesan}</td>
                  <td className="px-4 py-3 min-w-[130px]">
                    <button
                      onClick={() => toggleTampilkan(index)}
                      className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition"
                    >
                      {item.tampilkan ? (
                        <>
                          <CheckCircle2 className="text-green-600 " size={18} />
                          <span className="text-green-700 inline-block w-[45px]">YA</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-600" size={18} />
                          <span className="text-red-700 inline-block w-[45px]">TIDAK</span>
                        </>
                      )}
                      <ChevronDown className="text-gray-500 ml-1" size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
