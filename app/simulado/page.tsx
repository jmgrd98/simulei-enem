'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useUserScore } from "@/context/UserScoreContext";
import { useSearchParams } from 'next/navigation';
import { UserButton, useUser } from "@clerk/nextjs";
import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';
import { FaArrowRight, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Loader from "@/components/Loader/Loader";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useExamTime } from "@/context/ExamTimeContext";
import { Question, Alternative } from "@prisma/client";
import { useToast } from "@/hooks/use-toast";


type QuestionWithAlternatives = Question & { alternatives: Alternative[] };

export default function SimuladoPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const selectedYear = Number(searchParams.get('year')) || 2023;
  const selectedTime = Number(searchParams.get('time')) || 0;

  const { selectedAnswers, setSelectedAnswers, incrementScore, decrementScore } = useUserScore();
  const { timeLeft, setTimeLeft, startTimer, resetTimer, isAnimating } = useExamTime();

  const router = useRouter();
  const { isSignedIn } = useUser();

  const [question, setQuestion] = useState<QuestionWithAlternatives>({
    id: '',
    description: '',
    discipline: '',
    year: '',
    correctAlternative: '',
    alternatives: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);
  const [prevAnswers, setPrevAnswers] = useState<{ index: number, answer: string }[]>([]);

  useEffect(() => {
    setTimeLeft(selectedTime * 60);
  }, [selectedTime, setTimeLeft]);

  const fetchQuestion = useCallback(async (index: number, year: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions/${index}`);
      const data: QuestionWithAlternatives = response.data;
      setQuestion(data);

      const savedAnswer = selectedAnswers.find(answer => answer.index === index)?.answer;
      setSelectedAnswer(savedAnswer || null);

      setPrevAnswers(prev => [...prev, { index, answer: savedAnswer || '' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedAnswers]);

  useEffect(() => {
    fetchQuestion(currentQuestionIndex, selectedYear);
  }, [currentQuestionIndex, selectedYear, fetchQuestion]);

  useEffect(() => {
    if (timeLeft > 0) {
      startTimer();
    }
  }, [timeLeft, startTimer]);

  const handleAnswerClick = (letter: string) => {
    setSelectedAnswer(letter);

    const correctAnswer = question.alternatives.find((alt: Alternative) => alt.isCorrect);
    console.log(correctAnswer?.letter, letter)
    if (correctAnswer?.letter === letter) {
      incrementScore();
    }

    setSelectedAnswers(
      prevAnswers.map((answer) =>
        answer.index === currentQuestionIndex ? { ...answer, answer: letter } : answer
      )
    );
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
    router.push(`/resultado?timeLeft=${timeLeft}`);
    toast({
      description: 'Você finalizou o simulado',
    })
  };

  const capitalizeWords = (string: string) => {
    return string
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('-');
  };  

  return (
    <main className="flex flex-col items-center p-12 w-full">
      <div className="w-full flex items-center justify-between">
        <h1 onClick={() => router.push('/')} className="text-6xl font-bold mb-10 cursor-pointer">Simulado ENEM</h1>
        {isSignedIn ? (
          <div className="w-20 h-20"><UserButton /></div>
        ) : (
          <Button variant={'secondary'} onClick={() => router.push('/sign-in')}>Login</Button>
        )}
      </div>

      <div className="flex flex-col gap-5 items-center w-full">
        {!loading && (
          <div className="w-full flex gap-2 items-center justify-between">
            <Button variant='secondary' onClick={handlePreviousQuestion} disabled={loading || currentQuestionIndex === 1}>
              <FaArrowLeft />
            </Button>
            <Select onValueChange={handleQuestionSelect} defaultValue={currentQuestionIndex.toString()}>
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
            <Button variant='secondary' onClick={handleNextQuestion} disabled={loading}>
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
          <FaRedo className={`cursor-pointer ${isAnimating ? 'animate-spin' : ''}`} onClick={resetTimer} />
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant='secondary' onClick={finishExam} className="font-semibold text-lg place-self-end">Finalizar prova</Button>
            </TooltipTrigger>
            <TooltipContent>Revise todas as questões antes de finalizar!</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {loading ? (
          <Loader />
        ) : (
          <div className="p-4 border rounded shadow w-full flex flex-col gap-3">
            <h2 className="text-xl font-semibold">Questão {currentQuestionIndex}</h2>
            <p>Ano: {question.year}</p>
            <p>Disciplina: {capitalizeWords(question.discipline)}</p>
            <p>{question.description}</p>
            <div className="flex flex-col gap-3 w-full">
              {question.alternatives.map((alt) => (
                <Button key={alt.id} variant={selectedAnswer === alt.letter ? 'secondary' : 'outline'} onClick={() => handleAnswerClick(alt.letter)}>
                  {alt.letter}: {alt.text}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
