"use client";
import { useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Trash2 } from "lucide-react";


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

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Guru");
    worksheet.addRow(["Nama", "Jabatan", "NIP", "Tempat Tanggal Lahir", "Jenis Kelamin"]);

    dataGuru.forEach((guru) => {
      worksheet.addRow([
        guru.nama,
        guru.jabatan,
        guru.nip,
        guru.ttl,
        guru.jenisKelamin,
      ]);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

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

  const handleImportExcel = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".xlsx, .xls";

    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const workbook = new ExcelJS.Workbook();
        const arrayBuffer = await file.arrayBuffer();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.getWorksheet("Guru") || workbook.worksheets[0];
        const importedData = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // skip header
          const [nama, jabatan, nip, ttl, jenisKelamin] = row.values.slice(1);
          importedData.push({ nama, jabatan, nip, ttl, jenisKelamin });
        });

        setDataGuru((prev) => [...prev, ...importedData]);
      }
    };

    fileInput.click();
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
    <div className=" items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
          Halaman Guru
        </h1>
      </div>


      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Cari berdasarkan nama atau jabatan"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 text-sm md:text-lg border rounded-md w-full sm:w-100 shadow-sm bg-white"
        />
      </div>

      <div className="overflow-x-auto rounded-md bg-white shadow mt-10 w-full">
        <table className="min-w-full text-sm md:text-lg text-left">
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
                <td className="px-4 py-3">
                  <button
                    onClick={() => deleteTestimoni(guru)}
                    className="text-red-600 hover:text-red-800"
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

      {/* MODAL */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-gray-200 p-10">
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
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm md:text-lg px-6 py-2 rounded-md mr-4"
                onClick={handleSubmit}
              >
                Add Teacher
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium text-sm md:text-lg px-6 py-2 rounded-md"
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
