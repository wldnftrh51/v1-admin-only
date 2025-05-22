import React from 'react';
import { Trash2} from "lucide-react";

const dataPengguna = [
    { nama: 'Johndoe', username: 'Doe', email: 'Johndoe@gmail.com', password: '********' },
    { nama: 'doejohn', username: 'John', email: 'doejohn@gmail.com', password: '********' },
];

export default function HalamanDaftarPengguna() {
    return (
        <div className=" items-center justify-center min-h-screen w-full p-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left w-full sm:w-auto">
                    Halaman Pendaftar
                </h1>
            </div>

            <div className="overflow-x-auto bg-black rounded-lg shadow mt-15">
                <table className="min-w-full text-sm md:text-lg text-left">
                    <thead className="bg-white text-gray-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Nama</th>
                            <th className="px-6 py-4 font-semibold">Username</th>
                            <th className="px-6 py-4 font-semibold">Email</th>
                            <th className="px-6 py-4 font-semibold">Password</th>
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
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => deleteTestimoni(item)}
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

            <div className="flex justify-end mt-6">
                <button className="bg-btn text-white font-semibold py-2 px-4 rounded shadow text-sm md:text-lg">
                    Tambah Pengguna
                </button>
            </div>
        </div>
    );
}
