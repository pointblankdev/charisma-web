import { useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import * as d3 from 'd3';
import { Dexterity, Token } from 'dexterity-sdk';

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


    // Transform paths into graph data
    const graphData = useMemo(() => {
        const nodes = new Map();
        const links: Array<{ source: string, target: string, color: string, width: number }> = [];

        // Add source and target nodes
        nodes.set(fromToken.contractId, {
            id: fromToken.contractId,
            image: fromToken.image,
            name: fromToken.symbol,
            color: '#c1121f', // red
            val: 20 // larger node
        });

        nodes.set(toToken.contractId, {
            id: toToken.contractId,
            image: toToken.image,
            name: toToken.symbol,
            color: '#00AA00', // green
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
    }, [fromToken, toToken, currentPath]);

    return (
        <div className="fixed inset-0 w-screen h-screen bg-black/5 z-50" onClick={() => setShowGraph(false)}>
            <ForceGraph2D
                graphData={graphData}
                width={window.innerWidth}
                height={window.innerHeight}
                nodeLabel={(node: any) => {
                    const routerNode = Dexterity.router.nodes.get(node.id);
                    const token = routerNode?.token as Token
                    const vaults = Array.from(Dexterity.getVaultsForToken(token.contractId).values());

                    return `
                        <div style="
                            background: linear-gradient(180deg, rgba(17, 17, 27, 0.95) 0%, rgba(17, 17, 27, 0.98) 100%);
                            padding: 16px;
                            border-radius: 12px;
                            font-size: 13px;
                            color: rgba(255, 255, 255, 0.95);
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                            position: relative;
                            overflow: hidden;
                        ">
                            <div style="
                                display: flex;
                                gap: 16px;
                                padding-bottom: 12px;
                                margin-bottom: 12px;
                                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                            ">
                                <div style="
                                    width: 48px;
                                    height: 48px;
                                    background-image: url('${token.image}');
                                    background-size: cover;
                                    background-position: center;
                                    border-radius: 8px;
                                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                                "></div>
                                <div style="flex: 1;">
                                    <div style="
                                        font-size: 18px;
                                        font-weight: 600;
                                        margin-bottom: 4px;
                                    ">${token.name}</div>
                                    <div style="
                                        display: flex;
                                        gap: 16px;
                                        color: rgba(255, 255, 255, 0.7);
                                        font-size: 12px;
                                    ">
                                        <div>Symbol: ${token.symbol}</div>
                                        ${token.decimals ? `<div>Decimals: ${token.decimals}</div>` : ''}
                                        ${token.supply ? `<div>Supply: ${Number(token.supply).toLocaleString()}</div>` : ''}
                                    </div>
                                    <div style="
                                        font-size: 11px;
                                        color: rgba(255, 255, 255, 0.5);
                                        margin-top: 4px;
                                    ">${token.contractId}</div>
                                </div>
                            </div>

                            ${vaults.length > 0 ? `
                                <div style="margin-top: 12px;">
                                    <div style="
                                        font-weight: 600;
                                        margin-bottom: 12px;
                                        font-size: 13px;
                                        color: #ffd700;
                                        letter-spacing: 0.05em;
                                    ">Dexterity Vaults</div>
                                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                                        ${vaults.map(vault => `
                                            <div style="
                                                background: linear-gradient(to bottom, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.90)),
                                                            url('${vault.getPool().image}') center/cover;
                                                padding: 16px;
                                                border-radius: 8px;
                                                position: relative;
                                                backdrop-filter: blur(10px);
                                                min-width: 240px;
                                            ">
                                                <div style="
                                                    font-weight: 500;
                                                    color: #38bdf8;
                                                    font-size: 14px;
                                                    margin-bottom: 8px;
                                                    display: flex;
                                                    justify-content: space-between;
                                                    align-items: center;
                                                ">
                                                    <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">${vault.getPool().name}</span>
                                                    <span style="
                                                        font-size: 11px;
                                                        color: #94a3b8;
                                                        background: rgba(148, 163, 184, 0.1);
                                                        padding: 4px 8px;
                                                        border-radius: 12px;
                                                        white-space: nowrap;
                                                    ">Fee: ${(vault.getPool().fee / 1000000 * 100).toFixed(2)}%</span>
                                                </div>
                                                ${vault.getPool().liquidity.map(token => `
                                                    <div style="
                                                        display: flex;
                                                        justify-content: space-between;
                                                        align-items: center;
                                                        padding: 8px;
                                                        background: rgba(255, 255, 255, 0.03);
                                                        margin-top: 8px;
                                                        border-radius: 6px;
                                                    ">
                                                        <span style="color: #94a3b8;">${token.symbol}</span>
                                                        <span style="
                                                            color: #e2e8f0;
                                                            font-family: 'SF Mono', monospace;
                                                        ">${(token.reserves / Math.pow(10, token.decimals)).toLocaleString()}</span>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    `;
                }}
                nodeRelSize={1.5}
                linkCurvature={0.5}
                backgroundColor="transparent"
                cooldownTicks={150}
                d3VelocityDecay={0.999}
                nodeCanvasObject={(node: any, ctx: any, globalScale: number) => {
                    const size = 4;
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

            />
        </div>
    );
} 