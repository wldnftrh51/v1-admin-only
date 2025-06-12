"use client";
import { FaFileExcel, FaEdit } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Eye,
  User,
  MapPin,
  Calendar,
  Users,
  Heart,
  Flag,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function HalamanSiswa() {
  const [dataSiswa, setDataSiswa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [siswaToDelete, setSiswaToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nama_lengkap");
  const [sortOrder, setSortOrder] = useState("asc");

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Bisa diubah sesuai kebutuhan

  // State untuk notification popup
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    title: "",
    message: "",
  });

  const [form, setForm] = useState({
    nama_lengkap: "",
    nisn: "",
    alamat: "",
    kelas: "",
    jenis_kelamin: "",
    nama_panggilan: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    anak_ke: "",
    jumlah_saudara: "",
    agama: "",
    status_dalam_keluarga: "",
    kewarganegaraan: "",
    file_path: "",
    foto: null,
  });

  // Function untuk membuka modal detail
  const handleShowDetail = (siswa) => {
    setSelectedSiswa(siswa);
    setShowDetailModal(true);
  };

  // Function untuk menutup modal detail
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSiswa(null);
  };

  // Function untuk format tanggal
  const formatTanggal = (tanggal) => {
    if (!tanggal) return "-";
    const date = new Date(tanggal);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Function untuk menampilkan notifikasi
  const showNotification = (type, title, message) => {
    setNotification({
      show: true,
      type,
      title,
      message,
    });

    // Auto hide setelah 5 detik
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  // Function untuk menutup notifikasi
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  useEffect(() => {
    fetchSiswaData();
  }, []);

  // Reset ke halaman pertama ketika search berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const fetchSiswaData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/siswa");
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setDataSiswa(data);

      if (data.length > 0) {
        showNotification("success", "Berhasil", "Data siswa berhasil dimuat");
      } else {
        showNotification("info", "Kosong", "Tidak ada data siswa ditemukan");
      }
    } catch (error) {
      console.error(error);
      showNotification("error", "Error", "Gagal memuat data siswa");
    } finally {
      setLoading(false);
    }
  };

  // Function untuk edit siswa
  const handleEditSiswa = (siswa) => {
    setEditMode(true);
    setEditingSiswa(siswa);
    setForm({
      nama_lengkap: siswa.nama_lengkap || "",
      nisn: siswa.nisn || "",
      alamat: siswa.alamat || "",
      kelas: siswa.kelas || "",
      jenis_kelamin: siswa.jenis_kelamin || "",
      nama_panggilan: siswa.nama_panggilan || "",
      tempat_lahir: siswa.tempat_lahir || "",
      tanggal_lahir: siswa.tanggal_lahir || "",
      anak_ke: siswa.anak_ke || "",
      jumlah_saudara: siswa.jumlah_saudara || "",
      agama: siswa.agama || "",
      status_dalam_keluarga: siswa.status_dalam_keluarga || "",
      kewarganegaraan: siswa.kewarganegaraan || "",
      file_path: siswa.file_path || "",
      foto: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.nisn) {
      showNotification(
        "warning",
        "Peringatan",
        "Mohon isi nama lengkap dan NISN!"
      );
      return;
    }

    setLoading(true);
    let fotoURL = form.file_path;

    // Upload foto jika ada file yang dipilih
    if (form.foto) {
      try {
        const formData = new FormData();
        formData.append("file", form.foto);

        const uploadRes = await fetch("/api/siswa", {
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

    // Payload data siswa
    const payload = {
      nama_lengkap: form.nama_lengkap,
      nisn: form.nisn,
      alamat: form.alamat,
      kelas: form.kelas,
      jenis_kelamin: form.jenis_kelamin,
      nama_panggilan: form.nama_panggilan,
      tempat_lahir: form.tempat_lahir,
      tanggal_lahir: form.tanggal_lahir,
      anak_ke: form.anak_ke,
      jumlah_saudara: form.jumlah_saudara,
      agama: form.agama,
      status_dalam_keluarga: form.status_dalam_keluarga,
      kewarganegaraan: form.kewarganegaraan,
      file_path: fotoURL,
    };

    try {
      let res;

      if (editMode && editingSiswa) {
        // Update siswa
        res = await fetch(`/api/siswa?id=${editingSiswa.id_siswa}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update siswa");

        const updatedSiswa = await res.json();
        setDataSiswa((prev) =>
          prev.map((siswa) =>
            siswa.id_siswa === editingSiswa.id_siswa ? updatedSiswa : siswa
          )
        );

        showNotification(
          "success",
          "Berhasil",
          "Data siswa berhasil diperbarui!"
        );
      } else {
        // Tambah siswa baru
        res = await fetch("/api/siswa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to add siswa");

        const newSiswa = await res.json();
        setDataSiswa((prev) => [newSiswa, ...prev]);

        showNotification("success", "Berhasil", "Siswa berhasil ditambahkan!");
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      const action = editMode ? "memperbarui" : "menambahkan";
      showNotification(
        "error",
        "Error",
        `Gagal ${action} siswa: ${error.message}`
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      nama_lengkap: "",
      nisn: "",
      alamat: "",
      kelas: "",
      jenis_kelamin: "",
      nama_panggilan: "",
      tempat_lahir: "",
      tanggal_lahir: "",
      anak_ke: "",
      jumlah_saudara: "",
      agama: "",
      status_dalam_keluarga: "",
      kewarganegaraan: "",
      file_path: "",
      foto: null,
    });
    setEditMode(false);
    setEditingSiswa(null);
  };

  const confirmDeleteSiswa = (siswa) => {
    setSiswaToDelete(siswa);
    setShowDeleteModal(true);
  };

  const [loadingDelete, setLoadingDelete] = useState(false);

  const deleteSiswa = async () => {
    if (!siswaToDelete) return;

    setLoadingDelete(true); // Mulai loading

    try {
      const res = await fetch(`/api/siswa?id=${siswaToDelete.id_siswa}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Gagal menghapus siswa");

      // Update UI
      setDataSiswa((prev) =>
        prev.filter((siswa) => siswa.id_siswa !== siswaToDelete.id_siswa)
      );

      showNotification("success", "Berhasil", "Siswa berhasil dihapus!");
    } catch (error) {
      showNotification(
        "error",
        "Error",
        error.message || "Terjadi kesalahan saat menghapus siswa"
      );
      console.error("Delete error:", error);
    } finally {
      setLoadingDelete(false); // Selesai loading
      setShowDeleteModal(false);
      setSiswaToDelete(null);
    }
  };

  // Data yang sudah difilter dan disort
  const filteredSiswa = dataSiswa
    .filter((siswa) =>
      (siswa.nama_lengkap + siswa.nisn)
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return (a[sortBy] || "")
          .toString()
          .localeCompare((b[sortBy] || "").toString());
      } else {
        return (b[sortBy] || "")
          .toString()
          .localeCompare((a[sortBy] || "").toString());
      }
    });

  // Pagination logic
  const totalPages = Math.ceil(filteredSiswa.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSiswa = filteredSiswa.slice(startIndex, endIndex);

  // Pagination functions
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

  const handleExportExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Siswa");
      worksheet.addRow([
        "Nama Lengkap",
        "NISN",
        "Alamat",
        "Kelas",
        "Jenis Kelamin",
        "Nama Panggilan",
        "Tempat Lahir",
        "Tanggal Lahir",
        "Anak Ke",
        "Jumlah Saudara",
        "Agama",
        "Status Dalam Keluarga",
        "Kewarganegaraan",
        "URL Foto",
      ]);

      filteredSiswa.forEach((siswa) => {
        worksheet.addRow([
          siswa.nama_lengkap,
          siswa.nisn,
          siswa.alamat,
          siswa.kelas,
          siswa.jenis_kelamin,
          siswa.nama_panggilan,
          siswa.tempat_lahir,
          siswa.tanggal_lahir,
          siswa.anak_ke,
          siswa.jumlah_saudara,
          siswa.agama,
          siswa.status_dalam_keluarga,
          siswa.kewarganegaraan,
          siswa.file_path,
        ]);
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(blob, "data-siswa.xlsx");
      showNotification(
        "success",
        "Berhasil",
        "Data siswa berhasil diekspor ke Excel!"
      );
    } catch (error) {
      showNotification("error", "Error", "Gagal mengekspor data ke Excel");
      console.error(error);
    }
  };

  // Notification Component
  const NotificationPopup = () => {
    if (!notification.show) return null;

    const getIcon = () => {
      switch (notification.type) {
        case "success":
          return (
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          );
        case "error":
          return <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />;
        case "warning":
          return (
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          );
        default:
          return (
            <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
          );
      }
    };

    const getBgColor = () => {
      switch (notification.type) {
        case "success":
          return "bg-green-50 border-green-200 shadow-green-100";
        case "error":
          return "bg-red-50 border-red-200 shadow-red-100";
        case "warning":
          return "bg-yellow-50 border-yellow-200 shadow-yellow-100";
        default:
          return "bg-blue-50 border-blue-200 shadow-blue-100";
      }
    };

    return (
      <div className="fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out transform">
        <div
          className={`${getBgColor()} border rounded-lg shadow-lg p-4 max-w-sm min-w-72 backdrop-blur-sm`}
        >
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 text-sm">
                {notification.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1 break-words">
                {notification.message}
              </p>
            </div>
            <button
              onClick={closeNotification}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 flex-shrink-0"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full p-2 md:p-8 bg-gray-50">
      {/* Notification Popup */}
      <NotificationPopup />
      <div className="flex-grow">
        <div className="flex flex-col pl-6 pt-6 sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
            Halaman Siswa
          </h1>
        </div>

        <div className="flex flex-col pl-6 sm:flex-row sm:items-center gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama "
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm md:text-lg border border-gray-300 rounded-lg w-full sm:w-80 shadow-sm bg-white focus:ring-2"
            />
          </div>
        </div>

        <div className="overflow-x-auto ml-6 rounded-md bg-white shadow mt-10">
          <table className="min-w-full text-sm md:text-lg text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th
                  className="px-6 py-4 cursor-pointer min-w-[120px] hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    if (sortBy === "nama_lengkap") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("nama_lengkap");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Nama{" "}
                  {sortBy === "nama_lengkap"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">NISN</th>
                <th className="px-6 py-4">Alamat</th>
                <th
                  className="px-6 py-4 cursor-pointer hover:bg-blue-50 transition-colors"
                  onClick={() => {
                    if (sortBy === "kelas") {
                      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    } else {
                      setSortBy("kelas");
                      setSortOrder("asc");
                    }
                  }}
                >
                  Kelas{" "}
                  {sortBy === "kelas" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-4">Jenis Kelamin</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSiswa.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    {search
                      ? "Tidak ada data yang cocok dengan pencarian."
                      : "Belum ada data siswa."}
                  </td>
                </tr>
              ) : (
                paginatedSiswa.map((siswa, i) => (
                  <tr
                    key={siswa.id_siswa || i}
                    className={`${i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"
                      } hover:bg-blue-50 transition-colors`}
                    onClick={() => handleShowDetail(siswa)}
                    title="Klik untuk melihat detail lengkap"
                  >
                    <td className="px-6 py-4 font-medium cursor-pointer hover:underline">
                      {siswa.nama_lengkap}
                    </td>
                    <td className="px-6 py-4">
                      {siswa.file_path ? (
                        <img
                          src={siswa.file_path}
                          alt={siswa.nama_lengkap}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(siswa.nama_lengkap) +
                              "&background=0D8ABC&color=fff";
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-medium">
                          {siswa.nama_lengkap?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{siswa.nisn}</td>
                    <td className="px-6 py-4">{siswa.alamat || "-"}</td>
                    <td className="px-6 py-4">{siswa.kelas || "-"}</td>
                    <td className="px-6 py-4">{siswa.jenis_kelamin || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSiswa(siswa);
                          }}
                          className="text-green-600 hover:text-green-800 transition-colors p-1 rounded hover:bg-green-100"
                          title="Edit data"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDeleteSiswa(siswa);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-100"
                          title="Hapus data"
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
      </div>

      {/* Pagination dan Tombol Aksi */}
      <div className="mt-6 flex justify-between items-center w-full px-6 pr-0">
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
          <div className="text-sm text-gray-600"></div>
        )}

        {/* Tombol Ekspor + Tambahkan Siswa di kanan */}
        <div className="flex items-center gap-2">
          <button
            className="text-green-600 text-2xl hover:text-green-800 p-2 rounded hover:bg-green-100 transition-colors"
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
            Tambahkan Siswa
          </button>
        </div>
      </div>

      {/* Modal Detail Guru */}
      {showDetailModal && selectedSiswa && (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Detail Siswa</h3>
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
                  selectedSiswa.file_path ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedSiswa.nama_lengkap
                  )}&background=0D8ABC&color=fff&size=150`
                }
                alt={selectedSiswa.nama_lengkap}
                className="w-32 h-32 rounded-full object-cover mb-4 shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedSiswa.nama_lengkap
                  )}&background=0D8ABC&color=fff&size=150`;
                }}
              />
              <h4 className="text-xl font-semibold text-gray-800">
                {selectedSiswa.nama_lengkap}
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">
                  Informasi Personal
                </h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Nama Lengkap:</span>
                    <p className="font-medium">{selectedSiswa.nama_lengkap}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Nama Panggilan:
                    </span>
                    <p className="font-medium">
                      {selectedSiswa.nama_panggilan}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Nisn:</span>
                    <p className="font-medium">{selectedSiswa.nisn}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Kelas:</span>
                    <p className="font-medium">{selectedSiswa.kelas}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Jenis Kelamin:
                    </span>
                    <p className="font-medium">{selectedSiswa.jenis_kelamin}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Alamat :</span>
                    <p className="font-medium">{selectedSiswa.alamat}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h5 className="font-semibold text-gray-700 mb-2">
                  Informasi Tambahan
                </h5>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Tempat Lahir:</span>
                    <p className="font-medium">{selectedSiswa.tempat_lahir}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Tanggal Lahir:
                    </span>
                    <p className="font-medium">
                      {formatTanggal(selectedSiswa.tanggal_lahir)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Anak ke:</span>
                    <p className="font-medium">{selectedSiswa.anak_ke}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Jumlah Saudara:
                    </span>
                    <p className="font-medium">
                      {selectedSiswa.jumlah_saudara}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Agama:</span>
                    <p className="font-medium">{selectedSiswa.agama}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">
                      Kewarganegaraan:
                    </span>
                    <p className="font-medium">
                      {selectedSiswa.kewarganegaraan}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditSiswa(selectedSiswa);
                }}
                className="px-6 py-2 bg-btn text-white rounded-lg flex items-center gap-2"
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-30 flex justify-center items-center px-2 md:px-4  md:pl-64">
          <div className="bg-white max-w-6xl w-full rounded-xl shadow-xl border border-gray-200 p-8 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              {editMode ? "Edit Siswa" : "Tambah Siswa"}
            </h2>


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Nama Lengkap*
                </span>
                <input
                  type="text"
                  value={form.nama_lengkap}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama_lengkap: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">NISN*</span>
                <input
                  type="text"
                  value={form.nisn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nisn: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">Alamat</span>
                <input
                  type="text"
                  value={form.alamat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, alamat: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">Kelas</span>
                <input
                  type="text"
                  value={form.kelas}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kelas: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Jenis Kelamin
                </span>
                <select
                  value={form.jenis_kelamin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jenis_kelamin: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Nama Panggilan
                </span>
                <input
                  type="text"
                  value={form.nama_panggilan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama_panggilan: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Tempat Lahir
                </span>
                <input
                  type="text"
                  value={form.tempat_lahir}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tempat_lahir: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Tanggal Lahir
                </span>
                <input
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tanggal_lahir: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">Anak Ke</span>
                <input
                  type="number"
                  min={1}
                  value={form.anak_ke}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, anak_ke: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Jumlah Saudara
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.jumlah_saudara}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jumlah_saudara: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">Agama</span>
                <input
                  type="text"
                  value={form.agama}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, agama: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Status Dalam Keluarga
                </span>
                <input
                  type="text"
                  value={form.status_dalam_keluarga}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status_dalam_keluarga: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium mb-1 block">
                  Kewarganegaraan
                </span>
                <input
                  type="text"
                  value={form.kewarganegaraan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kewarganegaraan: e.target.value }))
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </label>

              {/* Opsi Upload Foto */}
              <div className="col-span-full">
                <label className="text-sm font-medium block mb-2">
                  Foto Profil
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                    <label className="flex-1">
                      <span className="text-sm block mb-1">Upload File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            foto: e.target.files[0],
                            file_path: "", // Clear URL jika upload file
                          }))
                        }
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                    <span className="self-auto md:self-end pb-2 text-gray-500">atau</span>
                    <label className="flex-1">
                      <span className="text-sm">URL Gambar</span>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={form.file_path}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            file_path: e.target.value,
                            foto: null,
                          }))
                        }
                        className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </label>
                  </div>

                  {/* Preview */}
                  {(form.foto || form.file_path) && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded border">
                      <img
                        src={
                          form.foto
                            ? URL.createObjectURL(form.foto)
                            : form.file_path
                        }
                        alt="Preview"
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                        onError={(e) => {
                          e.target.src =
                            "https://ui-avatars.com/api/?name=Preview&background=0D8ABC&color=fff";
                        }}
                      />
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 font-medium block">
                          {form.foto ? form.foto.name : "URL Gambar"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {form.foto
                            ? `${(form.foto.size / 1024).toFixed(1)} KB`
                            : "Eksternal"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, foto: null, file_path: "" }))
                        }
                        className="text-red-500 text-sm hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-row sm:flex-row justify-center sm:justify-end gap-3 ">
              <button
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors shadow-md"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Batal
              </button>
              <button
                className="px-6 py-2 bg-btn text-white rounded transition-colors shadow-md hover:shadow-lg disabled:bg-blue-400 disabled:cursor-not-allowed"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {editMode ? "Memperbarui..." : "Menyimpan..."}
                  </div>
                ) : editMode ? (
                  "Perbarui"
                ) : (
                  "Simpan"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && siswaToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Konfirmasi Hapus Siswa
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700">
                  Apakah Anda yakin ingin menghapus data siswa{" "}
                  <span className="font-semibold text-red-700">
                    {siswaToDelete.nama_lengkap}
                  </span>
                  ?
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Data siswa akan dihapus secara permanen dari sistem.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSiswaToDelete(null);
                  }}
                  disabled={loadingDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={deleteSiswa}
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
                      <XCircle className="w-4 h-4" />
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
