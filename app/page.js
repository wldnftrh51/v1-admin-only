import { defaultOverrides } from "next/dist/server/require-hook";
import Login from "@/features/login/Login"

export default function Home() {
  return (
    <div>
      <Login />
    </div>
  )
}
