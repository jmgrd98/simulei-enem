import { Label, Bar, BarChart, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { useQuery } from "@tanstack/react-query";
import { Question } from "@prisma/client";
import axios from "axios";
import { useEffect, useMemo } from "react";
import { useUserScore } from "@/context/UserScoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const BarChartComponent = () => {
  const { disciplineScores, selectedAnswers } = useUserScore();
  const totalQuestions = 180;

  const disciplinesMap: { [key: string]: string } = {
    "ciencias-humanas": "Ciências Humanas e suas Tecnologias",
    "ciencias-natureza": "Ciências da Natureza e suas Tecnologias",
    "linguagens": "Linguagens, Códigos e suas Tecnologias",
    "matematica": "Matemática e suas Tecnologias",
    "espanhol": "Espanhol",
    "ingles": "Inglês"
  };

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

  const barChartData = useMemo(() => 
    Object.entries(disciplineScores).map(([discipline, count]) => ({
      discipline: disciplinesMap[discipline] || discipline,
      count,
    })),
    [disciplineScores]
  );

  useEffect(() => {
    console.log(barChartData)
  }, [])

  const barChartConfig = barChartData.reduce((config, { discipline }, index) => {
    const color = `hsl(${(index * 70) % 360}, 70%, 60%)`;
    config[discipline] = { label: discipline, color };
    return config;
  }, {} as Record<string, { label: string; color: string }>);

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
            <YAxis
              type="category"
              dataKey="discipline"
              tickFormatter={(discipline) =>
                barChartConfig[discipline]?.label || discipline
              }
            />
            <ChartTooltip
              cursor={{ fill: "transparent" }}
              content={<ChartTooltipContent />}
            />
            <Bar dataKey="count" radius={[5, 5, 0, 0]}>
              {barChartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barChartConfig[entry.discipline]?.color || "#8884d8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BarChartComponent;
