import {
    LayoutDashboard,
    Users,
    GraduationCap,
    CalendarCheck2,
    MessageSquareText,
    ClipboardList,
    User2
  } from 'lucide-react';
  
  export const Navlink = [
    { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { title: 'Guru', href: '/guru', icon: <Users size={20} /> },
    { title: 'Siswa', href: '/siswa', icon: <GraduationCap size={20} /> },
    { title: 'Kegiatan', href: '/kegiatan', icon: <CalendarCheck2 size={20} /> },
    { title: 'Testimoni', href: '/testimoni', icon: <MessageSquareText size={20} /> },
    { title: 'Pendaftar', href: '/pendaftar', icon: <ClipboardList size={20} /> },
    { title: 'DaftarPengguna', href: '/pengguna', icon: <User2 size={20} /> },
  ];
  