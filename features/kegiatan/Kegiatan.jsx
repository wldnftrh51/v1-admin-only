"use client";
import React, { useState, useEffect } from "react";
import {FaEdit } from "react-icons/fa";
import {
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Calendar,
  FileText,
  Image,
  Search,
} from "lucide-react";

export default function HalamanKegiatan() {
  const [dataKegiatan, setDataKegiatan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("tanggal");
  const [sortOrder, setSortOrder] = useState("desc");

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
    judul: "",
    loading: false,
  });

  const [form, setForm] = useState({
    judul: "",
    tanggal: "",
    deskripsi: "",
    foto: null,
    fotoURL: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Function untuk mengkonversi tanggal ke format YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  // Function untuk format tanggal display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Ambil data kegiatan dari API
  useEffect(() => {
    const fetchKegiatan = async () => {
      try {
        const response = await fetch("/api/kegiatan");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        // Format tanggal untuk setiap item
        const formattedData = data.map((item) => ({
          ...item,
          tanggal: formatDateForInput(item.tanggal),
        }));
        setDataKegiatan(formattedData);
        showNotification(
          "success",
          "Berhasil",
          "Data kegiatan berhasil dimuat"
        );
      } catch (error) {
        console.error("Gagal memuat data:", error);
        showNotification(
          "error",
          "Gagal Memuat",
          "Terjadi kesalahan saat memuat data kegiatan"
        );
      }
    };
    fetchKegiatan();
  }, []);

  const handleSubmit = async () => {
    if (!form.judul || !form.tanggal || !form.deskripsi) {
      showNotification("warning", "Peringatan", "Semua field harus diisi!");
      return;
    }

    setLoading(true);
    let fotoURL = form.fotoURL;

    // Upload foto jika ada file baru
    if (form.foto) {
      try {
        const formData = new FormData();
        formData.append("file", form.foto);

        const uploadRes = await fetch("/api/kegiatan", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Upload foto gagal");
        }

        const uploadResult = await uploadRes.json();
        fotoURL = uploadResult.url;
      } catch (err) {
        showNotification(
          "error",
          "Error Upload",
          "Gagal mengunggah foto: " + err.message
        );
        setLoading(false);
        return;
      }
    }

    // Prepare payload
    const payload = {
      judul: form.judul,
      tanggal: form.tanggal,
      deskripsi: form.deskripsi,
      foto: fotoURL,
    };

    try {
      if (editIndex !== null) {
        // Update kegiatan
        const res = await fetch("/api/kegiatan", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            id_kegiatan: dataKegiatan[editIndex].id_kegiatan,
          }),
        });

        if (!res.ok) {
          throw new Error("Gagal mengupdate kegiatan");
        }

        // Update local state
        const updated = [...dataKegiatan];
        updated[editIndex] = {
          ...dataKegiatan[editIndex],
          ...payload,
          tanggal: formatDateForInput(payload.tanggal),
        };
        setDataKegiatan(updated);
        showNotification("success", "Berhasil", "Kegiatan berhasil diupdate!");
      } else {
        // Add new kegiatan
        const res = await fetch("/api/kegiatan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error("Gagal menambahkan kegiatan");
        }

        const newData = await res.json();
        const formattedNewData = {
          ...newData,
          tanggal: formatDateForInput(newData.tanggal),
        };
        setDataKegiatan([formattedNewData, ...dataKegiatan]);
        showNotification(
          "success",
          "Berhasil",
          "Kegiatan berhasil ditambahkan!"
        );
      }

      // Reset form
      setForm({
        judul: "",
        tanggal: "",
        deskripsi: "",
        foto: null,
        fotoURL: "",
      });
      setEditIndex(null);
      setShowModal(false);
    } catch (err) {
      showNotification("error", "Error", err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    const kegiatan = dataKegiatan[index];
    setForm({
      judul: kegiatan.judul,
      tanggal: formatDateForInput(kegiatan.tanggal),
      deskripsi: kegiatan.deskripsi,
      foto: null,
      fotoURL: kegiatan.foto || "",
    });
    setEditIndex(index);
    setShowModal(true);
  };

  // Show delete confirmation
  const showDeleteConfirmation = (id_kegiatan, judul) => {
    setConfirmDelete({ show: true, id: id_kegiatan, judul, loading: false });
  };

  // Enhanced delete function
  const deleteKegiatan = async () => {
    const { id, judul } = confirmDelete;

    setConfirmDelete((prev) => ({ ...prev, loading: true }));

    try {
      const res = await fetch(`/api/kegiatan?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Gagal menghapus kegiatan");
      }

      const updatedData = dataKegiatan.filter(
        (item) => item.id_kegiatan !== id
      );
      setDataKegiatan(updatedData);
      showNotification(
        "success",
        "Berhasil Dihapus",
        `Kegiatan "${judul}" telah dihapus`
      );
    } catch (error) {
      console.error("Error deleting kegiatan:", error);
      showNotification(
        "error",
        "Gagal Menghapus",
        "Terjadi kesalahan saat menghapus kegiatan"
      );
    } finally {
      setConfirmDelete({ show: false, id: null, judul: "", loading: false });
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setConfirmDelete({ show: false, id: null, judul: "", loading: false });
  };

  const handleShowDetail = (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedKegiatan(null);
    setShowDetailModal(false);
  };

  // Sorting and filtering
  const sortedKegiatan = [...dataKegiatan].sort((a, b) => {
    if (sortBy === "judul") {
      return sortOrder === "asc"
        ? a.judul.localeCompare(b.judul)
        : b.judul.localeCompare(a.judul);
    } else if (sortBy === "tanggal") {
      return sortOrder === "asc"
        ? new Date(a.tanggal) - new Date(b.tanggal)
        : new Date(b.tanggal) - new Date(a.tanggal);
    }
    return 0;
  });

  const filteredKegiatan = sortedKegiatan.filter(
    (item) =>
      item.judul.toLowerCase().includes(search.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(search.toLowerCase())
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
          return <CheckCircle className="w-6 h-6 text-blue-500" />;
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
    <div className="items-center justify-center min-h-screen w-full p-8 pb-0 bg-gray-50">
      {/* Enhanced Notification Popup */}
      <NotificationPopup />

      {/* Enhanced Detail Modal */}
      {showDetailModal && selectedKegiatan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 relative animate-in zoom-in-95 duration-200">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Kiri: Gambar dan Info */}
              <div className="md:w-1/3 w-full">
                {selectedKegiatan.foto ? (
                  <img
                    src={selectedKegiatan.foto}
                    alt={selectedKegiatan.judul}
                    className="rounded-lg object-cover w-full aspect-[4/3] mb-4 shadow-md"
                  />
                ) : (
                  <div className="w-full aspect-[4/3] mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Image className="w-12 h-12 mx-auto mb-2" />
                      <span>Tidak ada foto</span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h2 className="font-bold text-xl text-gray-900">
                    {selectedKegiatan.judul}
                  </h2>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDateDisplay(selectedKegiatan.tanggal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Kanan: Detail */}
              <div className="md:w-2/3 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-700">
                    Deskripsi Kegiatan
                  </h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedKegiatan.deskripsi}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
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
                    Konfirmasi Hapus Kegiatan
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Apakah Anda yakin ingin menghapus kegiatan{" "}
                  <span className="font-semibold text-red-700">
                    "{confirmDelete.judul}"
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Data kegiatan akan dihapus secara permanen dari sistem.
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
                  onClick={deleteKegiatan}
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
                      Hapus Kegiatan
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
          Halaman Kegiatan
        </h1>
      </div>

      <div className="flex flex-col pl-6 sm:flex-row sm:items-center gap-2 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 text-sm md:text-lg border border-gray-300 rounded-lg w-full sm:w-80 shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg ml-6 bg-white shadow-lg mt-6">
        <table className="w-full table-auto text-sm md:text-lg text-left">
          <thead className="bg-[#F3F6FD] text-gray-700">
            <tr>
              <th
                className="px-6 py-4 cursor-pointer min-w-[150px] hover:bg-blue-50 transition-colors"
                onClick={() => {
                  if (sortBy === "judul") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("judul");
                    setSortOrder("asc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Judul{" "}
                  {sortBy === "judul" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </div>
              </th>
              <th
                className="px-6 py-4 cursor-pointer min-w-[120px] hover:bg-blue-50 transition-colors"
                onClick={() => {
                  if (sortBy === "tanggal") {
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                  } else {
                    setSortBy("tanggal");
                    setSortOrder("desc");
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  Tanggal{" "}
                  {sortBy === "tanggal"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </div>
              </th>
              <th className="px-6 py-4 min-w-[200px]">Deskripsi</th>
              <th className="px-6 py-4 min-w-[100px]">Foto</th>
              <th className="px-6 py-4 min-w-[80px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredKegiatan.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="w-12 h-12 text-gray-300" />
                    <p className="text-lg font-medium">
                      {dataKegiatan.length === 0
                        ? "Belum ada data kegiatan"
                        : "Tidak ada data yang sesuai pencarian"}
                    </p>
                    <p className="text-sm">
                      {dataKegiatan.length === 0
                        ? "Kegiatan yang ditambahkan akan muncul di sini"
                        : "Coba ubah kata kunci pencarian Anda"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredKegiatan.map((kegiatan, i) => (
                <tr
                  key={kegiatan.id_kegiatan}
                  className={`hover:bg-blue-50 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"
                  }`}
                >
                  <td
                    className="px-6 py-4 text-gray-800 break-words font-medium hover:text-green-600 cursor-pointer"
                    onClick={() => handleShowDetail(kegiatan)}
                  >
                    {kegiatan.judul}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDateDisplay(kegiatan.tanggal)}
                  </td>
                  <td
                    className="px-6 py-4 text-gray-700 break-words cursor-pointer hover:text-green-600"
                    onClick={() => handleShowDetail(kegiatan)}
                  >
                    <div className="max-w-xs overflow-hidden">
                      {kegiatan.deskripsi.length > 80
                        ? kegiatan.deskripsi.substring(0, 80) + "..."
                        : kegiatan.deskripsi}
                    </div>
                  </td>
                  <td className="px-6 py-2">
                    {kegiatan.foto ? (
                      <img
                        src={kegiatan.foto}
                        alt={kegiatan.judul}
                        className="w-16 h-16 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleShowDetail(kegiatan)}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(i)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Edit kegiatan"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          showDeleteConfirmation(
                            kegiatan.id_kegiatan,
                            kegiatan.judul
                          )
                        }
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus kegiatan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="pt-6 flex justify-end">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-btn text-white rounded text-lg transition-colors shadow-md"
          onClick={() => {
            setForm({
              judul: "",
              tanggal: "",
              deskripsi: "",
              foto: null,
              fotoURL: "",
            });
            setEditIndex(null);
            setShowModal(true);
          }}
        >
          <Plus className="w-4 h-4" />
          Tambah Kegiatan
        </button>
      </div>

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-opacity-30">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-gray-200 p-10 mx-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6">
              {editIndex !== null ? "Edit Kegiatan" : "Tambah Kegiatan"}
            </h1>

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

              <div className="md:col-span-2">
                <textarea
                  placeholder="Deskripsi"
                  className="border border-gray-300 rounded-md px-3 py-2 w-full h-24 resize-vertical"
                  value={form.deskripsi}
                  onChange={(e) =>
                    setForm({ ...form, deskripsi: e.target.value })
                  }
                />
              </div>

              {/* File Input untuk Foto */}
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Foto Kegiatan (Opsional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm({ ...form, foto: e.target.files[0] })
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 w-full"
                />

                {/* Preview foto baru */}
                {form.foto && (
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                    <img
                      src={URL.createObjectURL(form.foto)}
                      alt="Preview"
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">
                        {form.foto.name}
                      </span>
                      <p className="text-xs text-gray-500">Foto baru</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, foto: null })}
                      className="text-red-500 text-sm hover:text-red-700"
                    >
                      Hapus
                    </button>
                  </div>
                )}

                {/* Preview foto yang sudah ada (untuk edit) */}
                {!form.foto && form.fotoURL && editIndex !== null && (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                    <img
                      src={form.fotoURL}
                      alt="Current"
                      className="w-16 h-16 rounded object-cover"
                    />
                    <div className="flex-1">
                      <span className="text-sm text-gray-600">
                        Foto saat ini
                      </span>
                      <p className="text-xs text-gray-500">
                        Pilih file baru untuk mengubah
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm md:text-lg px-6 py-2 rounded-md mr-4 disabled:bg-gray-400"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? "Menyimpan..."
                  : editIndex !== null
                  ? "Simpan"
                  : "Tambah"}
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium text-sm md:text-lg px-6 py-2 rounded-md"
                onClick={() => {
                  setShowModal(false);
                  setForm({
                    judul: "",
                    tanggal: "",
                    deskripsi: "",
                    foto: null,
                    fotoURL: "",
                  });
                  setEditIndex(null);
                }}
                disabled={loading}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Konfirmasi Hapus
            </h2>
            <p className="text-gray-700 mb-6">
              Apakah Anda yakin ingin menghapus kegiatan ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteIndex(null);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Batal
              </button>
              <button
                onClick={deleteKegiatan}
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
