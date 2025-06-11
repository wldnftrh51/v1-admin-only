"use client";

import { useState, useEffect } from "react";
import {
  Trash2,
  Eye,
  Download,
  Search,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function HalamanPendaftar() {
  const [search, setSearch] = useState("");
  const [dataPendaftar, setDataPendaftar] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    pendaftar: null,
    loading: false,
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
    fetchDataPendaftar();
  }, []);

  async function fetchDataPendaftar() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pendaftar");
      if (!res.ok) throw new Error("Gagal mengambil data pendaftar");
      const data = await res.json();
      setDataPendaftar(data);
      if (data.length > 0) {
        showNotification(
          "success",
          "Berhasil",
          "Data pendaftar berhasil dimuat"
        );
      }
    } catch (err) {
      setError(err.message);
      showNotification(
        "error",
        "Gagal Memuat",
        "Terjadi kesalahan saat memuat data pendaftar"
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredData = dataPendaftar.filter((p) =>
    (p.nama_lengkap ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Show delete confirmation
  const showDeleteConfirmation = (pendaftar) => {
    setConfirmDelete({ show: true, pendaftar, loading: false });
  };

  // Enhanced delete function
  const deletePendaftar = async () => {
    const { pendaftar } = confirmDelete;

    setConfirmDelete((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`/api/pendaftar?id=${pendaftar.id_siswa}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menghapus pendaftar");
      }

      // Update local data
      const updatedData = dataPendaftar.filter(
        (item) => item.id_siswa !== pendaftar.id_siswa
      );
      setDataPendaftar(updatedData);
      showNotification(
        "success",
        "Berhasil Dihapus",
        `Data pendaftar ${pendaftar.nama_lengkap} telah dihapus`
      );
    } catch (err) {
      showNotification("error", "Gagal Menghapus", err.message);
    } finally {
      setConfirmDelete({ show: false, pendaftar: null, loading: false });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete({ show: false, pendaftar: null, loading: false });
  };

  const downloadExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(dataPendaftar);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pendaftar");
      XLSX.writeFile(workbook, "data_pendaftar.xlsx");
      showNotification(
        "success",
        "Berhasil Diunduh",
        "File Excel berhasil diunduh"
      );
    } catch (err) {
      showNotification(
        "error",
        "Gagal Mengunduh",
        "Terjadi kesalahan saat mengunduh file"
      );
    }
  };

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
          <p className="text-gray-600">Memuat data pendaftar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4 text-lg font-medium">
            Error: {error}
          </p>
          <button
            onClick={fetchDataPendaftar}
            className="bg-green-800 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
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
                    Konfirmasi Hapus Data
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Apakah Anda yakin ingin menghapus data pendaftar{" "}
                  <span className="font-semibold text-red-700">
                    {confirmDelete.pendaftar?.nama_lengkap}
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Data pendaftar akan dihapus secara permanen dari sistem.
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
                  onClick={deletePendaftar}
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
                      Hapus Data
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 p-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
            Halaman Pendaftar
          </h1>
        </div>

        {/* Enhanced Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm md:text-lg border border-gray-300 rounded-lg w-full sm:w-80 shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-sm text-gray-500 hover:text-gray-700 px-2"
            >
              Clear
            </button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow-lg mt-6">
          <table className="w-full table-auto text-sm md:text-lg text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold min-w-[150px]">Nama</th>
                <th className="px-6 py-4 font-semibold min-w-[120px]">
                  Tempat Lahir
                </th>
                <th className="px-6 py-4 font-semibold min-w-[150px]">
                  Tanggal Lahir
                </th>
                <th className="px-6 py-4 font-semibold min-w-[120px]">
                  Jenis Kelamin
                </th>
                <th className="px-6 py-4 font-semibold min-w-[100px]">Agama</th>
                <th className="px-6 py-4 font-semibold min-w-[120px]">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <>
                    <tr
                      key={item.id_siswa}
                      className={`hover:bg-blue-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"
                      }`}
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {item.nama_lengkap}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.tempat_lahir}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.tanggal_lahir
                          ? new Date(item.tanggal_lahir).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.jenis_kelamin}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{item.agama}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => showDeleteConfirmation(item)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Hapus data"
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            onClick={() =>
                              setSelected(
                                selected?.id_siswa === item.id_siswa
                                  ? null
                                  : item
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                            title={
                              selected?.id_siswa === item.id_siswa
                                ? "Tutup detail"
                                : "Lihat detail"
                            }
                          >
                            {selected?.id_siswa === item.id_siswa ? (
                              <span className="flex items-center gap-1">
                                <Eye size={16} />
                                Tutup
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Eye size={16} />
                                Detail
                              </span>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {selected?.id_siswa === item.id_siswa && (
                      <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-green-400">
                        <td colSpan="6" className="px-6 py-6">
                          <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                              <Eye className="w-5 h-5 text-blue-600" />
                              Detail Lengkap - {item.nama_lengkap}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Nama Lengkap:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.nama_lengkap}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Nama Panggilan:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.nama_panggilan}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Tempat Lahir:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.tempat_lahir}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Tanggal Lahir:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.tanggal_lahir}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Jenis Kelamin:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.jenis_kelamin}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Anak ke:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.anak_ke}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Jumlah Saudara:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.jumlah_saudara}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Status Dalam Keluarga:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.status_dalam_keluarga}
                                </p>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <span className="font-semibold text-gray-700">
                                  Kewarganegaraan:
                                </span>
                                <p className="text-gray-800 mt-1">
                                  {item.kewarganegaraan}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-lg font-medium">
                        {search
                          ? "Tidak ada data yang sesuai dengan pencarian"
                          : "Belum ada data pendaftar"}
                      </p>
                      <p className="text-sm">
                        {search
                          ? `Coba ubah kata kunci pencarian "${search}"`
                          : "Data pendaftar akan muncul di sini"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Menampilkan {filteredData.length} dari {dataPendaftar.length} data
            pendaftar
          </div>
          <button
            onClick={downloadExcel}
            disabled={dataPendaftar.length === 0}
            className="bg-green-800 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg text-sm md:text-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Unduh Excel
          </button>
        </div>
      </div>
    </div>
  );
}
