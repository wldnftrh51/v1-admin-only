import Sidebar from "@/component/sidebar/Sidebar";
import HalamanDaftarPengguna from "@/features/daftar_pengguna/DaftarPengguna";
export default function PageDaftarPengguna(){
    return(
        <div className="flex">
            <Sidebar />
            <HalamanDaftarPengguna />
           
        </div>
    )
}