"use client";
import { useState, useEffect } from "react";
import { FaFileExcel } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Trash2 } from "lucide-react";

export default function HalamanGuru() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dataGuru, setDataGuru] = useState([]);
  const [loading, setLoading] = useState(false);

  const [guruToDelete, setGuruToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    jabatan: "",
    nip: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    foto: null,
  });

  const fetchDataGuru = () => {
    fetch("/api/guru")
      .then((res) => res.json())
      .then((data) => setDataGuru(data))
      .catch((err) => console.error("Failed to fetch guru:", err));
  };

  useEffect(() => {
    fetchDataGuru();
  }, []);

  const handleExportExcel = async () => {
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

    filteredGuru.slice(0, 6).forEach((guru) => {
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
      alert("Mohon isi semua kolom!");
      return;
    }

    setLoading(true);
    let fotoURL = null;

    // Upload foto jika ada
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
        alert("Gagal mengunggah foto: " + err.message);
        setLoading(false);
        return;
      }
    }

    // Insert data guru
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
      const res = await fetch("/api/guru", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Gagal menambahkan guru");
      }

      const newGuru = await res.json();

      setDataGuru((prev) => [newGuru, ...prev]);
      setForm({
        nama: "",
        jabatan: "",
        nip: "",
        tempatLahir: "",
        tanggalLahir: "",
        jenisKelamin: "",
        foto: null,
      });
      setShowModal(false);
      alert("Guru berhasil ditambahkan!");
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteGuru = (guru) => {
    setGuruToDelete(guru);
    setShowDeleteModal(true);
  };

  const deleteGuru = async () => {
    if (!guruToDelete) return;

    try {
      const res = await fetch(
        `/api/guru?id=${guruToDelete.id || guruToDelete.id_guru}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Gagal menghapus guru");
      alert("Guru berhasil dihapus");
      fetchDataGuru();
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat menghapus guru");
    } finally {
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full relative">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Halaman Guru</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau jabatan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 text-lg border rounded-md w-full sm:w-100 shadow-sm bg-white"
          />
        </div>

        <div className="overflow-x-auto rounded-md bg-white shadow mt-10 w-full">
          <table className="w-full text-lg text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-6 py-4">Foto</th>
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
              {filteredGuru.slice(0, 6).map((guru, i) => (
                <tr
                  key={guru.id || guru.id_guru || i}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"}
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
                  <td className="px-6 py-4">{guru.tanggal_lahir}</td>
                  <td className="px-6 py-4">{guru.jenis_kelamin}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => confirmDeleteGuru(guru)}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus data"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            className="text-green-600 text-2xl hover:text-green-800"
            onClick={handleExportExcel}
            title="Ekspor ke Excel"
          >
            <FaFileExcel />
          </button>
          <button
            className="px-4 py-2 bg-btn text-white text-lg rounded"
            onClick={() => setShowModal(true)}
          >
            Tambahkan Guru
          </button>
        </div>
      </div>

      {/* Modal Tambah Guru */}
      {showModal && (
        <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full shadow-2xl mx-4">
            <h3 className="text-2xl font-semibold mb-8 text-center text-gray-800">
              Tambah Guru Baru
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
                  setForm({
                    nama: "",
                    jabatan: "",
                    nip: "",
                    tempatLahir: "",
                    tanggalLahir: "",
                    jenisKelamin: "",
                    foto: null,
                  });
                }}
                className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
                disabled={loading}
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-800 text-white rounded hover:bg-green-600 disabled:bg-green-400"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed inset-0  bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-md p-6 max-w-sm w-full shadow-lg mx-4">
            <h3 className="text-xl font-semibold mb-4 text-center text-red-600">
              Konfirmasi Hapus
            </h3>
            <p className="mb-6 text-center">
              Apakah Anda yakin ingin menghapus guru{" "}
              <strong>{guruToDelete?.nama}</strong>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Batal
              </button>
              <button
                onClick={deleteGuru}
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
