"use client";

import { useState, useEffect } from "react";
import { Trash2, ChevronDown, CheckCircle2, XCircle } from "lucide-react";

export default function HalamanTestimoni() {
  const [search, setSearch] = useState("");
  const [testimoniData, setTestimoniData] = useState([]);
  const [sortBy, setSortBy] = useState("nama");
  const [sortOrder, setSortOrder] = useState("asc"); 

  // Ambil data dari API ketika pertama kali komponen dimuat
  useEffect(() => {
    const fetchTestimoni = async () => {
      try {
        const response = await fetch("/api/testimoni");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setTestimoniData(data);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchTestimoni();
  }, []);

  // Toggle status tampilkan
  const toggleTampilkan = async (id_testimoni) => {
    const updatedData = testimoniData.map((item) =>
      item.id_testimoni === id_testimoni
        ? { ...item, tampilkan: !item.tampilkan }
        : item
    );
    setTestimoniData(updatedData);

    // Kirim perubahan status tampilkan ke API
    const toggledItem = updatedData.find(
      (item) => item.id_testimoni === id_testimoni
    );

    await fetch("/api/testimoni", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_testimoni, tampilkan: toggledItem.tampilkan }),
    });
  };

  // Menghapus testimoni
  const deleteTestimoni = async (id_testimoni) => {
    const updatedData = testimoniData.filter(
      (item) => item.id_testimoni !== id_testimoni
    );
    setTestimoniData(updatedData);

    // Kirim request delete ke API
    await fetch("/api/testimoni", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id_testimoni }),
    });
  };

  const sortedTestimoni = [...testimoniData].sort((a, b) => {
    if (sortBy === "nama") {
      return sortOrder === "asc"
        ? a.nama.localeCompare(b.nama)
        : b.nama.localeCompare(a.nama);
    } else if (sortBy === "tampilkan") {
      return sortOrder === "asc"
        ? (b.tampilkan === true) - (a.tampilkan === true)
        : (a.tampilkan === true) - (b.tampilkan === true);
    }
    return 0;
  });

  const filteredTestimoni = sortedTestimoni.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase())
  );

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
//       <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-bold text-gray-800">
//             Halaman Testimoni
//           </h1>
//           <button className="text-lg text-gray-600 hover:underline font-semibold">
//             Log out
//           </button>
//         </div>

//         <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
//           <input
//             type="text"
//             placeholder="Cari berdasarkan nama"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="px-4 py-2 text-lg border rounded-md w-full sm:w-80 shadow-sm bg-white"
//           />
//         </div>

