"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Edit2 } from "lucide-react";

export default function HalamanKegiatan() {
  const [dataKegiatan, setDataKegiatan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    judul: "",
    tanggal: "",
    deskripsi: "",
    foto: null, // Changed to null for file object
    fotoURL: "", // Added for displaying current foto URL
  });
  const [editIndex, setEditIndex] = useState(null);
  const [selectedKegiatan, setSelectedKegiatan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ambil data kegiatan dari API
  useEffect(() => {
    fetch("/api/kegiatan")
      .then((res) => res.json())
      .then((data) => setDataKegiatan(data))
      .catch((err) => console.error("Gagal memuat data:", err));
  }, []);

  const handleSubmit = async () => {
    if (!form.judul || !form.tanggal || !form.deskripsi) {
      alert("Semua field harus diisi!");
      return;
    }

    setLoading(true);
    let fotoURL = form.fotoURL; // Use existing foto URL for edit

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
        alert("Gagal mengunggah foto: " + err.message);
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
        };
        setDataKegiatan(updated);
        alert("Kegiatan berhasil diupdate!");
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
        setDataKegiatan([newData, ...dataKegiatan]);
        alert("Kegiatan berhasil ditambahkan!");
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
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    const kegiatan = dataKegiatan[index];
    setForm({
      judul: kegiatan.judul,
      tanggal: kegiatan.tanggal,
      deskripsi: kegiatan.deskripsi,
      foto: null, // Reset file input
      fotoURL: kegiatan.foto || "", // Keep existing foto URL
    });
    setEditIndex(index);
    setShowModal(true);
  };

  const deleteKegiatan = async () => {
    if (deleteIndex === null || !deleteId) return;

    try {
      const res = await fetch(`/api/kegiatan?id=${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const filtered = dataKegiatan.filter((_, i) => i !== deleteIndex);
        setDataKegiatan(filtered);
        alert("Kegiatan berhasil dihapus!");
      } else {
        alert("Gagal menghapus kegiatan!");
      }
    } catch (error) {
      console.error("Gagal delete:", error);
      alert("Terjadi kesalahan saat menghapus kegiatan");
    } finally {
      setShowDeleteModal(false);
      setDeleteIndex(null);
      setDeleteId(null);
    }
  };

  const handleShowDetail = (kegiatan) => {
    setSelectedKegiatan(kegiatan);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedKegiatan(null);
    setShowDetailModal(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-8 bg-gray-50">
      <div className="flex-1 p-4 sm:p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
            Halaman Kegiatan
          </h1>
        </div>

        <div className="overflow-x-auto rounded-md bg-white shadow mt-15">
          <table className="w-full text-sm md:text-lg text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-6 py-4">Judul</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Deskripsi</th>
                <th className="px-6 py-4">Foto</th>
                <th className="px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataKegiatan.map((kegiatan, i) => (
                <tr
                  key={kegiatan.id_kegiatan}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"}
                >
                  <td
                    className="px-6 py-4 hover:underline cursor-pointer"
                    onClick={() => handleShowDetail(kegiatan)}
                  >
                    {kegiatan.judul}
                  </td>
                  <td className="px-6 py-4">{kegiatan.tanggal}</td>
                  <td className="px-6 py-4">
                    {kegiatan.deskripsi.length > 50
                      ? kegiatan.deskripsi.substring(0, 50) + "..."
                      : kegiatan.deskripsi}
                  </td>
                  <td className="px-6 py-4">
                    {kegiatan.foto ? (
                      <img
                        src={kegiatan.foto}
                        alt={kegiatan.judul}
                        className="w-16 h-16 object-cover rounded cursor-pointer"
                        onClick={() => handleShowDetail(kegiatan)}
                      />
                    ) : (
                      <span className="text-gray-400">Tidak ada foto</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleEdit(i)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteIndex(i);
                        setDeleteId(kegiatan.id_kegiatan);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-btn text-white text-sm md:text-lg rounded"
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
            Tambah Kegiatan
          </button>
        </div>
      </div>

      {/* Modal Detail */}
      {showDetailModal && selectedKegiatan && (
        <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 flex gap-6 relative mx-4">
            <div className="flex flex-col items-center w-1/3">
              {selectedKegiatan.foto ? (
                <img
                  src={selectedKegiatan.foto}
                  alt={selectedKegiatan.judul}
                  className="rounded-md object-cover w-full h-48 mb-4"
                />
              ) : (
                <div className="w-full h-48 mb-4 bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-500">Tidak ada foto</span>
                </div>
              )}
              <h2 className="font-bold text-xl text-center">
                {selectedKegiatan.judul}
              </h2>
            </div>
            <div className="w-2/3">
              <h3 className="text-lg font-semibold mb-2">Deskripsi</h3>
              <p>{selectedKegiatan.deskripsi}</p>
              <p className="mt-4 text-gray-500">
                <strong>Tanggal:</strong> {selectedKegiatan.tanggal}
              </p>
            </div>
            <button
              onClick={closeDetailModal}
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 font-bold text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}

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
