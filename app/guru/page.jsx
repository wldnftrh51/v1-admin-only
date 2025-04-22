import Sidebar from "@/component/sidebar/Sidebar";
import HalamanGuru from "@/features/guru/Guru";

export default function GuruPage(){
    return(
        <div className="flex">
            <Sidebar />
            <HalamanGuru />
           
        </div>
    )
}