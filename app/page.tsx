'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useUserScore } from "@/context/UserScoreContext";
import { UserButton, useUser } from "@clerk/nextjs";
import axios from 'axios';
import { useState, useEffect, useRef } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { useRouter } from 'next/navigation';

export default function Home() {
  const { score, incrementScore, resetScore } = useUserScore();
  const router = useRouter();
  const { isSignedIn } = useUser();

  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | null>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // Timer state
  const [selectedTime, setSelectedTime] = useState<number>(0); // User-selected time

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchQuestion = async (index: number, year: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions/${index}`);
      setQuestion(response.data);
      setSelectedAnswer(selectedAnswers[index] || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion(currentIndex, selectedYear);
  }, [currentIndex, selectedYear]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0 && timerRef.current === null) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }

    if (timeLeft === 0 && timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      alert("Time's up!");
      // Optionally: Handle end of exam
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  const handleAnswerClick = (letter: string) => {
    setSelectedAnswer(letter);

    setSelectedAnswers((prevAnswers) => ({
      ...prevAnswers,
      [currentIndex]: letter,
    }));

    const correctAnswer = question?.alternatives?.find((alt: any) => alt.isCorrect);
    if (correctAnswer && correctAnswer.letter === letter) {
      incrementScore();
    }
  };

  const handleNextQuestion = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 1));
  };

  const handleLoginClick = () => {
    router.push('/sign-in');
  };

  const handleTimeSelection = (value: string) => {
    const selectedMinutes = Number(value);
    setSelectedTime(selectedMinutes);
    setTimeLeft(selectedMinutes * 60); // Convert minutes to seconds
  };

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <div className="w-full flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-10">Gerador de Questão Enem</h1>
          {isSignedIn ? <div className="w-20 h-20"><UserButton /></div> : <Button onClick={handleLoginClick}>Login</Button>}
        </div>

        <div className="flex flex-col gap-5 items-center">

          {/* Timer Selection */}
          <Select onValueChange={handleTimeSelection} defaultValue={selectedTime.toString()}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o tempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="45">45 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
            </SelectContent>
          </Select>

          {/* Display the remaining time */}
          {timeLeft > 0 && (
            <div className="text-lg font-semibold mt-4">
              Time left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          )}

          <Select onValueChange={(value) => setSelectedYear(Number(value))} defaultValue={selectedYear.toString()}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(2024 - 2009 + 1)].map((_, i) => {
                const year = 2024 - i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <div className="flex gap-2 items-center">
            <Button variant="secondary" onClick={handlePreviousQuestion} disabled={loading || currentIndex === 1}>
              <FaArrowLeft />
            </Button>

            <Button variant="secondary" onClick={handleNextQuestion} disabled={loading}>
              <FaArrowRight />
            </Button>
          </div>

          {question && (
            <>
              <div className="mt-8 p-4 border rounded shadow w-full flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Questão {question.index}</h2>
                <p className="font-bold">Ano: {question.year.toString()}</p>
                <p className="font-bold">Disciplina: {question.discipline}</p>
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
