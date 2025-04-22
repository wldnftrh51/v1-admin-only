import { defaultOverrides } from "next/dist/server/require-hook";
import Image from "next/image";
import Login from "@/features/login/Login"

export default function Home() {
  return (
    <div>
      <Login />
    </div>
  )
}
