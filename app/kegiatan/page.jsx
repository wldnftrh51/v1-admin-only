import Sidebar from "@/component/sidebar/Sidebar";
import HalamanKegiatan from "@/features/kegiatan/Kegiatan";
export default function KegiatanPage(){
    return(
        <div className="flex">
            <Sidebar />
            <HalamanKegiatan />
           
        </div>
    )
}