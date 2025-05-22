"use client";
import { FaFileExcel } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function HalamanSiswa() {
  const [dataSiswa, setDataSiswa] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [siswaToDelete, setSiswaToDelete] = useState(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("nama_lengkap");
  const [sortOrder, setSortOrder] = useState("asc");

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
    file_path: "", // url foto
    foto: null, // file foto untuk upload
  });

  useEffect(() => {
    fetchSiswaData();
  }, []);

  const fetchSiswaData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/siswa");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setDataSiswa(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = async () => {
    if (!form.nama_lengkap || !form.nisn) {
      alert("Mohon isi nama lengkap dan NISN!");
      return;
    }

    setLoading(true);
    let fotoURL = form.file_path; // Gunakan URL yang sudah ada jika manual input

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
        alert("Gagal mengunggah foto: " + err.message);
        setLoading(false);
        return;
      }
    }

    // Insert data siswa
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
      const res = await fetch("/api/siswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add siswa");

      const newSiswa = await res.json();
      setDataSiswa((prev) => [newSiswa, ...prev]);

      setShowModal(false);
      resetForm();
      alert("Siswa berhasil ditambahkan!");
    } catch (error) {
      alert("Gagal menambahkan siswa");
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
  };

  const confirmDeleteSiswa = (siswa) => {
    setSiswaToDelete(siswa);
    setShowDeleteModal(true);
  };

  const deleteSiswa = async () => {
    if (!siswaToDelete) return;

    try {
      const res = await fetch(`/api/siswa?id=${siswaToDelete.id_siswa}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus siswa");

      alert("Siswa berhasil dihapus");
      fetchSiswaData();
    } catch (error) {
      alert(error.message || "Terjadi kesalahan saat menghapus siswa");
    } finally {
      setShowDeleteModal(false);
      setSiswaToDelete(null);
    }
  };

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

  const handleExportExcel = async () => {
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
  };

  return (
    <div className=" items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
          Halaman Siswa
        </h1>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama "
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm md:text-lg border rounded-md w-full sm:w-100 shadow-sm bg-white"
        />
      </div>

      <div className="overflow-x-auto rounded-md bg-white shadow mt-10">
        <table className="min-w-full text-sm md:text-lg text-left">
          <thead className="bg-[#F3F6FD] text-gray-700">
            <tr>
              <th
                className="px-6 py-4 cursor-pointer"
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
                className="px-6 py-4 cursor-pointer"
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
            {filteredSiswa.map((siswa, i) => (
              <tr
                key={siswa.id_siswa || i}
                className={i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"}
              >
                <td className="px-6 py-4">{siswa.nama_lengkap}</td>
                <td className="px-6 py-4">
                  {siswa.file_path ? (
                    <img
                      src={siswa.file_path}
                      alt={siswa.nama_lengkap}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(siswa.nama_lengkap) +
                          "&background=0D8ABC&color=fff";
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                      ?
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">{siswa.nisn}</td>
                <td className="px-6 py-4">{siswa.alamat}</td>
                <td className="px-6 py-4">{siswa.kelas}</td>
                <td className="px-6 py-4">{siswa.jenis_kelamin}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => confirmDeleteSiswa(siswa)}
                    className="text-red-600 hover:text-red-800"
                    title="Hapus data"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredSiswa.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Tidak ada data ditemukan.
                </td>
              </tr>
            )}
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
          Tambahkan Siswa
        </button>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 z-30 flex justify-center items-center px-4 pl-64">
          <div className="bg-white max-w-6xl w-full rounded-xl shadow-xl border border-gray-200 p-8 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Tambah Siswa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
              <label>
                Nama Lengkap*
                <input
                  type="text"
                  value={form.nama_lengkap}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama_lengkap: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </label>

              <label>
                NISN*
                <input
                  type="text"
                  value={form.nisn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nisn: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </label>

              <label>
                Alamat
                <input
                  type="text"
                  value={form.alamat}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, alamat: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Kelas
                <input
                  type="text"
                  value={form.kelas}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kelas: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Jenis Kelamin
                <select
                  value={form.jenis_kelamin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jenis_kelamin: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Pilih</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </label>

              <label>
                Nama Panggilan
                <input
                  type="text"
                  value={form.nama_panggilan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nama_panggilan: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Tempat Lahir
                <input
                  type="text"
                  value={form.tempat_lahir}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tempat_lahir: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Tanggal Lahir
                <input
                  type="date"
                  value={form.tanggal_lahir}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tanggal_lahir: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Anak Ke
                <input
                  type="number"
                  min={1}
                  value={form.anak_ke}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, anak_ke: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Jumlah Saudara
                <input
                  type="number"
                  min={0}
                  value={form.jumlah_saudara}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jumlah_saudara: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Agama
                <input
                  type="text"
                  value={form.agama}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, agama: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Status Dalam Keluarga
                <input
                  type="text"
                  value={form.status_dalam_keluarga}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status_dalam_keluarga: e.target.value,
                    }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              <label>
                Kewarganegaraan
                <input
                  type="text"
                  value={form.kewarganegaraan}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, kewarganegaraan: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded"
                />
              </label>

              {/* Opsi Upload Foto */}
              <div className="col-span-2">
                <label className="text-sm font-medium block mb-2">
                  Foto Profil
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <label className="flex-1">
                      <span className="text-sm">Upload File</span>
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
                        className="w-full border px-3 py-2 rounded"
                      />
                    </label>
                    <span className="self-end pb-2 text-gray-500">atau</span>
                    <label className="flex-1">
                      <span className="text-sm">URL Gambar</span>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={form.file_path}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            file_path: e.target.value,
                            foto: null,
                          }))
                        }
                        className="w-full border px-3 py-2 rounded"
                      />
                    </label>
                  </div>

                  {/* Preview */}
                  {(form.foto || form.file_path) && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <img
                        src={
                          form.foto
                            ? URL.createObjectURL(form.foto)
                            : form.file_path
                        }
                        alt="Preview"
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://ui-avatars.com/api/?name=Preview&background=0D8ABC&color=fff";
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {form.foto ? form.foto.name : "URL Gambar"}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({ ...f, foto: null, file_path: "" }))
                        }
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Batal
              </button>
              <button
                className="px-6 py-2 bg-green-800 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && siswaToDelete && (
  <div className="fixed inset-0 bg-black/30 z-40 flex items-center justify-center px-4">
    <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full border border-gray-300">
      <h2 className="text-xl font-semibold mb-4 text-center text-red-600">
        Konfirmasi Hapus
      </h2>
      <p className="text-center mb-6">
        Apakah Anda yakin ingin menghapus siswa{" "}
        <span className="font-semibold">{siswaToDelete.nama_lengkap}</span>?
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setShowDeleteModal(false);
            setSiswaToDelete(null);
          }}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
        >
          Batal
        </button>
        <button
          onClick={deleteSiswa}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
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
