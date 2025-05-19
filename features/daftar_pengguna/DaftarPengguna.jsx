import React from 'react';

const dataPengguna = [
    { nama: 'Johndoe', username: 'Doe', email: 'Johndoe@gmail.com', password: '********' },
    { nama: 'doejohn', username: 'John', email: 'doejohn@gmail.com', password: '********' },
];

export default function HalamanDaftarPengguna() {
//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
//             <div className="flex-1 p-6 bg-[#F5F6FA] min-h-screen w-full">
//                 <div className="flex justify-between items-center mb-6">
//                     <h1 className="text-3xl font-bold text-gray-800">Halaman Pengguna</h1>
//                     <button className="text-sm text-gray-600 hover:underline font-semibold">Log out</button>
//                 </div>

//                 <div className="overflow-x-auto bg-black rounded-lg shadow mt-15">
//                     <table className="min-w-full text-sm text-left">
//                         <thead className="bg-white text-gray-700">
//                             <tr>
//                                 <th className="px-6 py-4 font-semibold">Nama</th>
//                                 <th className="px-6 py-4 font-semibold">Username</th>
//                                 <th className="px-6 py-4 font-semibold">Email</th>
//                                 <th className="px-6 py-4 font-semibold">Password</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {dataPengguna.map((item, index) => (
//                                 <tr
//                                     key={index}
//                                     className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
//                                 >
//                                     <td className="px-6 py-4">{item.nama}</td>
//                                     <td className="px-6 py-4">{item.username}</td>
//                                     <td className="px-6 py-4">{item.email}</td>
//                                     <td className="px-6 py-4 underline cursor-pointer">{item.password}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>

//                 <div className="flex justify-end mt-6">
//                     <button className="bg-btn text-white font-semibold py-2 px-4 rounded shadow">
//                         Tambah Pengguna
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }
return (
    <div className="flex flex-col min-h-screen w-full p-4 sm:p-8 bg-gray-50">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
                Halaman Pengguna
            </h1>
        </div>
        {/* Table */}
        <div className="overflow-x-auto rounded-md bg-white shadow mt-6">
            <table className="min-w-full text-sm text-left">
                <thead className="bg-[#F3F6FD] text-gray-700">
                    <tr>
                        <th className="px-4 py-3">Nama</th>
                        <th className="px-4 py-3">Username</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Password</th>
                    </tr>
                </thead>
                <tbody>
                    {dataPengguna.map((item, index) => (
                        <tr
                            key={index}
                            className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                            <td className="px-6 py-4">{item.nama}</td>
                            <td className="px-6 py-4">{item.username}</td>
                            <td className="px-6 py-4">{item.email}</td>
                            <td className="px-6 py-4 underline cursor-pointer">{item.password}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        <div className="flex justify-end mt-6">
            <button className="bg-btn text-white font-semibold py-2 px-4 rounded shadow">
                Tambah Pengguna
            </button>
        </div>
    </div>
);
}
