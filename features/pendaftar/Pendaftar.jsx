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
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";

export default function HalamanPendaftar() {
  const [search, setSearch] = useState("");
  const [dataPendaftar, setDataPendaftar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // You can adjust this value

  // State untuk detail modal
  const [detailModal, setDetailModal] = useState({
    show: false,
    pendaftar: null,
  });

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

    // Auto hide after 4 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  // Function untuk menutup notifikasi
  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, show: false }));
  };

  // Function untuk menampilkan detail modal
  const showDetailModal = (pendaftar) => {
    setDetailModal({ show: true, pendaftar });
  };

  // Function untuk menutup detail modal
  const closeDetailModal = () => {
    setDetailModal({ show: false, pendaftar: null });
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset currentPage to 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // Adjust current page if needed after data changes (e.g., deletion)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1); // Reset to 1 if no data
    }
  }, [dataPendaftar, totalPages, currentPage]);
  // Detail Modal Component
  const DetailModal = () => {
    if (!detailModal.show || !detailModal.pendaftar) return null;

    const item = detailModal.pendaftar;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Detail Pendaftar</h3>
                  <p className="text-blue-100 text-sm">
                    Informasi lengkap data pendaftar
                  </p>
                </div>
              </div>
              <button
                onClick={closeDetailModal}
                className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            {/* Nama Lengkap - Featured */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h4 className="text-2xl font-bold text-gray-800 mb-2">
                {item.nama_lengkap}
              </h4>
              <p className="text-green-600 font-medium">
                ID Siswa: {item.id_siswa}
              </p>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Nama Panggilan
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.nama_panggilan || "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Tempat Lahir
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.tempat_lahir || "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Tanggal Lahir
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.tanggal_lahir
                    ? new Date(item.tanggal_lahir).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Jenis Kelamin
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.jenis_kelamin || "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Agama
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.agama || "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Anak ke
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.anak_ke || "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Jumlah Saudara
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.jumlah_saudara || "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Status Dalam Keluarga
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.status_dalam_keluarga || "-"}
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors md:col-span-2">
                <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Kewarganegaraan
                </span>
                <p className="text-gray-800 mt-2 text-lg">
                  {item.kewarganegaraan || "-"}
                </p>
              </div>
            </div>

            {/* Data Ayah */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Data Ayah
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Nama
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_nama || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Tempat Lahir
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_tempat_lahir || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Tanggal Lahir
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_tanggal_lahir
                      ? new Date(item.ayah_tanggal_lahir).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Agama
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_agama || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Kewarganegaraan
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_kewarganegaraan || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Pekerjaan
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_pekerjaan || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Pendidikan
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_pendidikan || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Status Dalam Keluarga
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ayah_status_dalam_keluarga || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Data Ibu */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Data Ibu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Nama
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_nama || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Tempat Lahir
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_tempat_lahir || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Tanggal Lahir
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_tanggal_lahir
                      ? new Date(item.ibu_tanggal_lahir).toLocaleDateString(
                          "id-ID",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          }
                        )
                      : "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Agama
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_agama || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Kewarganegaraan
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_kewarganegaraan || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Pekerjaan
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_pekerjaan || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Pendidikan
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_pendidikan || "-"}
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100">
                  <span className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
                    Status Dalam Keluarga
                  </span>
                  <p className="text-gray-800 mt-2 text-lg">
                    {item.ibu_status_dalam_keluarga || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* File Upload / Dokumen */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Berkas / Dokumen
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                {(() => {
                  try {
                    let filePaths = [];

                    if (item.file_path) {
                      if (typeof item.file_path === "string") {
                        const trimmed = item.file_path.trim();

                        // Coba parse sebagai JSON array dulu
                        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                          try {
                            const parsed = JSON.parse(trimmed);
                            if (Array.isArray(parsed)) {
                              filePaths = parsed.filter(
                                (path) => path && path.trim().length > 0
                              );
                            } else {
                              throw new Error("Not an array");
                            }
                          } catch (jsonError) {
                            // Jika JSON.parse gagal, fallback ke manual parsing
                            console.warn(
                              "JSON parse failed, using manual parsing:",
                              jsonError
                            );
                            const content = trimmed.slice(1, -1); // Hapus [ dan ]
                            filePaths = content
                              .split(",")
                              .map((path) =>
                                path.trim().replace(/^["']|["']$/g, "")
                              )
                              .filter((path) => path.length > 0);
                          }
                        }
                        // Jika ada koma tapi bukan format array
                        else if (trimmed.includes(",")) {
                          filePaths = trimmed
                            .split(",")
                            .map((path) =>
                              path.trim().replace(/^["']|["']$/g, "")
                            )
                            .filter((path) => path.length > 0);
                        }
                        // Single file path
                        else {
                          filePaths = [trimmed];
                        }
                      }
                      // Jika sudah array
                      else if (Array.isArray(item.file_path)) {
                        filePaths = item.file_path.filter(
                          (path) => path && path.trim().length > 0
                        );
                      }
                      // Fallback untuk tipe data lain
                      else {
                        filePaths = [String(item.file_path)];
                      }
                    }

                    filePaths = filePaths.filter((path) => {
                      const cleanPath = String(path).trim();
                      return (
                        cleanPath.length > 0 &&
                        !cleanPath.match(/^[\[\]"'\s]*$/)
                      );
                    });

                    if (filePaths.length > 0) {
                      return (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-3">
                            Ditemukan {filePaths.length} berkas:
                          </p>
                          {filePaths.map((filePath, index) => {
                            const cleanFilePath = String(filePath).trim();
                            const fileName =
                              cleanFilePath.split("/").pop() ||
                              `File ${index + 1}`;
                            const fileExtension = fileName
                              .split(".")
                              .pop()
                              ?.toLowerCase();
                            const isImage = [
                              "jpg",
                              "jpeg",
                              "png",
                              "gif",
                              "webp",
                              "svg",
                            ].includes(fileExtension || "");

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      isImage ? "bg-blue-100" : "bg-gray-100"
                                    }`}
                                  >
                                    {isImage ? (
                                      <svg
                                        className="w-5 h-5 text-blue-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        className="w-5 h-5 text-gray-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm">
                                      Berkas {index + 1}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {fileExtension?.toUpperCase()} •{" "}
                                      {fileName.length > 30
                                        ? fileName.substring(0, 30) + "..."
                                        : fileName}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <a
                                    href={cleanFilePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                                  >
                                    Buka
                                  </a>

                                  <a
                                    href={cleanFilePath}
                                    download
                                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                  >
                                    Unduh
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-8">
                          <svg
                            className="w-12 h-12 text-gray-300 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-gray-600">
                            Tidak ada berkas tersedia
                          </p>
                        </div>
                      );
                    }
                  } catch (error) {
                    console.error("Error parsing file_path:", error);
                    return (
                      <div className="text-center py-8">
                        <svg
                          className="w-12 h-12 text-red-300 mx-auto mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-red-600">Error memuat berkas</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Format data berkas tidak valid
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-6">
            <div className="flex justify-end">
              <button
                onClick={closeDetailModal}
                className="bg-btn text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Tutup Detail
              </button>
            </div>
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

      {/* Detail Modal */}
      <DetailModal />

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

        <div className="flex-grow">
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
                  <th className="px-6 py-4 font-semibold min-w-[150px]">
                    Nama
                  </th>
                  <th className="px-6 py-4 font-semibold min-w-[120px]">
                    Tempat Lahir
                  </th>
                  <th className="px-6 py-4 font-semibold min-w-[150px]">
                    Tanggal Lahir
                  </th>
                  <th className="px-6 py-4 font-semibold min-w-[120px]">
                    Jenis Kelamin
                  </th>
                  <th className="px-6 py-4 font-semibold min-w-[100px]">
                    Agama
                  </th>
                  <th className="px-6 py-4 font-semibold min-w-[120px]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item, index) => (
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
                            onClick={() => showDetailModal(item)}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                            title="Lihat detail"
                          >
                            <span className="flex items-center gap-1">
                              <Eye size={16} />
                              Detail
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
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
        </div>

        <div className="w-full flex-row flex justify-between items-end mt-6">

          {totalPages > 1 ? (
            <div className="flex items-center gap-2">
              {/* Tombol Previous */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-1 py-3 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Indikator Halaman Saat Ini */}
              <span className="px-3 py-2 border rounded-md font-medium">
                {currentPage}
              </span>

              {/* Tombol Next */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-1 py-3 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div />
          )}

          <button
            onClick={downloadExcel}
            disabled={dataPendaftar.length === 0}
            className="bg-btn text-white font-semibold py-3 px-6 rounded-lg shadow-lg text-sm md:text-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Unduh Excel
          </button>
        </div>
      </div>
    </div>
  );
}
