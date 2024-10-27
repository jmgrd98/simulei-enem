'use client';

import { Button } from "@/components/ui/button";
import { useUserScore } from "@/context/UserScoreContext";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from "axios";
import Loader from "@/components/Loader";
import { Pie, PieChart, Label } from "recharts";
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

  useEffect(() => {
    stopTimer();
  }, []);

  // Calculate non-answered questions
  const answeredQuestionsCount = selectedAnswers.length;
  const unansweredQuestionsCount = totalQuestions - answeredQuestionsCount;

  // Update chart data to include non-answered questions
  const chartData = [
    { label: "Corretas", value: score, fill: "#22C55E" },
    { label: "Erradas", value: totalQuestions - score - unansweredQuestionsCount, fill: "#EF4444" },
    { label: "Não respondidas", value: unansweredQuestionsCount, fill: "grey" }
  ];

  const chartConfig = {
    corretasVsErradas: {
      label: "Corretas x Erradas",
    },
    corretas: {
      label: "Corretas",
      color: "hsl(var(--chart-1))",
    },
    erradas: {
      label: "Erradas",
      color: "hsl(var(--chart-2))",
    }
  } satisfies ChartConfig

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

  const handleBackToHome = () => {
    resetScore();
    router.push('/');
  };

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <div className="w-full flex items-center justify-between">
          <h1 onClick={() => handleBackToHome()} className="text-3xl font-bold mb-10 cursor-pointer">Simulei</h1>
          {isSignedIn ? <div className="w-20 h-20"><UserButton /></div> : <Button variant={'secondary'} className="w-24 self-start font-semibold text-lg" size={'xl'} onClick={() => router.push('/sign-in')}>Login</Button>}
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

                    let colorClass = 'bg-gray-400';
                    if (selectedAnswer) {
                      colorClass = selectedAnswer === question.correctAlternative ? 'bg-green-500' : 'bg-red-500';
                    }
                    return (
                      <div key={index} className={`w-10 h-10 flex items-center justify-center ${colorClass} text-white`}>
                        {index + 1}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="flex flex-col gap-5 items-center">
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                  <CardTitle>Respostas</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <div className="mx-auto max-h-[250px]">
                      <PieChart width={250} height={250}>
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="label"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          strokeWidth={5}
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground text-3xl font-bold"
                                    >
                                      {totalQuestions}
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 24}
                                      className="fill-muted-foreground"
                                    >
                                      Questões
                                    </tspan>
                                  </text>
                                );
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </div>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Button variant={'secondary'} size={'xl'} onClick={handleBackToHome} className="mt-5">Voltar ao Início</Button>
      </main>
    </>
  );
}
