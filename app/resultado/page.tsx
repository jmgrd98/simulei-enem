'use client';

import { Button } from "@/components/ui/button";
import { useUserScore } from "@/context/UserScoreContext";
import { UserButton, useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from "axios";
import Loader from "@/components/Loader/Loader";
import { Pie, PieChart, Label } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from 'next/navigation';
import { useExamTime } from "@/context/ExamTimeContext";
import { Question } from '@prisma/client';

export default function ResultadoPage() {
  const { score, selectedAnswers, resetScore } = useUserScore();
  const { selectedTime } = useExamTime();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);

  const searchParams = useSearchParams();
  const timeParam = searchParams.get('time');
  
  const time = Number(timeParam) || 0;
  const timeSpent = Math.max(selectedTime - time, 0); 
  
  const hoursSpent = Math.floor(timeSpent / 3600);
  const minutesSpent = Math.floor((timeSpent % 3600) / 60);
  const secondsSpent = timeSpent % 60;

  const totalQuestions = 180;

  const chartData = [
    { label: "Corretas", value: score, fill: "#22C55E" },
    { label: "Erradas", value: totalQuestions - score, fill: "#EF4444" }
  ];

  useEffect(() => {
    fetchQuestions(2023);
    console.log(selectedTime);
  }, [selectedAnswers, score, selectedTime]);
  
  const fetchQuestions = async (year: number) => {
    try {
      let allQuestions: Question[] = [];
      const limit = 50;
      const totalRequests = Math.ceil(totalQuestions / limit);
  
      for (let i = 0; i < totalRequests; i++) {
        const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions?limit=${limit}&offset=${i * limit}`);
        allQuestions = [...allQuestions, ...response.data.questions];
      }
  
      setQuestions(allQuestions.slice(0, totalQuestions));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

        <div className="flex flex-col gap-5 items-center">
          <h1 className="text-xl font-semibold">Esse foi o seu resultado:</h1>
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg text-green-600">Questões Corretas: {score}</p>
            <p className="text-lg text-red-600">Questões Erradas: {totalQuestions - score}</p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <p className="text-lg text-blue-600">
              Teste feito em {hoursSpent} horas, {minutesSpent} minutos e {secondsSpent} segundos
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap pl-5">
            {loading ? (
              <div className="flex justify-center items-center h-[50vh] w-full m-auto">
                <Loader />
              </div>
            ) : (
              questions.map((question, index) => {
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


          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>Respostas - Corretas vs Erradas</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <div className="mx-auto max-h-[250px]">
                <PieChart width={250} height={250}>
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
                                Total
                                </tspan>
                            </text>
                            );
                        }
                        }}
                    />
                    </Pie>
                </PieChart>
                </div>
            </CardContent>
            </Card>


          <Button variant={'secondary'} size={'xl'} onClick={handleBackToHome}>Voltar ao Início</Button>
        </div>
      </main>
    </>
  );
}
