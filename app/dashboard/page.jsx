import Sidebar from "@/component/sidebar/Sidebar";
import DashboardPage from "@/features/dashboard/Dashboard";

export default function PageDashboard(){
    return(
        <div className="flex">
            <Sidebar />
            <DashboardPage />
           
        </div>
    )
}