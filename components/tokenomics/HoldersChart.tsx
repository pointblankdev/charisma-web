import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { AxisOptions } from 'react-charts';

const Chart: any = dynamic(() => import('react-charts').then(mod => mod.Chart), {
  ssr: false
});

type ChartData = {
  label: string;
  data: {
    primary: string | number | Date | null;
    secondary: number | null;
    radius?: number | undefined;
  }[];
}[];

type Props = {
  data: ChartData;
};

export default function HoldersChart({ data }: Props) {
  data[0].label = 'Charisma Tokens';

  const primaryAxis = useMemo<AxisOptions<typeof data[number]['data'][number]>>(
    () => ({ position: 'bottom', getValue: datum => datum.primary }),
    []
  );
  const secondaryAxes = useMemo<AxisOptions<typeof data[number]['data'][number]>[]>(
    () => [{ position: 'left', getValue: datum => datum.secondary }],
    []
  );

  return (
    <Chart
      className="hidden xl:block"
      height={1600}
      options={{
        defaultColors: ['#c1121f'],
        data,
        primaryAxis,
        secondaryAxes,
        dark: true
      }}
    />
  );
}
