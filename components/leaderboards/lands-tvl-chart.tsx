import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import numeral from 'numeral';

// I switched to dynamic colors incase the number of tokens increases
const generateColors = (numColors: number): string[] => {
  const colors: string[] = [];
  const saturation = 70;
  const lightness = 50;
  for (let i = 0; i < numColors; i++) {
    const hue = Math.round((360 / numColors) * i);
    colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
  }
  return colors;
};

interface ChartData {
  id: string;
  score: number;
}

interface Props {
  chartData: ChartData[];
}

// Custom hook to get the window width
// the legend was overlapping the piechart on mobile devices so i decided to use the function below
function useWindowWidth() {
  const [width, setWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWidth(window.innerWidth);
      };
      window.addEventListener('resize', handleResize);
      // Set initial width
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return width;
}

export function LandsTVLChart({ chartData }: Props) {
  const width = useWindowWidth();
  const isMobile = width !== undefined && width < 600;

  // calculate total TVL and percentage share for each token
  const totalTVL = chartData.reduce((sum, entry) => sum + entry.score, 0);
  const dataWithPercentages = chartData.map((entry) => ({
    ...entry,
    percentage: ((entry.score / totalTVL) * 100).toFixed(2),
  }));

  const COLORS = generateColors(chartData.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stake-to-Earn TVL</CardTitle>
        <CardDescription>
          Distribution of Total Value Locked (TVL) across staked tokens on Charisma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            outline: '0',
          }}
        >
          <ResponsiveContainer width="100%" height={isMobile ? 250 : 500}>
            <PieChart>
              <Pie
                data={dataWithPercentages}
                cx="50%"
                cy={isMobile ? '45%' : '50%'} // Move chart up on mobile
                innerRadius={isMobile ? 60 : 100}
                outerRadius={isMobile ? 100 : 160}
                fill="#8884d8"
                paddingAngle={3}
                dataKey="score"
                nameKey="id"
              >
                {dataWithPercentages.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string, props: any) => [
                  numeral(value).format('$0,0.00'),
                  `${props.payload.id}`,
                ]}
                contentStyle={{
                  backgroundColor: '#170202',
                  borderColor: '#ccc',
                  borderRadius: '5px',
                  padding: '5px',
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Custom Legend */}
          <div
            style={{
              fontSize: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginTop: '10px',
              maxWidth: '100%',
            }}
          >
            {dataWithPercentages.map((item, index) => (
              <div
                key={`legend-item-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  margin: '5px 10px',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: COLORS[index % COLORS.length],
                    marginRight: '5px',
                  }}
                ></div>
                <span>{`${item.id}: ${item.percentage}%`}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
