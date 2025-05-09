'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Navlink } from './navlink';
import { Images } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen sidebar-color text-white flex flex-col">
      {/* Logo dan Nama Sekolah */}
      <div className="flex flex-col items-center py-6 border-b border-white/20">
        <Image
          src="/images/logo.png"
          alt="Background"
          width={80}
          height={80}
        />
        <h1 className="text-lg font-bold mt-2 text-center">TK AZIZAH 2</h1>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-5 py-4 mt-2">
        {Navlink.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              href={item.href}
              key={index}
              className={`flex items-center gap-3 px-4 py-4 my-1 rounded-md transition-all duration-200
             ${isActive
                  ? 'bg-[#3D8D7A] hover:bg-[#26A69A] text-[#E0F2F1] font-semibold'
                  : 'hover:bg-[#26A69A] text-[#E0F2F1]'
                }
  `}
            >
              {item.icon}
              <span className="text-lg">{item.title}</span>
            </Link>

          );
        })}
      </nav>
    </aside>
  );
}
