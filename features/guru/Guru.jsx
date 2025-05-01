"use client";
import { useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function HalamanGuru() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dataGuru, setDataGuru] = useState([
    {
      nama: "Selwin Saputra, S.Pd.,Gr",
      jabatan: "Kepala Sekolah",
      nip: "-",
      ttl: "-",
      jenisKelamin: "Cowok Cewek",
      foto: "https://ui-avatars.com/api/?name=Rahmi+Annisa&background=0D8ABC&color=fff",
    },
    {
      nama: "Wildan Hasanah Fitrah, S.Pd.I",
      jabatan: "Guru TK B",
      nip: "-",
      ttl: "-",
      jenisKelamin: "-",
      foto: "https://ui-avatars.com/api/?name=Ihwana&background=0D8ABC&color=fff",
    },
    {
      nama: "Yudisthira, S.Pd.I",
      jabatan: "Guru PAI",
      nip: "-",
      ttl: "-",
      jenisKelamin: "Tidak Ingin Memberitahu",
      foto: "https://ui-avatars.com/api/?name=Megawati&background=0D8ABC&color=fff",
    },
    {
      nama: "Surya Miftahul, S.Pd",
      jabatan: "Guru TK A",
      nip: "-",
      ttl: "-",
      jenisKelamin: "Netral",
      foto: "https://ui-avatars.com/api/?name=Jumriana&background=0D8ABC&color=fff",
    },
  ]);

  const [form, setForm] = useState({
    email: "",
    name: "",
    jabatan: "",
    nip: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "",
    foto: null,
  });

  // const filteredGuru = dataGuru.filter((guru) =>
  //   guru.nama.toLowerCase().includes(search.toLowerCase())
  // );

  // const handleExportExcel = () => {
  //   const header = ['Nama', 'Jabatan', 'NIP', 'Tempat Tanggal Lahir', 'Jenis Kelamin'];
  //   const rows = filteredGuru.map(guru => [
  //     guru.nama, guru.jabatan, guru.nip, guru.ttl, guru.jenisKelamin
  //   ]);
  //   const ExcelContent = [header, ...rows].map(e => e.join(',')).join('\n');
  //   const blob = new Blob([ExcelContent], { type: 'text/Excel;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement('a');
  //   link.href = url;
  //   link.download = 'data-guru.Excel';
  //   link.click();
  // };

  const handleExportExcel = () => {
    const header = [
      "Nama",
      "Jabatan",
      "NIP",
      "Tempat Tanggal Lahir",
      "Jenis Kelamin",
    ];
    const rows = filteredGuru.map((guru) => [
      guru.nama,
      guru.jabatan,
      guru.nip,
      guru.ttl,
      guru.jenisKelamin,
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guru");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "data-guru.xlsx");
  };

  const handleSubmit = () => {
    setDataGuru([...dataGuru, { ...form }]);
    setForm({
      nama: "",
      jabatan: "",
      nip: "",
      ttl: "",
      jenisKelamin: "",
      foto: "",
    });
    setShowModal(false);
  };

  // const handleImportExcel = () => {
  //   // Buat buka file input atau redirect ke logic import Excel
  //   const fileInput = document.createElement("input");
  //   fileInput.type = "file";
  //   fileInput.accept = ".Excel";

  //   fileInput.onchange = (event) => {
  //     const file = event.target.files[0];
  //     if (file) {
  //       // Lanjutkan ke proses parsing
  //       console.log("File Excel dipilih:", file);
  //       // Di sini kamu bisa kirim file ke API atau parse di frontend
  //     }
  //   };

  //   fileInput.click();
  // };

  const handleImportExcel = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .xls";

    fileInput.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log("File Excel dipilih:", file);
        // Process the file here, like parsing it or sending to an API
      }
    };

    fileInput.click(); // Trigger the file input
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
      <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Halaman Guru</h1>
          <button className="text-lg text-gray-600 hover:underline font-semibold">
            Log out
          </button>
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
                  Nama{" "}
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
                  Jabatan{" "}
                  {sortBy === "jabatan"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </th>
                <th className="px-6 py-4">NIP</th>
                <th className="px-6 py-4">Tempat, Tanggal Lahir</th>
                <th className="px-6 py-4">Jenis Kelamin</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuru.map((guru, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={guru.foto}
                        alt={guru.nama}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{guru.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{guru.jabatan}</td>
                  <td className="px-6 py-4">{guru.nip}</td>
                  <td className="px-6 py-4">{guru.ttl}</td>
                  <td className="px-6 py-4">{guru.jenisKelamin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          {/* <button
            className="border border-[#80CBC4] text-[#80CBC4] hover:bg-[#004D40] px-4 py-2 rounded"
            onClick={handleExportExcel}
          >
            Export Excel
          </button> */}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-lg p-10">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              Tambahkan Guru
            </h1>

            <div className="mb-8">
              <button
                className="text-lg text-gray-700 hover:text-gray-900 border-b-2 border-gray-800 pb-1 flex items-center gap-2" // Flex untuk ikon dan teks berdampingan
                onClick={handleImportExcel}
              >
                <FaFileExcel className="text-xl" />{" "}
                {/* Menambahkan ikon Excel */}
                Import Excel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="email"
                placeholder="Email"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                type="text"
                placeholder="Nama"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Jabatan"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.jabatan}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
              />
              <input
                type="text"
                placeholder="NIP"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.nip}
                onChange={(e) => setForm({ ...form, nip: e.target.value })}
              />
              <input
                type="text"
                placeholder="Tempat Lahir"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.tempatLahir}
                onChange={(e) =>
                  setForm({ ...form, tempatLahir: e.target.value })
                }
              />
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.tanggalLahir}
                onChange={(e) =>
                  setForm({ ...form, tanggalLahir: e.target.value })
                }
              />
              <select
                className="border border-gray-300 rounded-md px-3 py-2 w-full text-gray-500"
                value={form.jenisKelamin}
                onChange={(e) =>
                  setForm({ ...form, jenisKelamin: e.target.value })
                }
              >
                <option value="">Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
              <input
                type="file"
                accept="image/*"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                onChange={(e) => setForm({ ...form, foto: e.target.files[0] })}
              />
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-lg px-6 py-2 rounded-md mr-4"
                onClick={handleSubmit}
              >
                Add Teacher
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium text-lg px-6 py-2 rounded-md"
                onClick={() => setShowModal(false)}
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
