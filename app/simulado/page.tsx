'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useUserScore } from "@/context/UserScoreContext";
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Loader from "@/components/Loader";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useExamTime } from "@/context/ExamTimeContext";
import { Question, Alternative } from "@prisma/client";
import { useQuery } from '@tanstack/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

type QuestionWithAlternatives = Question & {
  alternatives: Alternative[],
  files?: string[],
  onSuccess: () => void,
  onError: () => void,
};

const queryClient = new QueryClient();

const fetchQuestion = async (index: number, year: number): Promise<QuestionWithAlternatives> => {
  const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions/${index}`);
  return response.data;
};

export default function SimuladoPage() {
  const searchParams = useSearchParams();
  const selectedYear = Number(searchParams.get('year')) || 2023;
  const selectedTime = Number(searchParams.get('time')) || 0;

  const { selectedAnswers, setSelectedAnswers, incrementScore, decrementScore } = useUserScore();
  const { timeLeft, setTimeLeft, startTimer } = useExamTime();

  const router = useRouter();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);

  useEffect(() => {
    setTimeLeft(selectedTime * 60);
  }, [selectedTime, setTimeLeft]);

  useEffect(() => {
    if (timeLeft > 0) {
      startTimer();
    }
  }, [timeLeft, startTimer]);

  useEffect(() => {
    const savedAnswer = selectedAnswers.find((answer: { index: number; answer: string }) => answer.index === currentQuestionIndex);
    setSelectedAnswer(savedAnswer?.answer ?? null);
  }, [currentQuestionIndex, selectedAnswers]);

  const { data: question, isLoading, isError } = useQuery<QuestionWithAlternatives>({
    queryKey: ['question', currentQuestionIndex, selectedYear],
    queryFn: async () => {
      const response = await fetchQuestion(currentQuestionIndex, selectedYear);
      const savedAnswer = selectedAnswers.find((answer: { index: number; answer: string }) => answer.index === currentQuestionIndex)
      setSelectedAnswer(savedAnswer?.answer || null);
      return response;
    },
  });

  type SimplifiedAnswer = { index: number; answer: string };

  const handleAnswerClick = (letter: string) => {
    setSelectedAnswer(letter);
  
    const correctAnswer = question?.alternatives.find((alt: Alternative) => alt.isCorrect);
  
    if (correctAnswer?.letter === letter) {
      incrementScore(question!.discipline);
    } else if (correctAnswer && selectedAnswer === correctAnswer.letter) {
      decrementScore(question!.discipline);
    }
  
    setSelectedAnswers((prevAnswers: SimplifiedAnswer[]) => {
      const updatedAnswers = prevAnswers
        .filter((answer) => answer.index !== currentQuestionIndex)
        .map((answer) => ({ index: answer.index, answer: answer.answer }));
      return [...updatedAnswers, { index: currentQuestionIndex, answer: letter }];
    });
  };
  

  const handleQuestionSelect = (value: string) => {
    setCurrentQuestionIndex(Number(value));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 1));
  };

  const finishExam = () => {
    router.push(`/resultado?time=${selectedTime}`);
  };

  const capitalizeWords = (string: string) => {
    return string
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex flex-col items-center p-12 w-full">

        <div className="flex flex-col gap-5 items-center w-full">
          {!isLoading && (
            <div className="w-full flex gap-2 items-center justify-between">
              <Button variant='secondary' onClick={handlePreviousQuestion} disabled={isLoading || currentQuestionIndex === 1}>
                <FaArrowLeft />
              </Button>
              <Select onValueChange={handleQuestionSelect} value={currentQuestionIndex.toString()}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione a questão" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 180 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Questão {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant='secondary' onClick={handleNextQuestion} disabled={isLoading}>
                <FaArrowRight />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2 w-full">
            {timeLeft > 0 && (
              <div className="text-md font-semibold">
                Tempo: {Math.floor(timeLeft / 3600)}:
                {Math.floor((timeLeft % 3600) / 60).toString().padStart(2, '0')}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='secondary' onClick={finishExam} className="font-semibold text-lg place-self-end">Finalizar prova</Button>
              </TooltipTrigger>
              <TooltipContent>Revise todas as questões antes de finalizar!</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isLoading ? (
            <Loader />
          ) : isError ? (
            <p>Erro ao carregar a questão. Tente novamente mais tarde.</p>
          ) : (
            <div className="p-4 border rounded shadow w-full flex flex-col gap-3">
              <h2 className="text-xl font-semibold">Questão {currentQuestionIndex}</h2>
              <p>Ano: {question!.year}</p>
              <p>Disciplina: {capitalizeWords(question!.discipline)}</p>
              <p>{question!.context}</p>
              
              {question!.files && question!.files.length > 0 && (
                <div className="flex justify-center my-4">
                  <img
                    src={question!.files[0]}
                    alt={`Image for Question ${currentQuestionIndex}`}
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}
              
              <p>{question!.alternativesIntroduction}</p>
              <ul className="grid gap-2">
                {question!.alternatives.map((alt) => (
                  <li key={alt.letter} className="list-none">
                    <Button 
                      variant={selectedAnswer === alt.letter ? 'default' : 'secondary'} 
                      onClick={() => handleAnswerClick(alt.letter)}>
                      {alt.letter}. {alt.text}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </QueryClientProvider>
  );
}
