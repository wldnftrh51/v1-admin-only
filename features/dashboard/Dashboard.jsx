import { User2, GraduationCap, School } from "lucide-react";
export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-10">
        Welcome to Admin Dashboard TK AZIZAH 2
      </h1>

      <div className="bg-white p-8 rounded-xl shadow-md space-y-6 max-w-3xl w-full">
        <CardItem
          icon={<User2 className="icon-color w-6 h-6 " />}
          title="Add other admins"
          desc="Create rich course content and coaching products for your students. When you give them a pricing plan, they'll appear on your site!"
        />
        <CardItem
          icon={<School className="icom-color w-6 h-6" />}
          title="Add Teachers"
          desc="Create rich course content and coaching products for your students. When you give them a pricing plan, they'll appear on your site!"
        />
        <CardItem
          icon={<GraduationCap className="icom-color w-6 h-6" />}
          title="Add students"
          desc="Create rich course content and coaching products for your students. When you give them a pricing plan, they'll appear on your site!"
        />
      </div>
    </div>
  );
}

function CardItem({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-4 mb-10">
      <div className="bg-indigo-100 p-2 rounded-xl">{icon}</div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600">{desc}</p>
      </div>
    </div>
  )
}
