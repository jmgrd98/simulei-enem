'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeLeft > 0 && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      alert("Time's up!");
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  const handleLoginClick = () => {
    router.push('/sign-in');
  };

  const handleTimeSelection = (value: string) => {
    const selectedMinutes = Number(value);
    setSelectedTime(selectedMinutes);
  };

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-6xl font-bold mb-10 w-2/3">Gere simulados do ENEM gratuitos e meça seus resultados!</h1>
          {isSignedIn ? <UserButton /> : <Button variant={'secondary'} className="w-24 self-start font-semibold text-lg" size={'xl'} onClick={handleLoginClick}>Login</Button>}
        </div>
        
        <h2 className="w-full text-2xl text-center font-semibold w-full my-2">Selecione o ano da prova e o tempo para gerar um simulado e começar a estudar!</h2>

        <div className="flex flex-col gap-5 items-center mt-20">
          <Select onValueChange={(value) => setSelectedYear(Number(value))} defaultValue={selectedYear.toString()}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(2024 - 2009 + 1)].map((_, i) => {
                const year = 2024 - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <div className="flex gap-5 w-full justify-center items-center">
            {!timeLeft ? (
              <Select onValueChange={handleTimeSelection} value={selectedTime > 0 ? selectedTime.toString() : undefined}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione o tempo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="border rounded px-3 py-2">
                {timeLeft > 0 && (
                  <div className="text-md font-semibold self-start">
                    Tempo: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            )}

          </div>

          <Button
            className="text-xl font-semibold w-72 mt-5"
            variant="secondary" 
            size="xxl" 
            onClick={() => router.push(`/simulado?year=${selectedYear}&time=${selectedTime}`)}
          >
            Gerar Simulado
          </Button>


        </div>
        <a className="mt-48 text-white text-center font-extralight hover:text-blue-500 cursor-pointer" href="https://github.com/jmgrd98" target="_blank">Desenvolvido por João Marcelo Dantas</a>
      </main>
    </>
  );
}
