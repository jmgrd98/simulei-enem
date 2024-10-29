'use client'

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useUserScore } from "@/context/UserScoreContext";

const Header = () => {
    const { isSignedIn } = useUser();
    const router = useRouter();

    const { resetScore } = useUserScore();

    
  return (
    <div className='w-full h-16 p-4 bg-white text-black flex items-center justify-between'>
      <p onClick={() => {
          resetScore();
          router.push('/')
        }} className='text-2xl font-bold cursor-pointer'>Simulei</p>
      {isSignedIn ? <UserButton /> : <Button size={'sm'} className="w-24 self-start font-semibold text-lg" onClick={() => router.push('/sign-in')}>Login</Button>}
    </div>
  )
}

export default Header
