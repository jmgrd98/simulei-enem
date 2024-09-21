'use client'

import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useState, useEffect } from "react";

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateQuestion = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://api.enem.dev/v1/exams/2023/questions/1')
      setQuestion(response.data);
      console.log(question)
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <main className="flex flex-col items-center justify-evenly p-24">
        <h1 className="text-3xl font-bold underline">Gerador de Questão Enem</h1>

        <Button variant={'secondary'} onClick={generateQuestion} disabled={loading}>
          {loading ? 'Carregando...' : 'Gerar Questão'}
        </Button>

        {question && (
          <div className="mt-8 p-4 border rounded shadow">
            <h2 className="text-xl font-semibold">Questão {question.index}</h2>
            <p className="font-bold">Disciplina: {question.discipline}</p>
            <p>{question.alternativesIntroduction}</p>
            <p>{question.context}</p>
          </div>
        )}

      </main>
    </>
  );
}
