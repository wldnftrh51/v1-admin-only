"use client";
import { useState } from "react";
import { FaFileExcel } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Trash2} from "lucide-react";


export default function HalamanSiswa() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc");
  const dataSiswa = [
    {
      nama: "Selwin Saputra, S.Pd.,Gr",
      nisn: "1O23",
      alamat: "-",
      ttl: "-",
      kelas: "A",
      jenisKelamin: "Cowok Cewek",
      foto: "https://ui-avatars.com/api/?name=Rahmi+Annisa&background=0D8ABC&color=fff",
    },
    {
      nama: "Wildan Hasanah Fitrah, S.Pd.I",
      nisn: "2O34",
      alamat: "-",
      kelas: "B",
      jenisKelamin: "-",
      foto: "https://ui-avatars.com/api/?name=Ihwana&background=0D8ABC&color=fff",
    },
    {
      nama: "Yudisthira, S.Pd.I",
      nisn: "3O45",
      alamat: "-",
      kelas: "A",
      jenisKelamin: "Tidak Ingin Memberitahu",
      foto: "https://ui-avatars.com/api/?name=Megawati&background=0D8ABC&color=fff",
    },
    {
      nama: "Surya Miftahul, S.Pd",
      nisn: "4O56",
      alamat: "-",
      kelas: "B",
      jenisKelamin: "Netral",
      foto: "https://ui-avatars.com/api/?name=Jumriana&background=0D8ABC&color=fff",
    },
  ];

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Siswa");
    worksheet.addRow(["nama", "nisn", "alamat", "kelas", "jenisKelamin"]);

    dataSiswa.forEach((siswa) => {
      worksheet.addRow([
        siswa.nama,
        siswa.nisn,
        siswa.alamat,
        siswa.kelas,
        siswa.jenisKelamin,
      ]);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "data-siswa.xlsx");
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

        const worksheet =
          workbook.getWorksheet("Siswa") || workbook.worksheets[0];
        const importedData = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // skip header
          const [nama, nisn, alamat, kelas, jenisKelamin] = row.values.slice(1);
          importedData.push({ nama, nisn, alamat, kelas, jenisKelamin });
        });

        setDataSiswa((prev) => [...prev, ...importedData]);
      }
    };

    fileInput.click();
  };

  const filteredSiswa = dataSiswa
    .filter((siswa) =>
      (siswa.nama + siswa.nisn).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortBy]?.localeCompare(b[sortBy] || "");
      } else {
        return b[sortBy]?.localeCompare(a[sortBy] || "");
      }
    });

  const [form, setForm] = useState({
    name: "",
    nisn: "",
    alamat: "",
    kelas: "",
    jenisKelamin: "",
  });

  const handleSubmit = () => {
    setDataSiswa([...dataSiswa, { ...form, foto: fotoURL }]);
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
                {/* <th className="px-6 py-4">Nama</th> */}
                <th className="px-6 py-4">Nisn</th>
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
                {/* <th className="px-6 py-4">Kelas</th> */}
                <th className="px-6 py-4">Jenis Kelamin</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.map((siswa, i) => (
                <tr
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={siswa.foto}
                        alt={siswa.nama}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{siswa.nama}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{siswa.nisn}</td>
                  <td className="px-6 py-4">{siswa.alamat}</td>
                  <td className="px-6 py-4">{siswa.kelas}</td>
                  <td className="px-6 py-4">{siswa.jenisKelamin}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteTestimoni(siswa)}
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
            Tambahkan Siswa
          </button>
        </div>

      {/* MODAL */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-gray-200 p-10">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
              Tambahkan Siswa
            </h1>

            <div className="mb-8">
              <button
                className="text-lg text-gray-700 hover:text-gray-900 border-b-2 border-gray-800 pb-1 flex items-center gap-2"
                onClick={handleImportExcel}
              >
                <FaFileExcel className="text-xl" /> Import Excel
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Nama"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="NISN"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.nisn}
                onChange={(e) => setForm({ ...form, nisn: e.target.value })}
              />
              <input
                type="text"
                placeholder="Alamat"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
              />
              <input
                type="text"
                placeholder="Kelas"
                className="border border-gray-300 rounded-md px-3 py-2 w-full"
                value={form.kelas}
                onChange={(e) => setForm({ ...form, kelas: e.target.value })}
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
            </div>

            <div className="flex justify-end">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium text-sm md:text-lg px-6 py-2 rounded-md mr-4"
                onClick={handleSubmit}
              >
                Add Student
              </button>
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium text-sm md: px-6 py-2 rounded-md"
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
