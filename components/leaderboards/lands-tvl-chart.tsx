import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@components/ui/card";
import numeral from "numeral";

// I used a predefined color palette for each token to ensure uniqueness
// i might need to work on more dynamic one later, but it seems to be failing right now
const COLORS = [
    "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6547",
    "#8884D8", "#1D8BF1", "#FF4545", "#FFA500", "#00C49A"
];

export function LandsTVLChart({ chartData }: { chartData: any[] }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Stake-to-Earn TVL</CardTitle>
                <CardDescription>
                    Distribution of Total Value Locked (TVL) across staked tokens on Charisma
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%', outline: '0' }}>
                    <ResponsiveContainer width="100%" height={500}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}  // increase inner radius for a bigger chart
                                outerRadius={160}   // increase outer radius for a bigger chart
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="score"
                                nameKey="id"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]} // unique color for each token
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) =>
                                    numeral(value).format("$0,0.00")
                                }
                                contentStyle={{
                                    backgroundColor: "#170202",
                                    borderColor: "#ccc",
                                    borderRadius: "5px",
                                    padding: "5px",
                                }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Legend
                                layout="horizontal" // this is where i am displaying each token names
                                verticalAlign="bottom"
                                align="center"
                                wrapperStyle={{
                                    fontSize: '12px',
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'center',
                                    marginTop: '20px',
                                }}
                            />
                        </PieChart>
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
    )
}
