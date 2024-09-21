'use client'

import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    generateQuestion();
  }, [])
  const generateQuestion = async () => {
    
    try {
      const response = await axios.get('https://api.enem.dev/v1/exams/2023/questions/1')
      console.log(response)
    } catch (error) {
      console.error(error);
    }

  }

  return (
    <>
      <main className="flex flex-col items-center justify-evenly p-24">
        <h1 className="text-3xl font-bold underline">Gerador de Questão Enem</h1>
        <Button variant={'secondary'} onClick={generateQuestion}>Gerar Questão</Button>



      </main>
    </>
  );
}
