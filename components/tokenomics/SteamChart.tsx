import ResizableBox from "./ResizeableBox";
import useDemoConfig from "./useDemoConfig";
import { stackOffsetWiggle } from "d3-shape";
import React from "react";
import dynamic from 'next/dynamic';
import { AxisOptions } from "react-charts";

const Chart: any = dynamic(() => import("react-charts").then((mod) => mod.Chart), {
    ssr: false,
});
export default function SteamChart() {
    const { data, randomizeData } = useDemoConfig({
        series: 10,
        dataType: "time",
    });

    const primaryAxis = React.useMemo<
        AxisOptions<typeof data[number]["data"][number]>
    >(
        () => ({
            getValue: (datum) => datum.primary as Date,
        }),
        []
    );

    const secondaryAxes = React.useMemo<
        AxisOptions<typeof data[number]["data"][number]>[]
    >(
        () => [
            {
                getValue: (datum) => datum.secondary,
                elementType: "area",
                // or
                stacked: true,
                // stackOffset: stackOffsetWiggle,
            },
        ],
        []
    );


    console.log(data)

    return (
        <ResizableBox
            style={{
                background: "black",
                padding: ".5rem",
                borderRadius: "5px",
            }}>

            <Chart
                options={{
                    data: [{
                        data: [
                            { primary: new Date('8/8/2023'), radius: undefined, secondary: 0.002 },
                            { primary: new Date('8/9/2023'), radius: undefined, secondary: 0.003601 }
                        ], label: 'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS'
                    }],
                    primaryAxis,
                    secondaryAxes,

                    dark: true,

                    getSeriesStyle: () => ({
                        line: { opacity: 0 },
                        area: { opacity: 1 },
                    }),
                }}
            />
        </ResizableBox>
    );
}