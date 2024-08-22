import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@components/ui/chart"

export function LandsChart({ chartData, chartConfig }: { chartData: any[], chartConfig: ChartConfig }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Total Tokens Staked</CardTitle>
                <CardDescription>By Percentage of Total Supply</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        style={{ fill: 'white' }}
                        accessibilityLayer
                        data={chartData}
                        layout="vertical"
                        margin={{
                            right: 16,
                        }}

                    >

                        <CartesianGrid horizontal={false} />
                        <YAxis
                            dataKey="id"
                            type="category"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            hide

                        />
                        <XAxis dataKey="score" type="number" hide />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent indicator="line" />
                            }

                        />
                        <Bar
                            dataKey="score"
                            layout="vertical"
                            fill="var(--color-tokens)"
                            radius={4}
                        >
                            <LabelList
                                dataKey="id"
                                position="insideLeft"
                                offset={8}
                                className="fill-[--color-label]"
                                fontSize={12}
                            />
                            <LabelList
                                dataKey="score"
                                position="right"
                                offset={8}
                                className="fill-foreground"
                                fontSize={12}
                                formatter={(value: number) => `${(value * 100).toFixed(2)}%`}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
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
    )
}
