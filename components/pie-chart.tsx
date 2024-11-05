import { Pie, PieChart, Label } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { useUserScore } from "@/context/UserScoreContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";


const PieChartComponent = () => {
    const { score, selectedAnswers } = useUserScore();
    const totalQuestions = 180;
    const answeredQuestionsCount = selectedAnswers.length;
    const unansweredQuestionsCount = totalQuestions - answeredQuestionsCount;
    const pieChartData = [
        { label: "Corretas", value: score, fill: "#22C55E" },
        { label: "Erradas", value: totalQuestions - score - unansweredQuestionsCount, fill: "#EF4444" },
        { label: "Não respondidas", value: unansweredQuestionsCount, fill: "grey" }
      ];
    
      const pieChartConfig = {
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
      } satisfies ChartConfig;
  return (
    <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
            <CardTitle>Respostas</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
            <ChartContainer
            config={pieChartConfig}
            className="mx-auto aspect-square max-h-[250px]"
            >
            <div className="mx-auto max-h-[250px]">
                <PieChart width={250} height={250}>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                    data={pieChartData}
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
  )
}

export default PieChartComponent;