//         <div className="overflow-x-auto rounded-md bg-white shadow mt-10">
//           <table className="w-full table-fixed text-lg text-left">
//             <thead className="bg-[#F3F6FD] text-gray-700">
//               <tr>
//                 <th
//                   className="w-[110px] px-6 py-4 cursor-pointer"
//                   onClick={() => {
//                     if (sortBy === "nama") {
//                       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//                     } else {
//                       setSortBy("nama");
//                       setSortOrder("asc");
//                     }
//                   }}
//                 >
//                   Nama{" "}
//                   {sortBy === "nama" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
//                 </th>
//                 <th className="w-[110px] px-6 py-4">No. Telp</th>
//                 <th className="w-[300px] px-6 py-4">Isi Pesan</th>
//                 <th
//                   className="w-[100px] px-6 py-4 cursor-pointer"
//                   onClick={() => {
//                     if (sortBy === "tampilkan") {
//                       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//                     } else {
//                       setSortBy("tampilkan");
//                       setSortOrder("asc");
//                     }
//                   }}
//                 >
//                   Tampilkan{" "}
//                   {sortBy === "tampilkan"
//                     ? sortOrder === "asc"
//                       ? "↑"
//                       : "↓"
//                     : ""}
//                 </th>
//                 <th className="w-[80px] px-6 py-4">Aksi</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredTestimoni.map((item) => (
//                 <tr
//                   key={item.id_testimoni}
//                   className={
//                     item.id_testimoni % 2 === 0 ? "bg-white" : "bg-[#F9FBFF]"
//                   }
//                 >
//                   <td className="w-[180px] px-6 py-4 text-gray-800">
//                     {item.nama}
//                   </td>
//                   <td className="w-[110px] px-6 py-4 text-gray-800">
//                     {item.no_telpon}
//                   </td>
//                   <td className="w-[300px] px-6 py-4 text-gray-800">
//                     {item.isi_pesan}
//                   </td>
//                   <td className="px-6 py-4 min-w-[130px]">
//                     <button
//                       onClick={() => toggleTampilkan(item.id_testimoni)}
//                       className="flex items-center gap-1 text-lg font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition"
//                     >
//                       {item.tampilkan ? (
//                         <>
//                           <CheckCircle2 className="text-green-600 " size={18} />
//                           <span className="text-green-700 inline-block w-[45px]">
//                             YA
//                           </span>
//                         </>
//                       ) : (
//                         <>
//                           <XCircle className="text-red-600" size={18} />
//                           <span className="text-red-700 inline-block w-[45px]">
//                             TIDAK
//                           </span>
//                         </>
//                       )}
//                       <ChevronDown className="text-gray-500 ml-1" size={14} />
//                     </button>
//                   </td>
//                   <td className="px-4 py-3">
//                     <button
//                       onClick={() => deleteTestimoni(item.id_testimoni)}
//                       className="text-red-600 hover:text-red-800"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-8 bg-gray-50">
      <div className="flex-1 p-4 sm:p-6 bg-[#F5F6FA] min-h-screen w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">Halaman Testimoni</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
          <button className="px-4 py-2 text-sm border rounded-md text-gray-700 bg-white shadow-sm hover:bg-gray-100">
            Add filter
          </button>
          <input
            type="text"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 text-sm border rounded-md w-full sm:w-80 shadow-sm"
          />
        </div>

        <div className="block sm:hidden mt-6 space-y-4">
          {filteredTestimoni.map((item) => (
            <div
              key={item.id_testimoni}
              className="bg-white rounded-md shadow border border-gray-200 p-4"
            >
              <p className="text-base font-semibold text-gray-800">{item.nama}</p>
              <p className="text-sm text-gray-700">Telepon: {item.no_telepon}</p>
              <p className="text-sm text-gray-700 mt-1">Pesan: {item.isi_pesan}</p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => toggleTampilkan(item.id_testimoni)}
                  className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                >
                  {item.tampilkan ? (
                    <>
                      <CheckCircle2 className="text-green-600" size={18} />
                      <span className="text-green-700">YA</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={18} />
                      <span className="text-red-700">TIDAK</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => deleteTestimoni(item.id_testimoni)}
                  className="text-red-600 hover:text-red-800 ml-auto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto rounded-md bg-white shadow mt-10 hidden sm:block">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-[#F3F6FD] text-gray-700">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-4 py-3">No. Telp</th>
                <th className="px-7 py-3 text-center">Isi Pesan</th>
                <th className="px-3 py-3">Tampilkan</th>
                <th className="px-3 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTestimoni.map((item) => (
                <tr key={item.id_testimoni} className={item.id_testimoni % 2 === 0 ? 'bg-white' : 'bg-[#F9FBFF]'}>
                  <td className="px-6 py-5 text-gray-800">{item.nama}</td>
                  <td className="px-4 py-5 text-gray-800">{item.no_telepon}</td>
                  <td className="px-7 py-5 text-gray-800">{item.isi_pesan}</td>
                  <td className="px-3 py-5 min-w-[130px]">
                    <button
                      onClick={() => toggleTampilkan(item.id_testimoni)}
                      className="flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-md hover:bg-gray-100 transition"
                    >
                      {item.tampilkan ? (
                        <>
                          <CheckCircle2 className="text-green-600 " size={18} />
                          <span className="text-green-700 inline-block w-[45px]">YA</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="text-red-600" size={18} />
                          <span className="text-red-700 inline-block w-[45px]">TIDAK</span>
                        </>
                      )}
                      <ChevronDown className="text-gray-500 ml-1" size={14} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteTestimoni(item.id_testimoni)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
