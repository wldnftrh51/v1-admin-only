import Sidebar from "@/component/sidebar/Sidebar";
import HalamanSiswa from "@/features/siswa/Siswa";

export default function SiswaPage(){
    return(
        <div className="flex">
            <Sidebar />
            <HalamanSiswa />
           
        </div>
    )
}