"use client";
import { useState, useEffect } from "react";
import { FaFileExcel } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaEdit } from "react-icons/fa";
import {
  Trash2,
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";

export default function HalamanGuru() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dataGuru, setDataGuru] = useState([]);
  const [loading, setLoading] = useState(false);

  // Enhanced notification state 
  const [notification, setNotification] = useState({
    show: false,
    type: "", 
    title: "",
    message: "",
  });

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [guruToDelete, setGuruToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // State untuk detail guru
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // State untuk edit
  const [editingGuru, setEditingGuru] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
    nip: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    foto: null,
  });

  // Function untuk menampilkan notifikasi (mengganti showToast)
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

  const fetchDataGuru = () => {
    fetch("/api/guru")
      .then((res) => res.json())
      .then((data) => {
        setDataGuru(data);
        showNotification("success", "Berhasil", "Data guru berhasil dimuat");
      })
      .catch((err) => {
        console.error("Failed to fetch guru:", err);
        showNotification("error", "Gagal Memuat", "Gagal memuat data guru");
      });
  };

  useEffect(() => {
    fetchDataGuru();
  }, []);

  // Reset ke halaman 1 ketika search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Function untuk menampilkan detail guru
  const handleShowDetail = (guru) => {
    setSelectedGuru(guru);
    setShowDetailModal(true);
  };

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Guru");
      worksheet.addRow([
        "Nama",
        "Jabatan",
        "NIP",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Jenis Kelamin",
      ]);

      // Export semua data yang terfilter, bukan hanya halaman saat ini
      filteredGuru.forEach((guru) => {
        worksheet.addRow([
          guru.nama,
          guru.jabatan,
          guru.nip,
          guru.tempat,
          guru.tanggal_lahir,
          guru.jenis_kelamin,
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "data-guru.xlsx");
      showNotification(
        "success",
        "Berhasil",
        "Data berhasil diekspor ke Excel"
      );
    } catch (error) {
      showNotification("error", "Gagal Export", "Gagal mengekspor data");
    }
  };

  const resetForm = () => {
    setForm({
      nama: "",
      jabatan: "",
      nip: "",
      tempatLahir: "",
      tanggalLahir: "",
      jenisKelamin: "",
      foto: null,
    });
    setEditingGuru(null);
    setIsEditMode(false);
  };

  const handleSubmit = async () => {
    if (
      !form.nama ||
      !form.jabatan ||
      !form.nip ||
      !form.tempatLahir ||
      !form.tanggalLahir ||
      !form.jenisKelamin
    ) {
      showNotification(
        "warning",
        "Peringatan",
        "Mohon isi semua kolom yang wajib diisi!"
      );
      return;
    }

    setLoading(true);
    let fotoURL = editingGuru?.foto || null;

    // Upload foto jika ada foto baru
    if (form.foto) {
      try {
        const formData = new FormData();
        formData.append("file", form.foto);

        const uploadRes = await fetch("/api/guru", {
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

    const payload = {
      nama: form.nama,
      jabatan: form.jabatan,
      nip: form.nip,
      tempat: form.tempatLahir,
      tanggal_lahir: form.tanggalLahir,
      jenis_kelamin: form.jenisKelamin,
      foto: fotoURL,
    };

    try {
      let res;
      if (isEditMode && editingGuru) {
        // Update guru
        res = await fetch(
          `/api/guru?id=${editingGuru.id || editingGuru.id_guru}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
      } else {
        // Tambah guru baru
        res = await fetch("/api/guru", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        throw new Error(
          isEditMode ? "Gagal mengupdate guru" : "Gagal menambahkan guru"
        );
      }

      const result = await res.json();

      if (isEditMode) {
        // Update data di state
        setDataGuru((prev) =>
          prev.map((guru) =>
            (guru.id || guru.id_guru) ===
              (editingGuru.id || editingGuru.id_guru)
              ? { ...guru, ...payload }
              : guru
          )
        );
        showNotification("success", "Berhasil", "Data guru berhasil diupdate!");
      } else {
        // Tambah data baru ke state
        setDataGuru((prev) => [result, ...prev]);
        showNotification("success", "Berhasil", "Guru berhasil ditambahkan!");
      }

      resetForm();
      setShowModal(false);
    } catch (err) {
      showNotification("error", "Error", err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guru) => {
    setEditingGuru(guru);
    setIsEditMode(true);
    setForm({
      nama: guru.nama,
      jabatan: guru.jabatan,
      nip: guru.nip,
      tempatLahir: guru.tempat,
      tanggalLahir: guru.tanggal_lahir,
      jenisKelamin: guru.jenis_kelamin,
      foto: null, 
    });
    setShowModal(true);
  };

  const confirmDeleteGuru = (guru) => {
    setGuruToDelete(guru);
    setShowDeleteModal(true);
  };

  const [loadingDelete, setLoadingDelete] = useState(false);

  const deleteGuru = async () => {
    if (!guruToDelete) return;

    setLoadingDelete(true); 

    try {
      const res = await fetch(
        `/api/guru?id=${guruToDelete.id || guruToDelete.id_guru}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Gagal menghapus guru");

      // Notifikasi sukses
      showNotification("success", "Berhasil", "Guru berhasil dihapus");

      // Refresh data guru
      fetchDataGuru();

      // Penyesuaian halaman jika data berubah
      const newTotalPages = Math.ceil((filteredGuru.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      showNotification(
        "error",
        "Error",
        error.message || "Terjadi kesalahan saat menghapus guru"
      );
      console.error("Delete Guru Error:", error);
    } finally {
      setLoadingDelete(false); // Selesai loading
      setShowDeleteModal(false);
      setGuruToDelete(null);
    }
  };

  const sortedGuru = [...dataGuru].sort((a, b) => {
    if (sortBy === "nama") { 
      return sortOrder === "asc"
        ? a.nama.localeCompare(b.nama)
        : b.nama.localeCompare(a.nama);
    } else if (sortBy === "jabatan") {
      return sortOrder === "asc"
        ? a.jabatan.localeCompare(b.jabatan)
        : b.jabatan.localeCompare(a.jabatan);
    }
    return 0;
  });

  const filteredGuru = sortedGuru.filter((item) => {
    const lowerSearch = search.toLowerCase();
    return (
      item.nama.toLowerCase().includes(lowerSearch) ||
      item.jabatan.toLowerCase().includes(lowerSearch)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredGuru.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredGuru.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hitungUmur = (tanggalLahir) => {
    const today = new Date();
    const birthDate = new Date(tanggalLahir);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
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
          return <Info className="w-6 h-6 text-blue-500" />;
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
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-2 md:p-8 pb-0 bg-gray-50">
      {/* Enhanced Notification Popup */}
      <NotificationPopup />

      <div className="flex flex-col flex-grow p-6 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
            Halaman Guru
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm md:text-lg border border-gray-300 rounded-lg w-full sm:w-80 shadow-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg bg-white shadow-lg mt-6">
          {/* <div className="overflow-x-auto rounded-md bg-white shadow mt-10 w-full"> */}
          <table className="w-full table-auto text-sm md:text-lg text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-8 md:px-6 py-4">Foto</th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => {
                    if (sortBy === "nama") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("nama");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Nama
                  {sortBy === "nama" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => {
                    if (sortBy === "jabatan") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("jabatan");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Jabatan
                  {sortBy === "jabatan"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Tempat Lahir</th>
                <th className="px-6 py-4">Tanggal Lahir</th>
                <th className="px-6 py-4">Jenis Kelamin</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((guru, i) => (
                <tr
                  key={guru.id || guru.id_guru || i}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"
                    } hover:bg-blue-50 cursor-pointer transition-colors`}
                  onClick={() => handleShowDetail(guru)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          guru.foto ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            guru.nama
                          )}&background=0D8ABC&color=fff`
                        }
                        alt={guru.nama}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            guru.nama
                          )}&background=0D8ABC&color=fff`;
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">{guru.nama}</td>
                  <td className="px-6 py-4">{guru.jabatan}</td>
                  <td className="px-6 py-4">{guru.nip}</td>
                  <td className="px-6 py-4">{guru.tempat}</td>
                  <td className="px-6 py-4">
                    {new Date(guru.tanggal_lahir).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-6 py-4">{guru.jenis_kelamin}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(guru);
                        }}
                        className="text-green-600 hover:text-green-800"
                        title="Edit data"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteGuru(guru);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Hapus data"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center w-full px-6">
        {/* Pagination di kiri */}
        {totalPages > 1 ? (
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-2 py-2 sm:px-3 sm:py-3 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <span className="px-2 py-1 sm:px-3 sm:py-2 border rounded-md font-medium text-sm sm:text-base">
              {currentPage}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-2 py-2 sm:px-3 sm:py-3 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* Tombol Ekspor + Tambahkan Guru */}
        <div className="flex items-center gap-2">
          <button
            className="text-green-600 text-2xl hover:text-green-800"
            onClick={handleExportExcel}
            title="Ekspor ke Excel"
          >
            <FaFileExcel />
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-btn text-white rounded-lg text-sm md:text-lg transition-colors shadow-md hover:bg-green-700"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Tambahkan Guru
          </button>

        </div>
      </div>

      {/* Modal Detail Guru */}
      {showDetailModal && selectedGuru && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Detail Guru</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <img
                src={
                  selectedGuru.foto ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedGuru.nama
                  )}&background=0D8ABC&color=fff&size=150`
                }
                alt={selectedGuru.nama}
                className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedGuru.nama
                  )}&background=0D8ABC&color=fff&size=150`;
                }}
              />
              <h4 className="text-xl font-semibold text-gray-800">
                {selectedGuru.nama}
              </h4>
              <p className="text-gray-600">{selectedGuru.jabatan}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">
                  Informasi Personal
                </h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Nama Lengkap:</span>
                    <p className="font-medium">{selectedGuru.nama}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Jenis Kelamin:
                    </span>
                    <p className="font-medium">{selectedGuru.jenis_kelamin}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Tempat Lahir:</span>
                    <p className="font-medium">{selectedGuru.tempat}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Tanggal Lahir:
                    </span>
                    <p className="font-medium">
                      {formatTanggal(selectedGuru.tanggal_lahir)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Umur:</span>
                    <p className="font-medium">
                      {hitungUmur(selectedGuru.tanggal_lahir)} tahun
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">
                  Informasi Kepegawaian
                </h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Jabatan:</span>
                    <p className="font-medium">{selectedGuru.jabatan}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">NIP:</span>
                    <p className="font-medium">{selectedGuru.nip}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedGuru);
                }}
                className="px-6 py-2 bg-btn text-white rounded-lg  flex items-center gap-2"
              >
                <FaEdit size={16} />
                Edit Data
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Guru */}
      {showModal && (
        <div
          className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => {
            setShowModal(false);
            resetForm();
          }}
        >
          <div
            className="relative bg-white rounded-xl p-6 pb-10 max-w-2xl w-full shadow-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tombol X untuk tutup modal */}
            <button
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
            >
              &times;
            </button>

            <h3 className="text-2xl font-semibold mb-8 text-center text-gray-800">
              {isEditMode ? "Edit Guru" : "Tambah Guru Baru"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Nama Lengkap"
                className="p-3 border rounded-md"
                value={form.nama}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nama: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Jabatan"
                className="p-3 border rounded-md"
                value={form.jabatan}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, jabatan: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="NIP"
                className="p-3 border rounded-md"
                value={form.nip}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, nip: e.target.value }))
                }
              />
              <input
                type="text"
                placeholder="Tempat Lahir"
                className="p-3 border rounded-md"
                value={form.tempatLahir}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tempatLahir: e.target.value }))
                }
              />
              <input
                type="date"
                className="p-3 border rounded-md"
                placeholder="DD-MM-YYYY"
                max={new Date().toISOString().split("T")[0]}
                value={form.tanggalLahir}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, tanggalLahir: e.target.value }))
                }
              />
              <select
                value={form.jenisKelamin}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, jenisKelamin: e.target.value }))
                }
                className="p-3 border rounded-md"
              >
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            {/* File Input dengan Preview */}
            <div className="mt-6">
              <label className="text-sm font-medium block mb-2">
                Foto Profil (Opsional)
              </label>

              {/* Tampilkan foto lama jika dalam mode edit */}
              {isEditMode && editingGuru?.foto && !form.foto && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Foto saat ini:</p>
                  <img
                    src={editingGuru.foto}
                    alt="Foto saat ini"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, foto: e.target.files[0] }))
                }
                className="p-3 border rounded-md w-full"
              />
              {form.foto && (
                <div className="flex items-center gap-4 p-3 mt-3 bg-gray-50 rounded border">
                  <img
                    src={URL.createObjectURL(form.foto)}
                    alt="Preview"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700">
                    {form.foto.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, foto: null }))}
                    className="text-red-500 text-sm hover:text-red-700 ml-auto"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-btn text-white rounded  disabled:bg-green-400"
                disabled={loading}
              >
                {loading
                  ? isEditMode
                    ? "Mengupdate..."
                    : "Menyimpan..."
                  : isEditMode
                    ? "Update"
                    : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Konfirmasi Hapus Guru
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Apakah Anda yakin ingin menghapus data guru{" "}
                  <span className="font-semibold text-red-700">
                    {guruToDelete?.nama}
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Data guru akan dihapus secara permanen dari sistem.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={loadingDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={deleteGuru}
                  disabled={loadingDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loadingDelete ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
