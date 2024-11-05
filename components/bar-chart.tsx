import { Label, Bar, BarChart, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Question } from "@prisma/client";
import axios from "axios";
import { useMemo } from "react";
import { useUserScore } from "@/context/UserScoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const BarChartComponent = () => {
  const { score, selectedAnswers } = useUserScore();
  const totalQuestions = 180;

  const fetchQuestions = async (): Promise<Question[]> => {
    const year = 2023;
    const limit = 50;
    const totalRequests = Math.ceil(totalQuestions / limit);
    let allQuestions: Question[] = [];

    for (let i = 0; i < totalRequests; i++) {
      const response = await axios.get(
        `https://api.enem.dev/v1/exams/${year}/questions?limit=${limit}&offset=${i * limit}`
      );
      allQuestions = [...allQuestions, ...response.data.questions];
    }

    return allQuestions.slice(0, totalQuestions);
  };

  const { data: questions } = useQuery<Question[]>({
    queryKey: ["questions", 2023],
    queryFn: fetchQuestions,
  });

  const correctAnswersByDiscipline = useMemo(() => {
    const aggregation: Record<string, number> = {};

    questions?.forEach((question) => {
      const userAnswer = selectedAnswers.find(
        (answer) => answer.index.toString() === question.id
      )?.answer;
      if (userAnswer && userAnswer === question.correctAlternative) {
        aggregation[question.discipline] =
          (aggregation[question.discipline] || 0) + 1;
      }
    });

    return Object.entries(aggregation).map(([discipline, count]) => ({
      discipline,
      count,
    }));
  }, [questions, selectedAnswers]);

  const barChartData = correctAnswersByDiscipline;

  const barChartConfig = {
    visitors: {
      label: "Visitors",
    },
    chrome: {
      label: "Chrome",
      color: "hsl(var(--chart-1))",
    },
    safari: {
      label: "Safari",
      color: "hsl(var(--chart-2))",
    },
    firefox: {
      label: "Firefox",
      color: "hsl(var(--chart-3))",
    },
    edge: {
      label: "Edge",
      color: "hsl(var(--chart-4))",
    },
    other: {
      label: "Other",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questões corretas por matéria</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={barChartConfig}>
          <BarChart
            data={barChartData}
            layout="vertical"
            width={500}
            height={300}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis type="number" dataKey="count" />
            <YAxis type="category" dataKey="discipline" />
            <ChartTooltip
              cursor={{ fill: "transparent" }}
              content={<ChartTooltipContent />}
            />
            <Bar
              dataKey="count"
              fill="hsl(var(--chart-1))"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BarChartComponent;
