'use client';

import { Button } from "@/components/ui/button";
import { useUserScore } from "@/context/UserScoreContext";
import { useSearchParams } from 'next/navigation';
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from "axios";

export default function ResultadoPage() {
  const { score, selectedAnswers } = useUserScore();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    fetchQuestions(2023);
    console.log(selectedAnswers);
  }, []);

  const fetchQuestions = async (year: number) => {
    try {
      let allQuestions: any[] = [];
      const limit = 50; // The API limit per request
      const totalQuestions = 180;
      const totalRequests = Math.ceil(totalQuestions / limit);

      // Make multiple requests to get all 180 questions
      for (let i = 0; i < totalRequests; i++) {
        const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions?limit=${limit}&offset=${i * limit}`);
        allQuestions = [...allQuestions, ...response.data.questions];
      }

      // Ensure you only have 180 questions (in case you fetched extra)
      setQuestions(allQuestions.slice(0, totalQuestions));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <div className="w-full flex items-center justify-between">
          <h1 onClick={() => router.push('/')} className="text-3xl font-bold mb-10 cursor-pointer">Simulado ENEM</h1>
          {isSignedIn ? <div className="w-20 h-20"><UserButton /></div> : <Button onClick={() => router.push('/sign-in')}>Login</Button>}
        </div>

        <div className="flex flex-col gap-5 items-center">
          <h1 className="text-xl font-semibold">Esse foi o seu resultado:</h1>
          <h2 className="text-lg">Score: {score} / 180</h2>
          <h3 className="text-lg text-green-600">Questões Corretas: {score}</h3>
          <h3 className="text-lg text-red-600">Questões Erradas: {180 - score}</h3>

          <div className="grid grid-cols-12 gap-2 mt-4">
            {loading ? (
              <p>Loading...</p>
            ) : (
              questions.map((question, index) => {
                const selectedAnswer = selectedAnswers.find(answer => answer.index === index + 1)?.answer;
                const isCorrect = selectedAnswer === question.correctAlternative;
                const colorClass = isCorrect ? 'bg-green-500' : 'bg-red-500';

                return (
                  <div key={index} className={`w-10 h-10 flex items-center justify-center ${colorClass} text-white`}>
                    {index + 1}
                  </div>
                );
              })
            )}
          </div>

          <Button variant={'secondary'} size={'xl'} onClick={handleBackToHome}>Voltar ao Início</Button>
        </div>
      </main>
    </>
  );
}
