import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@components/ui/chart";
import { useState, useEffect } from "react";

export function LandsChart({ chartData, chartConfig }: { chartData: any[], chartConfig: ChartConfig }) {
  
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // generates unique colors for each token
  const COLORS = chartData.map((_, index) =>
    `hsl(${(index * 137.508) % 360}, 65%, 55%)`
  );

  // adjust YAxis width based on longest label
  const yAxisWidth = Math.min(
    Math.max(...chartData.map((item) => item.id.length * (isMobile ? 7 : 10))),
    isMobile ? 100 : 150
  );

  // set maximum height for the chart container
  const maxChartHeight = 400; 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Tokens Staked</CardTitle>
        <CardDescription>By Percentage of Total Supply</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            width: "100%",
            maxHeight: `${maxChartHeight}px`,
            overflowY: "auto",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height={
              chartData.length * (isMobile ? 40 : 30) > maxChartHeight
                ? chartData.length * (isMobile ? 40 : 30)
                : maxChartHeight
            }
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 20,
                bottom: 20,
                left: yAxisWidth + 10,
                right: 20,
              }}
            >
              {/* I got rid of vertical grid lines */}
              <CartesianGrid horizontal={false} vertical={false} />
              <XAxis type="number" hide />
              <YAxis
                dataKey="id"
                type="category"
                tickLine={false}
                axisLine={false}
                width={yAxisWidth}
                tick={{
                  fontSize: isMobile ? 10 : 12,
                  fill: "var(--foreground)",
                }}
              />
              <Tooltip
                cursor={{ fill: "transparent" }} // I removed the hover background here
                formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                contentStyle={{
                  backgroundColor: "#170202", // tooltip background color
                  borderColor: "#710707",
                  borderRadius: "5px",
                  padding: "5px 19px",
                }}
                itemStyle={{ color: "#fff" }} // tooltip text color
              />
              <Bar dataKey="score" radius={4} minPointSize={5}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    // I removed hover effect by keeping fill opacity constant
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total tokens for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}
