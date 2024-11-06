'use client';

import { Button } from "@/components/ui/button";
import { useUserScore } from "@/context/UserScoreContext";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from "axios";
import Loader from "@/components/Loader";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSearchParams } from 'next/navigation';
import { useExamTime } from "@/context/ExamTimeContext";
import { Question } from '@prisma/client';
import { useEffect, useMemo } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import PieChartComponent from "@/components/pie-chart";
import BarChartComponent from "@/components/bar-chart";

export default function ResultadoPage() {
  const { score, selectedAnswers, resetScore } = useUserScore();
  const { selectedTime, timeLeft, stopTimer } = useExamTime();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const searchParams = useSearchParams();
  const timeParam = searchParams.get('time');

  const totalQuestions = 180;

  const timeSpent = useMemo(() => {
    const totalExamTime = Number(timeParam) || selectedTime;
    return totalExamTime ? Math.max(totalExamTime * 60 - timeLeft, 0) : 0;
  }, [selectedTime, timeLeft, timeParam]);

  const hoursSpent = Math.floor(timeSpent / 3600);
  const minutesSpent = Math.floor((timeSpent % 3600) / 60);
  const secondsSpent = timeSpent % 60;

  const fetchQuestions = async (): Promise<Question[]> => {
    const year = 2023;
    const limit = 50;
    const totalRequests = Math.ceil(totalQuestions / limit);
    let allQuestions: Question[] = [];

    for (let i = 0; i < totalRequests; i++) {
      const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions?limit=${limit}&offset=${i * limit}`);
      allQuestions = [...allQuestions, ...response.data.questions];
    }

    return allQuestions.slice(0, totalQuestions);
  };

  const { data: questions, isLoading, isError } = useQuery<Question[]>({
    queryKey: ['questions', 2023],
    queryFn: fetchQuestions,
  });

  const answeredQuestionsCount = selectedAnswers.length;
  const unansweredQuestionsCount = totalQuestions - answeredQuestionsCount;

  useEffect(() => {
    stopTimer();
  }, [stopTimer]);



  const handleBackToHome = () => {
    resetScore();
    router.push('/');
  };

  return (
    <TooltipProvider>
      <main className="flex flex-col items-center p-12">
        <div className="w-full flex items-center justify-between">
          <h1 onClick={() => handleBackToHome()} className="text-6xl font-bold mb-10 cursor-pointer">Resultado</h1>
        </div>

        <Tabs defaultValue="questions" className="w-full max-w-3xl">
          <TabsList className="flex justify-center space-x-2 p-1 rounded-md bg-transparent mb-5">
            <TabsTrigger 
              value="questions" 
              className="text-[16px] px-4 py-2 rounded-md transition-colors duration-300 ease-in-out hover:bg-black/50 data-[state=active]:bg-zinc-600 data-[state=active]:text-white"
            >
              Questões
            </TabsTrigger>
            <TabsTrigger 
              value="statistics" 
              className="text-[16px] px-4 py-2 rounded-md transition-colors duration-300 ease-in-out hover:bg-black/50 data-[state=active]:bg-zinc-600 data-[state=active]:text-white"
            >
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <div className="flex flex-col gap-5 items-center">
              <h1 className="text-xl font-semibold">Esse foi o seu resultado:</h1>
              <div className="flex items-center justify-center gap-2">
                <p className="text-lg text-green-600">Questões Corretas: {score}</p>
                <p className="text-lg text-red-600">Questões Erradas: {totalQuestions - score - unansweredQuestionsCount}</p>
                <p className="text-lg text-gray-600">Questões Não Respondidas: {unansweredQuestionsCount}</p>
              </div>

              <div className="flex items-center justify-center gap-2">
                <p className="text-lg text-blue-600">
                  Teste feito em {hoursSpent} horas, {minutesSpent} minutos e {secondsSpent} segundos
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap pl-5">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[50vh] w-full m-auto">
                    <Loader />
                  </div>
                ) : isError ? (
                  <p>Erro ao carregar as questões. Tente novamente mais tarde.</p>
                ) : (
                  questions!.map((question, index) => {
                    const selectedAnswer = selectedAnswers.find(answer => answer.index === index + 1)?.answer;
                    const correctAnswer = question.correctAlternative;
                    
                    let colorClass = 'bg-gray-400';
                    if (selectedAnswer) {
                      colorClass = selectedAnswer === correctAnswer ? 'bg-green-500' : 'bg-red-500';
                    }
                  
                    return (
                      <Tooltip key={index}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-10 h-10 flex items-center justify-center ${colorClass} text-white 
                                        transition-transform duration-300 ease-in-out transform hover:scale-110 cursor-pointer`}
                          >
                            {index + 1}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Seu Resposta: {selectedAnswer || "Não respondida"}</p>
                          <p>Resposta Correta: {correctAnswer}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="flex gap-5 items-center">
              <PieChartComponent />
              <BarChartComponent />
            </div>
          </TabsContent>
        </Tabs>

        <Button variant={'secondary'} size={'xl'} onClick={handleBackToHome} className="mt-5">Voltar ao Início</Button>
      </main>
    </TooltipProvider>
  );
}
