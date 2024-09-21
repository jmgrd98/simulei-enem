'use client';

import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // Import Shadcn Select components
import axios from 'axios';
import { useState, useEffect } from "react";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

export default function Home() {
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2023); // Default year

  const fetchQuestion = async (index: number, year: number) => {
    setLoading(true);
    setSelectedAnswer(null);
    try {
      const response = await axios.get(`https://api.enem.dev/v1/exams/${year}/questions/${index}`);
      setQuestion(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion(currentIndex, selectedYear);
  }, [currentIndex, selectedYear]);

  const handleAnswerClick = (letter: string) => {
    setSelectedAnswer(letter);
  };

  const handleNextQuestion = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handlePreviousQuestion = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 1));
  };

  return (
    <>
      <main className="flex flex-col items-center p-12">
        <h1 className="text-3xl font-bold mb-10">Gerador de Questão Enem</h1>

        <div className="flex flex-col gap-5 items-center">
          
          {/* Year selection with Shadcn Select */}
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
              <div className="mt-8 p-4 border rounded shadow w-full">
                <h2 className="text-xl font-semibold">Questão {question.index}</h2>
                <p className="font-bold">Ano: {question.year.toString()}</p>
                <p className="font-bold">Disciplina: {question.discipline}</p>
                <p>{question.alternativesIntroduction}</p>
                <p>{question.context}</p>
              </div>

              <div className="mt-4 flex flex-col gap-3 w-full">
                <h3 className="text-lg font-semibold">Alternativas:</h3>
                {question.alternatives.map((alt: any) => {
                  let buttonVariant = 'outline';
                  let additionalClasses = '';

                  if (selectedAnswer) {
                    if (alt.letter === selectedAnswer) {
                      buttonVariant = alt.isCorrect ? 'success' : 'destructive';
                    }
                    if (alt.isCorrect) {
                      additionalClasses = 'bg-green-600';
                    }
                  }

                  return (
                    <Button
                      key={alt.letter}
                      variant={buttonVariant}
                      className={`${additionalClasses} ${selectedAnswer === alt.letter && !alt.isCorrect ? 'bg-red-600' : ''}`}
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
