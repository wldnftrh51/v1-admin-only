import Sidebar from "@/component/sidebar/Sidebar";
import HalamanTestimoni from "@/features/testimoni/testimoni";
export default function TestimoniPage(){
    return(
        <div className="flex">
            <Sidebar />
            <HalamanTestimoni />
           
        </div>
    )
}