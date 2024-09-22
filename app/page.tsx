'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { UserButton, useUser } from "@clerk/nextjs";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExamTime } from "@/context/ExameTimeContext";

export default function Home() {
  const { setSelectedTime, setTimeLeft } = useExamTime();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [selectedYear, setSelectedYear] = useState<number>(2023);

  const handleTimeSelection = (value: string) => {
    const selectedMinutes = Number(value);
    setSelectedTime(selectedMinutes);
    setTimeLeft(selectedMinutes * 60); // Set initial time in seconds
  };

  return (
    <main className="flex flex-col items-center p-12">
      {/* Rest of your component */}
      <Select onValueChange={handleTimeSelection}>
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
      <Button onClick={() => router.push(`/simulado?year=${selectedYear}`)}>Gerar Simulado</Button>
    </main>
  );
}
