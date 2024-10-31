'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useUser } from "@clerk/nextjs";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamTime } from "@/context/ExamTimeContext";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const { toast } = useToast();
  const { startTimer } = useExamTime();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);

  const handleTimeSelection = (value: string) => {
    const selectedMinutes = Number(value);
    setSelectedTime(selectedMinutes);
  };

  const generateExam = (selectedYear: number, selectedTime: number) => {
    if (!isSignedIn) {
      toast({
        description: 'Por favor, faça login para gerar um simulado',
        variant: 'destructive'
      });
      return;
    }
  
    if (selectedTime > 0) {
      const timeInSeconds = selectedTime * 60;
      setTimeLeft(timeInSeconds);
      startTimer();
      router.push(`/simulado?year=${selectedYear}&time=${selectedTime}`);
    } else {
      toast({
        description: 'Por favor, selecione um tempo de prova válido',
        variant: 'destructive'
      });
    }
  };  

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-6xl font-bold mb-10 w-2/3">Gere simulados do ENEM gratuitos e meça seus resultados!</h1>
        </div>
        
        <h2 className="text-2xl text-center font-semibold w-full">Selecione o ano da prova e o tempo para gerar um simulado e começar a estudar!</h2>

        <div className="flex flex-col gap-5 items-center mt-5">
          <Select onValueChange={(value) => setSelectedYear(Number(value))} defaultValue={selectedYear.toString()}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(2023 - 2009 + 1)].map((_, i) => {
                const year = 2023 - i;
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
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">4 hours</SelectItem>
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
              className="text-xl font-semibold w-72 mt-2"
              variant="default" 
              size="xxl"
              onClick={() => generateExam(selectedYear, selectedTime)}
            >
              Gerar Simulado
            </Button>
        </div>
        <a className="mt-4 text-white text-center font-extralight hover:text-blue-500 cursor-pointer" href="https://github.com/jmgrd98" target="_blank">Desenvolvido por João Marcelo Dantas</a>
      </main>
    </>
  );
}
