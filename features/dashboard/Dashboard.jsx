import { User2, GraduationCap, School } from "lucide-react";
export default function DashboardPage() {
 return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 sm:p-8 bg-gray-50">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8 sm:mb-10 px-4">
        Welcome to Admin Dashboard TK AZIZAH 2
      </h1>

      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md space-y-6 max-w-full sm:max-w-3xl w-full">
        <CardItem
          icon={<School className="icon-color w-6 h-6" />}
          title="Tambah Guru"
          desc="Tambahkan guru baru untuk memperluas tim pengajar dan tingkatkan kualitas pendidikan di sekolah."
        />
        <CardItem
          icon={<GraduationCap className="icon-color w-6 h-6" />}
          title="Tambah Siswa"
          desc="Tambahkan siswa baru untuk memulai perjalanan pendidikan mereka dan memberikan akses ke materi pembelajaran yang menarik."
        />
        <CardItem
          icon={<User2 className="icon-color w-6 h-6" />}
          title="Tambah Kegiatan"
          desc="Buat kegiatan baru untuk meningkatkan keterlibatan siswa dan memperkaya pengalaman belajar mereka."
        />
      </div>
    </div>
  );
}

function CardItem({ icon, title, desc }) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 mb-6 sm:mb-10 px-4 sm:px-0">
      <div className="bg-indigo-100 p-3 rounded-xl shrink-0">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}

// Todo: Icom dan judul serta deskripsi di bawah icon dan judul (mobile)