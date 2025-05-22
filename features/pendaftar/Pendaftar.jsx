"use client";

import { useState, useEffect } from "react";
import { Trash2, Eye } from "lucide-react";
import * as XLSX from "xlsx";

export default function HalamanPendaftar() {
  const [search, setSearch] = useState("");
  const [dataPendaftar, setDataPendaftar] = useState([]);
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/pendaftar");
        if (!res.ok) throw new Error("Gagal fetch data");
        const data = await res.json();
        setDataPendaftar(data);
      } catch (error) {
        console.error("Gagal mengambil data pendaftar:", error);
      }
    }

    fetchData();
  }, []);

  const filteredData = dataPendaftar.filter((p) =>
    (p.nama_lengkap ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const deleteTestimoni = async (item) => {
    try {
      const res = await fetch(`/api/pendaftar?id=${item.id_siswa}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      setDataPendaftar((prev) => prev.filter((p) => p.id_siswa !== item.id_siswa));
      setConfirmDelete(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(dataPendaftar);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
    XLSX.writeFile(workbook, "data_pendaftar.xlsx");
  };

  return (
    <div className="items-center justify-center min-h-screen w-full p-8 bg-gray-50">
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
        <table className="min-w-full text-sm md:text-lg text-left">
          <thead className="bg-white text-gray-800">
            <tr>
              <th className="px-6 py-4">Nama</th>
              <th className="px-6 py-4">Tempat Lahir</th>
              <th className="px-6 py-4">Tanggal Lahir</th>
              <th className="px-6 py-4">Jenis Kelamin</th>
              <th className="px-6 py-4">Agama</th>
              <th className="px-6 py-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, i) => (
              <>
                <tr
                  key={`row-${item.id_siswa}`}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"}
                >
                  <td className="px-6 py-4">{item.nama_lengkap}</td>
                  <td className="px-6 py-4">{item.tempat_lahir}</td>
                  <td className="px-4 py-2">
                    {item.tanggal_lahir
                      ? new Date(item.tanggal_lahir).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-2">{item.jenis_kelamin}</td>
                  <td className="px-4 py-2">{item.agama}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => setConfirmDelete(item)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => setSelected(selected?.id_siswa === item.id_siswa ? null : item)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {selected?.id_siswa === item.id_siswa ? "Tutup" : "Lihat Selengkapnya"}
                    </button>
                  </td>
                </tr>
                {selected?.id_siswa === item.id_siswa && (
                  <tr className="bg-gray-100">
                    <td colSpan="7" className="px-6 py-4 text-sm text-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><strong>Nama Lengkap:</strong> {item.nama_lengkap}</div>
                        <div><strong>Nama Panggilan:</strong> {item.nama_panggilan}</div>
                        <div><strong>Tempat Lahir:</strong> {item.tempat_lahir}</div>
                        <div><strong>Tanggal Lahir:</strong> {item.tanggal_lahir}</div>
                        <div><strong>Jenis Kelamin:</strong> {item.jenis_kelamin}</div>
                        <div><strong>Anak ke:</strong> {item.anak_ke}</div>
                        <div><strong>Jumlah Saudara:</strong> {item.jumlah_saudara}</div>
                        <div><strong>Status Dalam Keluarga:</strong> {item.status_dalam_keluarga}</div>
                        <div><strong>Kewarganegaraan:</strong> {item.kewarganegaraan}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={downloadExcel}
          className="px-4 py-2 bg-green-800 hover:bg-green-600 text-white text-sm md:text-lg rounded"
        >
          Unduh Selengkapnya
        </button>
      </div>

      {/* Pop up konfirmasi hapus */}
      {confirmDelete && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Konfirmasi Hapus</h2>
            <p>Apakah Anda yakin ingin menghapus data "{confirmDelete.nama_lengkap}"?</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={() => deleteTestimoni(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}