'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Navlink } from './navlink';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    // Contoh hapus token/session
    localStorage.removeItem('token'); // sesuaikan dengan cara penyimpanan kamu

    // Redirect ke halaman login
    router.push('/');
  };

  return (
    <>
      {/* Tombol Hamburger (hanya tampil mobile) */}
      {!isOpen && (
        <div className="md:hidden fixed top-0 left-0 p-2 z-50">
          <button onClick={toggleSidebar}>
            <Menu size={24} />
          </button>
        </div>
      )}
      

      {/* Sidebar Utama */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-[#1C3F3F] text-white flex flex-col 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:static md:h-screen
        `}
      >
        {/* Icon silang */}
        {isOpen && (
        <div className="md:hidden fixed top-0 right-0 p-2 z-50">
          <button onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>
      )}
        {/* Logo dan Nama Sekolah */}
        <div className="flex flex-col items-center py-6 border-b border-white/20">
          <Image
            src="https://gwn-bucket.s3.us-east-1.amazonaws.com/images/logoo.png"
            alt="Logo"
            width={80}
            height={80}
          />
          <h1 className="text-sm md:text-lg font-bold mt-2 text-center">TK AZIZAH 2</h1>
        </div>

        {/* Menu Navigasi */}
        <nav className="flex-1 px-5 py-4 mt-2">
          {Navlink.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link
                href={item.href}
                key={index}
                onClick={closeSidebar} // Menutup sidebar saat klik link di HP
                className={`
                  flex items-center gap-3 px-4 py-4 my-1 rounded-md transition-all duration-200
                  ${isActive
                    ? 'bg-[#3D8D7A] hover:bg-[#26A69A] text-[#E0F2F1] font-semibold'
                    : 'hover:bg-[#26A69A] text-[#E0F2F1]'}
                `}
              >
                {item.icon}
                <span className="text-sm md:text-lg">{item.title}</span>
              </Link>
            );
          })}
           {/* Tombol Logout */}
          <button
            onClick={() => {
              closeSidebar();
              handleLogout();
            }}
            className="flex items-center gap-3 px-4 py-4 mt-4 w-full rounded-md hover:bg-[#26A69A] transition-colors duration-200 text-[#E0F2F1]"
            type="button"
          >
            {/* Icon logout, bisa pakai icon lucide-react UserLogout misalnya */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
              />
            </svg>
            <span className="text-sm md:text-lg">Logout</span>
          </button>
        </nav>
      </aside>

      {/* Background blur saat sidebar terbuka di HP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}