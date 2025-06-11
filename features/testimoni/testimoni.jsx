"use client";

import { useState, useEffect } from "react";
import { Trash2, ChevronDown, CheckCircle2, XCircle, AlertTriangle, CheckCircle, Eye, EyeOff } from "lucide-react";

export default function HalamanTestimoni() {
  const [search, setSearch] = useState("");
  const [testimoniData, setTestimoniData] = useState([]);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedTestimoni, setSelectedTestimoni] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
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
    id: null, 
    nama: '',
    loading: false 
  });

  // Function untuk menampilkan notifikasi
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    // Auto hide setelah 4 detik (sedikit lebih lama dari sebelumnya)
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Function untuk menutup notifikasi
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  // Ambil data dari API ketika pertama kali komponen dimuat
  useEffect(() => {
    const fetchTestimoni = async () => {
      try {
        const response = await fetch("/api/testimoni");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTestimoniData(data);
        showNotification('success', 'Berhasil', 'Data testimoni berhasil dimuat');
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
        showNotification('error', 'Gagal Memuat', 'Terjadi kesalahan saat memuat data testimoni');
      }
    };
    fetchTestimoni();
  }, []);

  // Toggle status tampilkan
  const toggleTampilkan = async (id_testimoni) => {
    const originalData = [...testimoniData];
    
    try {
      // Optimistic update
      const updatedData = testimoniData.map((item) =>
        item.id_testimoni === id_testimoni
          ? { ...item, tampilkan: !item.tampilkan }
          : item
      );
      setTestimoniData(updatedData);

      const toggledItem = updatedData.find(
        (item) => item.id_testimoni === id_testimoni
      );

      const response = await fetch("/api/testimoni", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_testimoni, tampilkan: toggledItem.tampilkan }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      showNotification(
        'success', 
        'Status Diubah', 
        `Testimoni ${toggledItem.tampilkan ? 'ditampilkan' : 'disembunyikan'} di halaman publik`
      );
    } catch (error) {
      console.error("Error updating status:", error);
      showNotification('error', 'Gagal Mengubah Status', 'Terjadi kesalahan saat mengubah status tampilan');
      // Revert changes if API call fails
      setTestimoniData(originalData);
    }
  };

  // Show delete confirmation
  const showDeleteConfirmation = (id_testimoni, nama) => {
    setConfirmDelete({ show: true, id: id_testimoni, nama, loading: false });
  };

  // Enhanced delete function
  const deleteTestimoni = async () => {
    const { id, nama } = confirmDelete;
    
    setConfirmDelete(prev => ({ ...prev, loading: true }));
    
    try {
      const response = await fetch("/api/testimoni", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id_testimoni: id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete testimoni");
      }

      const updatedData = testimoniData.filter(
        (item) => item.id_testimoni !== id
      );
      setTestimoniData(updatedData);
      showNotification('success', 'Berhasil Dihapus', `Testimoni dari ${nama} telah dihapus`);
    } catch (error) {
      console.error("Error deleting testimoni:", error);
      showNotification('error', 'Gagal Menghapus', 'Terjadi kesalahan saat menghapus testimoni');
    } finally {
      setConfirmDelete({ show: false, id: null, nama: '', loading: false });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete({ show: false, id: null, nama: '', loading: false });
  };

  // Show detail modal
  const handleShowDetail = (testimoni) => {
    setSelectedTestimoni(testimoni);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setSelectedTestimoni(null);
    setShowDetailModal(false);
  };

  const sortedTestimoni = [...testimoniData].sort((a, b) => {
    if (sortBy === "nama") {
      return sortOrder === "asc"
        ? a.nama.localeCompare(b.nama)
        : b.nama.localeCompare(a.nama);
    } else if (sortBy === "tampilkan") {
      return sortOrder === "asc"
        ? (b.tampilkan === true) - (a.tampilkan === true)
        : (a.tampilkan === true) - (b.tampilkan === true);
    }
    return 0;
  });

  const filteredTestimoni = sortedTestimoni.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      {/* Enhanced Notification Popup */}
      <NotificationPopup />

      {/* Enhanced Detail Modal */}
      {showDetailModal && selectedTestimoni && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  Testimoni dari {selectedTestimoni.nama}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedTestimoni.no_telpon}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedTestimoni.tampilkan ? (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <Eye className="w-3 h-3" />
                    Ditampilkan
                  </div>
                ) : (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    <EyeOff className="w-3 h-3" />
                    Disembunyikan
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">
                Isi Pesan
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTestimoni.isi_pesan}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => toggleTampilkan(selectedTestimoni.id_testimoni)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedTestimoni.tampilkan
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-100 text-green-700 hover:bg-blue-200'
                }`}
              >
                {selectedTestimoni.tampilkan ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Sembunyikan
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Tampilkan
                  </>
                )}
              </button>

              <button
                onClick={closeDetailModal}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={closeDetailModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              aria-label="Tutup"
            >
              &times;
            </button>
          </div>
        </div>
      )}

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
                    Konfirmasi Hapus Testimoni
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Apakah Anda yakin ingin menghapus testimoni dari{' '}
                  <span className="font-semibold text-red-700">
                    {confirmDelete.nama}
                  </span>?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Data testimoni akan dihapus secara permanen dari sistem.
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
                  onClick={deleteTestimoni}
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
                      Hapus Testimoni
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col p-6 sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
          Halaman Testimoni
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center pl-6 gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm md:text-lg border border-gray-300 rounded-lg w-full sm:w-80 shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="overflow-x-auto ml-6 rounded-lg bg-white shadow-lg mt-6">
        <table className="w-full table-auto text-sm md:text-lg text-left">
          <thead className="bg-[#F3F6FD] text-gray-700">
            <tr>
              <th
                className="px-6 py-4 cursor-pointer min-w-[120px] hover:bg-blue-50 transition-colors"
                onClick={() => {
                  if (sortBy === "nama") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("nama");
                    setSortOrder("asc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Nama{" "}
                  {sortBy === "nama" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </div>
              </th>
              <th className="px-6 py-4 min-w-[120px]">No. Telp</th>
              <th className="px-6 py-4 min-w-[200px]">Isi Pesan</th>
              <th
                className="px-6 py-4 cursor-pointer min-w-[120px] hover:bg-blue-50 transition-colors"
                onClick={() => {
                  if (sortBy === "tampilkan") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("tampilkan");
                    setSortOrder("asc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Tampilkan{" "}
                  {sortBy === "tampilkan"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </div>
              </th>
              <th className="px-6 py-4 min-w-[80px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredTestimoni.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="w-12 h-12 text-gray-300" />
                    <p className="text-lg font-medium">
                      {testimoniData.length === 0 ? 'Belum ada data testimoni' : 'Tidak ada data yang sesuai pencarian'}
                    </p>
                    <p className="text-sm">
                      {testimoniData.length === 0 
                        ? 'Testimoni dari pelanggan akan muncul di sini' 
                        : 'Coba ubah kata kunci pencarian Anda'
                      }
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTestimoni.map((item, index) => (
                <tr
                  key={item.id_testimoni}
                  className={`hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"
                  }`}
                >
                  <td 
                    className="px-6 py-4 text-gray-800 break-words font-medium hover:text-green-600 cursor-pointer"
                    onClick={() => handleShowDetail(item)}
                  >
                    {item.nama}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.no_telpon}
                  </td>
                  <td 
                    className="px-6 py-4 text-gray-700 break-words cursor-pointer hover:text-green-600"
                    onClick={() => handleShowDetail(item)}
                  >
                    <div className="max-w-xs overflow-hidden">
                      {item.isi_pesan.length > 80
                        ? item.isi_pesan.substring(0, 80) + "..."
                        : item.isi_pesan}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleTampilkan(item.id_testimoni)}
                      className="flex items-center gap-2 text-sm md:text-base font-medium px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {item.tampilkan ? (
                        <>
                          <CheckCircle2 className="text-green-600" size={18} />
                          <span className="text-green-700 inline-block w-[70px]">
                            YA
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-600" size={18} />
                          <span className="text-red-700 inline-block w-[70px]">
                            TIDAK
                          </span>
                        </>
                      )}
                      <ChevronDown className="text-gray-500 ml-1" size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => showDeleteConfirmation(item.id_testimoni, item.nama)}
                      className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Hapus testimoni"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}