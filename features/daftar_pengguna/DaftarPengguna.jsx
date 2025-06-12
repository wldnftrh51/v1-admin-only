"use client";
import { useEffect, useState } from "react";
import { Trash2, CheckCircle, XCircle, AlertTriangle, CheckCircle2, UserPlus, Users } from "lucide-react";

export default function HalamanDaftarPengguna() {
  const [dataPengguna, setDataPengguna] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enhanced notification state
  const [notification, setNotification] = useState({
    show: false,
    type: "", // 'success', 'error', 'warning', 'info'
    title: "",
    message: "",
  });

  // Enhanced delete confirmation state
  const [confirmDelete, setConfirmDelete] = useState({
    show: false,
    pengguna: null,
    loading: false
  });

  const [form, setForm] = useState({
    nama: "",
    username: "",
    email: "",
    password: "",
  });

  // Function untuk menampilkan notifikasi
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    // Auto hide setelah 4 detik
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Function untuk menutup notifikasi
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

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
      if (data.length > 0) {
        showNotification('success', 'Berhasil', 'Data pengguna berhasil dimuat');
      }
    } catch (err) {
      setError(err.message);
      showNotification('error', 'Gagal Memuat', 'Terjadi kesalahan saat memuat data pengguna');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // Show delete confirmation
  const showDeleteConfirmation = (pengguna) => {
    setConfirmDelete({ show: true, pengguna, loading: false });
  };

  // Enhanced delete function
  const deleteUser = async () => {
    const { pengguna } = confirmDelete;

    setConfirmDelete(prev => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`/api/daftar_pengguna?id=${pengguna.id_pengguna}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menghapus pengguna");
      }

      // Update local data
      const updatedData = dataPengguna.filter(
        (item) => item.id_pengguna !== pengguna.id_pengguna
      );
      setDataPengguna(updatedData);
      showNotification('success', 'Berhasil Dihapus', `Pengguna ${pengguna.nama} telah dihapus`);

    } catch (err) {
      showNotification('error', 'Gagal Menghapus', err.message);
    } finally {
      setConfirmDelete({ show: false, pengguna: null, loading: false });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete({ show: false, pengguna: null, loading: false });
  };

  async function handleSubmit() {
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

      showNotification('success', 'Berhasil Ditambahkan', `Pengguna ${form.nama} berhasil ditambahkan`);
      setForm({ nama: "", username: "", email: "", password: "" });
      setIsModalOpen(false);
      fetchDataPengguna();
    } catch (err) {
      showNotification('error', 'Gagal Menambah', err.message);
    } finally {
      setSubmitLoading(false);
    }
  }

  // Enhanced Notification Component
  const NotificationPopup = () => {
    if (!notification.show) return null;

    const getIcon = () => {
      switch (notification.type) {
        case "success":
          return <CheckCircle className="w-6 h-6 text-green-500" />;
        case "error":
          return <XCircle className="w-6 h-6 text-red-500" />;
        case "warning":
          return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
        case "info":
          return <CheckCircle2 className="w-6 h-6 text-blue-500" />;
        default:
          return <AlertTriangle className="w-6 h-6 text-blue-500" />;
      }
    };

    const getBgColor = () => {
      switch (notification.type) {
        case "success":
          return "bg-green-50 border-green-200";
        case "error":
          return "bg-red-50 border-red-200";
        case "warning":
          return "bg-yellow-50 border-yellow-200";
        case "info":
          return "bg-blue-50 border-blue-200";
        default:
          return "bg-blue-50 border-blue-200";
      }
    };

    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-2">
        <div
          className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-sm`}
        >
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={closeNotification}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

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
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-lg font-medium">Error: {error}</p>
          <button
            onClick={fetchDataPengguna}
            className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between min-h-screen w-full p-2 md:p-8 pb-0 bg-gray-50">
      {/* Enhanced Notification Popup */}
      <NotificationPopup />

      {/* Enhanced Confirmation Modal */}
      {confirmDelete.show && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Konfirmasi Hapus Pengguna
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Apakah Anda yakin ingin menghapus pengguna{' '}
                  <span className="font-semibold text-red-700">
                    {confirmDelete.pengguna?.nama}
                  </span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Data pengguna akan dihapus secara permanen dari sistem.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  disabled={confirmDelete.loading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={deleteUser}
                  disabled={confirmDelete.loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {confirmDelete.loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Hapus Pengguna
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modal Tambah Pengguna */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6 relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  Tambah Pengguna Baru
                </h2>
                <p className="text-sm text-gray-500">
                  Isi form di bawah untuk menambah pengguna
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Masukkan nama lengkap"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Masukkan username"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Masukkan alamat email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitLoading}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitLoading}
                  className="px-6 py-2 bg-btn text-white rounded-lg disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                >
                  {submitLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
                      Tambah Pengguna
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={submitLoading}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold disabled:opacity-50"
              aria-label="Tutup"
            >
              &times;
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-grow p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
            Halaman Daftar Pengguna
          </h1>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow-lg mt-6">
          <table className="w-full table-auto text-sm md:text-lg text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold min-w-[120px]">Nama</th>
                <th className="px-6 py-4 font-semibold min-w-[120px]">Username</th>
                <th className="px-6 py-4 font-semibold min-w-[200px]">Email</th>
                <th className="px-6 py-4 font-semibold min-w-[100px]">Password</th>
                <th className="px-6 py-4 font-semibold min-w-[80px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataPengguna.length > 0 ? (
                dataPengguna.map((item, index) => (
                  <tr
                    key={item.id_pengguna || index}
                    className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"
                      }`}
                  >
                    <td className="px-6 py-4 text-gray-800 font-medium">{item.nama}</td>
                    <td className="px-6 py-4 text-gray-600">{item.username}</td>
                    <td className="px-6 py-4 text-gray-600">{item.email}</td>
                    <td className="px-6 py-4 text-gray-500">
                      <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        ••••••••
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => showDeleteConfirmation(item)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus pengguna"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">Belum ada data pengguna</p>
                      <p className="text-sm">Klik tombol "Tambah Pengguna" untuk menambah pengguna baru</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
        <div className="flex justify-end mt-8">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-btn text-white font-semibold py-3 px-6 rounded-lg shadow-lg text-sm md:text-lg transition-colors flex items-center gap-2"
          >
            <UserPlus size={18} />
            Tambah Pengguna
          </button>
        </div>
    </div>
  );
}