'use client';

import { Button } from "@/components/ui/button";
import axios from 'axios';
import { useState } from "react";

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const generateQuestion = async () => {
    setLoading(true);
    setSelectedAnswer(null);
    try {
      const response = await axios.get('https://api.enem.dev/v1/exams/2023/questions/20');
      setQuestion(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerClick = (letter: string) => {
    setSelectedAnswer(letter);
  };

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <h1 className="text-3xl font-bold mb-10">Gerador de Questão Enem</h1>

        <div className="flex flex-col gap-5 items-center">
          <Button variant="secondary" onClick={generateQuestion} disabled={loading}>
            {loading ? 'Carregando...' : 'Gerar Questão'}
          </Button>

          {question && (
            <>
              <div className="mt-8 p-4 border rounded shadow w-full">
                <h2 className="text-xl font-semibold">Questão {question.index}</h2>
                <p className="font-bold">Disciplina: {question.discipline}</p>
                <p>{question.alternativesIntroduction}</p>
                <p>{question.context}</p>
              </div>

              <div className="mt-4 flex flex-col gap-3 w-full">
                <h3 className="text-lg font-semibold">Alternativas:</h3>
                {question.alternatives.map((alt: any) => {
                  let buttonVariant = 'outline'

                  if (selectedAnswer) {
                    if (alt.letter === selectedAnswer) {
                      buttonVariant = alt.isCorrect ? 'outline' : 'destructive';
                    } else if (alt.isCorrect) {
                      buttonVariant = 'outline';
                    } else {
                      buttonVariant = 'ghost';
                    }
                  }

                  return (
                    <Button 
                      key={alt.letter} 
                      variant={buttonVariant}
                      className={`${selectedAnswer === alt.letter && alt.isCorrect ? ' bg-green-600' : ''}`}
                      onClick={() => handleAnswerClick(alt.letter)}
                      disabled={!!selectedAnswer}
                    >
                      {alt.letter}: {alt.text}
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
