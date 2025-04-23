'use client';

import { useState, useEffect } from 'react';
import { Trash2, ChevronDown, CheckCircle2, XCircle } from 'lucide-react';

export default function HalamanTestimoni() {
  const [search, setSearch] = useState('');
  const [testimoniData, setTestimoniData] = useState([]);
  
  // Ambil data dari API ketika pertama kali komponen dimuat
  useEffect(() => {
    const fetchTestimoni = async () => {
      try {
        const response = await fetch('/api/testimoni');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTestimoniData(data);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    };
    fetchTestimoni();
  }, []);

  // Toggle status tampilkan
  const toggleTampilkan = async (id_testimoni) => {
    const updatedData = testimoniData.map(item =>
      item.id_testimoni === id_testimoni
        ? { ...item, tampilkan: !item.tampilkan }
        : item
    );
    setTestimoniData(updatedData);

    // Kirim perubahan status tampilkan ke API
    const toggledItem = updatedData.find(item => item.id_testimoni === id_testimoni);

    await fetch('/api/testimoni', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_testimoni, tampilkan: toggledItem.tampilkan }),
    });
  };

  // Menghapus testimoni
  const deleteTestimoni = async (id_testimoni) => {
    const updatedData = testimoniData.filter(item => item.id_testimoni !== id_testimoni);
    setTestimoniData(updatedData);

    // Kirim request delete ke API
    await fetch('/api/testimoni', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_testimoni }),
    });
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
                <th className="px-6 py-3">Nama</th>
                <th className="px-4 py-3">No. Telp</th>
                <th className="px-7 py-3 text-center">Isi Pesan</th>
                <th className="px-3 py-3">Tampilkan</th>
                <th className="px-3 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimoni.map((item) => (
                <tr key={item.id_testimoni} className={item.id_testimoni % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}>
                  <td className="px-6 py-5 text-gray-800">{item.nama}</td>
                  <td className="px-4 py-5 text-gray-800">{item.no_telepon}</td>
                  <td className="px-7 py-5 text-gray-800">{item.isi_pesan}</td>
                  <td className="px-3 py-5 min-w-[130px]">
                    <button
                      onClick={() => toggleTampilkan(item.id_testimoni)}
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
                    <button onClick={() => deleteTestimoni(item.id_testimoni)} className="text-red-600 hover:text-red-800">
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
