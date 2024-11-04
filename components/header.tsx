'use client'

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useUserScore } from "@/context/UserScoreContext";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from 'next-themes';

const Header = () => {
    const { isSignedIn } = useUser();
    const router = useRouter();
    const { resetScore } = useUserScore();
    const { theme } = useTheme();

    return (
      <div className={`w-full h-16 p-4 flex items-center justify-between 
                       
                       `}>
        <p 
          onClick={() => {
            resetScore();
            router.push('/');
          }} 
          className='text-2xl font-bold cursor-pointer'
        >
          Simulei
        </p>
        <div className='flex gap-4'>
          {isSignedIn ? (
            <UserButton />
          ) : (
            <Button 
              size='sm' 
              className="w-24 self-start font-semibold text-lg" 
              onClick={() => router.push('/sign-in')}
            >
              Login
            </Button>
          )}
          <ModeToggle />
        </div>
      </div>
    );
};

export default Header;
