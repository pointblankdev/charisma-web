import { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as d3 from 'd3';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false
});

interface SwapGraphVisualizerProps {
    fromToken: any;
    toToken: any;
    paths: any[][];
    currentPath: any[];
    setShowGraph: (show: boolean) => void;
}

export function SwapGraphVisualizer({ fromToken, toToken, paths, currentPath, setShowGraph }: SwapGraphVisualizerProps) {
    const graphRef = useRef<any>();

    // Transform paths into graph data
    const graphData = useMemo(() => {
        const nodes = new Map();
        const links: Array<{ source: string, target: string, color: string, width: number }> = [];

        // Add source and target nodes
        nodes.set(fromToken.contractId, {
            id: fromToken.contractId,
            image: fromToken.image,
            name: fromToken.symbol,
            color: '#4ade80', // green
            val: 20 // larger node
        });

        nodes.set(toToken.contractId, {
            id: toToken.contractId,
            image: toToken.image,
            name: toToken.symbol,
            color: '#c1121f', // red
            val: 20
        });

        // Process all paths
        paths.forEach(path => {
            path.forEach((token, i) => {
                if (!nodes.has(token.contractId)) {
                    nodes.set(token.contractId, {
                        image: token.image,
                        id: token.contractId,
                        name: token.symbol,
                        color: '#000000', // gray for intermediate nodes
                        val: 15
                    });
                }

                if (i > 0) {
                    const source = path[i - 1].contractId;
                    const target = token.contractId;
                    const isOptimal = currentPath.some((t, idx) =>
                        idx > 0 &&
                        currentPath[idx - 1].contractId === source &&
                        t.contractId === target
                    );

                    links.push({
                        source,
                        target,
                        color: isOptimal ? '#3b82f6' : '#374151',
                        width: isOptimal ? 20 : 1
                    });
                }
            });
        });

        return {
            nodes: Array.from(nodes.values()),
            links
        };
    }, [fromToken, toToken, paths, currentPath]);

    useEffect(() => {
        const initGraph = () => {
            if (graphRef.current && graphRef.current.d3Force) {
                graphRef.current.d3Force('charge', d3.forceManyBody().strength(-500));
                graphRef.current.d3Force('link', d3.forceLink().distance(200));
                graphRef.current.d3Force('center', d3.forceCenter().strength(0.03));
                graphRef.current.zoomToFit(100);
            }
        };

        // Try immediately
        initGraph();

        // Also try after a delay as fallback
        const timer = setTimeout(initGraph, 500);

        return () => clearTimeout(timer);
    }, [graphData]);

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black/5 z-50" onClick={() => setShowGraph(false)}>
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                width={window.innerWidth}
                height={window.innerHeight}
                nodeLabel={(node: any) => `
                    <div style="
                        background: rgb(17, 17, 27);
                        padding: 12px;
                        border-radius: 8px;
                        font-size: 14px;
                        color: rgba(255, 255, 255, 0.95);
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        min-width: 120px;
                    ">
                        <div style="
                            width: 24px;
                            height: 24px;
                            border-radius: 9999px;
                            background-image: url('${node.image}');
                            background-size: cover;
                            background-position: center;
                        "></div>
                        <div style="
                            display: flex;
                            flex-direction: column;
                            gap: 2px;
                        ">
                            <div style="font-weight: 500;">${node.name}</div>
                        </div>
                    </div>
                `}
                nodeRelSize={1.5}
                linkCurvature={0}
                backgroundColor="transparent"
                cooldownTicks={150}
                d3VelocityDecay={0.999}
                nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
                    const size = 12;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                    ctx.fillStyle = 'white';
                    ctx.fill();

                    // Draw token image if available
                    const img = new Image();
                    img.src = node.image;
                    ctx.save();
                    ctx.clip();
                    ctx.drawImage(img, node.x - size, node.y - size, size * 2, size * 2);
                    ctx.restore();

                    // Draw border
                    ctx.strokeStyle = node.color;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }}
                linkDirectionalParticles={1}
                linkDirectionalParticleWidth={5}
                linkColor={() => '#c1121f'}

            />
        </div>
    );
} 