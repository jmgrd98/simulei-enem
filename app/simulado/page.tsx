'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useUserScore } from "@/context/UserScoreContext";
import { useSearchParams } from 'next/navigation';
import { UserButton, useUser } from "@clerk/nextjs";
import axios from 'axios';
import { useState, useEffect } from 'react';
import { FaArrowRight, FaArrowLeft, FaRedo } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Loader from "@/components/Loader/Loader";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useExamTime } from "@/context/ExameTimeContext";

export default function SimuladoPage() {
  const searchParams = useSearchParams();
  const selectedYear = Number(searchParams.get('year')) || 2023;
  const selectedTime = Number(searchParams.get('time')) || 0;

  const { selectedAnswers, setSelectedAnswers, incrementScore, decrementScore } = useUserScore();
  const { timeLeft, setTimeLeft, startTimer, resetTimer, isAnimating } = useExamTime();

  const router = useRouter();
  const { isSignedIn } = useUser();

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(1);
  const [prevAnswers, setPrevAnswers] = useState<{ index: number, answer: string }[]>([]);

  useEffect(() => {
    setTimeLeft(selectedTime * 60);
  }, [selectedTime, setTimeLeft]);

  useEffect(() => {
    fetchQuestion(currentQuestionIndex, selectedYear);
  }, [currentQuestionIndex, selectedYear]);

  const fetchQuestion = async (index: number, year: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions/${index}`);
      setQuestion(response.data);

      const savedAnswer = selectedAnswers.find(answer => answer.index === index)?.answer;
      setSelectedAnswer(savedAnswer || null);

      setPrevAnswers(prevAnswers => [...prevAnswers, { index, answer: savedAnswer || '' }]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeLeft > 0) {
      startTimer();
    } else if (timeLeft === 0) {
      alert("Time's up!");
    }
  }, [timeLeft, startTimer]);

  const handleAnswerClick = (letter: string) => {
    setSelectedAnswer(letter);
    
    const correctAnswer = question?.alternatives?.find((alt: any) => alt.isCorrect);
    if (correctAnswer && correctAnswer.letter === letter) {
      incrementScore();
    } else {
      decrementScore();
    }
  
    setSelectedAnswers(
      prevAnswers.map((answer, index) =>
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
  };

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <div className="w-full flex items-center justify-between">
          <h1 onClick={() => router.push('/')} className="text-6xl font-bold mb-10 cursor-pointer">Simulado ENEM</h1>
          {isSignedIn ? <div className="w-20 h-20"><UserButton /></div> : <Button variant={'secondary'} className="w-24 self-start font-semibold text-lg" size={'xl'} onClick={() => router.push('/sign-in')}>Login</Button>}
        </div>

        <div className="flex flex-col gap-5 items-center">
          {!loading && <div className="w-full flex gap-2 items-center justify-between">
            <Button variant="secondary" onClick={handlePreviousQuestion} disabled={loading || currentQuestionIndex === 1}>
              <FaArrowLeft />
            </Button>

            <Select onValueChange={handleQuestionSelect} defaultValue={currentQuestionIndex.toString()}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione a questão" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 180 }, (_, i) => i + 1).map((index) => (
                  <SelectItem key={index} value={index.toString()}>
                    Questão {index}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="secondary" onClick={handleNextQuestion} disabled={loading}>
              <FaArrowRight />
            </Button>
          </div>}

          <div className="flex items-center gap-3 px-3 py-2 w-full">
            {timeLeft > 0 && (
              <div className="text-md font-semibold">
                Tempo: {Math.floor(timeLeft / 3600)}:
                {(Math.floor((timeLeft % 3600) / 60)).toString().padStart(2, '0')}:
                {(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            )}

            <FaRedo
              className={`cursor-pointer ${isAnimating ? 'animate-spin' : ''}`}
              onClick={() => resetTimer()}
              style={{ transition: 'transform 0.5s' }}
            />
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={'secondary'}
                  onClick={finishExam}
                  className="self-end font-semibold text-lg justify-self-end"
                >
                  Finalizar prova
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="center" className="bg-gray-800 text-white text-sm p-2 rounded-md shadow-md">
                Revise todas as questões antes de finalizar!
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {loading ? (
            <div className="absolute m-auto flex justify-center items-center min-h-[50vh]">
              <Loader />
            </div>
          ) : question && (
            <>
              <div className="mt-8 p-4 border rounded shadow w-full flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Questão {question.index}</h2>
                <p className="font-bold">Ano: {question.year.toString()}</p>
                <p className="font-bold">Disciplina: {question.discipline.split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}</p>
                <p>{question.alternativesIntroduction}</p>
                <p>{question.context}</p>
              </div>

              <div className="mt-4 flex flex-col gap-3 w-full">
                <h3 className="text-lg font-semibold">Alternativas:</h3>
                {question.alternatives.map((alt: any) => {
                  return (
                    <Button
                      key={alt.letter}
                      variant={selectedAnswer === alt.letter ? 'secondary' : 'outline'}
                      onClick={() => handleAnswerClick(alt.letter)}
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
