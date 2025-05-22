"use client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

export default function HalamanDaftarPengguna() {
  const [dataPengguna, setDataPengguna] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedPengguna, setSelectedPengguna] = useState(null);

  const [form, setForm] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchDataPengguna();
  }, []);

  async function fetchDataPengguna() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/daftar_pengguna");
      if (!res.ok) throw new Error("Gagal mengambil data pengguna");
      const data = await res.json();
      setDataPengguna(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleDeleteClick(pengguna) {
    setSelectedPengguna(pengguna);
    setShowConfirmDelete(true);
  }

  async function handleConfirmDelete() {
    if (!selectedPengguna) return;
    try {
      const res = await fetch(`/api/daftar_pengguna?id=${selectedPengguna.id_pengguna}`, {
        method: "DELETE",
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Gagal menghapus pengguna");
      }
      
      alert("Pengguna berhasil dihapus!");
      fetchDataPengguna();
    } catch (err) {
      alert(err.message);
    } finally {
      setShowConfirmDelete(false);
      setSelectedPengguna(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      const res = await fetch("/api/daftar_pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Gagal menambah pengguna");
      }
      
      alert("Pengguna berhasil ditambahkan!");
      setForm({ nama: "", username: "", email: "", password: "" });
      setIsModalOpen(false);
      fetchDataPengguna();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchDataPengguna}
            className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
            Halaman Pendaftar
          </h1>
        </div>

        <div className="overflow-x-auto rounded-lg shadow mt-15">
          <table className="min-w-full text-sm md:text-lg text-left">
            <thead className="bg-white text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Nama</th>
                <th className="px-6 py-4 font-semibold">Username</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Password</th>
                <th className="px-6 py-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataPengguna.length > 0 ? (
                dataPengguna.map((item, index) => (
                  <tr
                    key={item.id_pengguna || index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4">{item.nama}</td>
                    <td className="px-6 py-4">{item.username}</td>
                    <td className="px-6 py-4">{item.email}</td>
                    <td className="px-6 py-4 text-gray-500">
                      ••••••••
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Hapus pengguna"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    Tidak ada data pengguna
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-800 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow text-sm md:text-lg transition-colors"
          >
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Modal Tambah Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Tambah Pengguna</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="nama"
                value={form.nama}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password (min. 6 karakter)"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitLoading}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitLoading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Yakin ingin menghapus pengguna{" "}
              <strong>{selectedPengguna?.nama}</strong>?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setSelectedPengguna(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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