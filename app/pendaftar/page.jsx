import Sidebar from "@/component/sidebar/Sidebar";
import HalamanPendaftar from "@/features/pendaftar/Pendaftar";
export default function PendaftarPage(){
    return(
        <div className="flex">
            <Sidebar />
            <HalamanPendaftar />
           
        </div>
    )
}