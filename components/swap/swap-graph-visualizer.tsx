import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Dexterity, Token } from 'dexterity-sdk';
import { Ysabeau_Infant } from 'next/font/google';
import { MultiHop } from 'dexterity-sdk/dist/core/multihop';

const font = Ysabeau_Infant({ subsets: ['latin'] });
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false
});

interface SwapGraphVisualizerProps {
    fromToken: any;
    toToken: any;
    paths: MultiHop[];
    currentPath: MultiHop;
    setShowGraph: (show: boolean) => void;
}

export function SwapGraphVisualizer({ fromToken, toToken, paths, currentPath, setShowGraph }: SwapGraphVisualizerProps) {


    // Transform paths into graph data
    const graphData = useMemo(() => {
        const nodes = new Map();
        const links: Array<{ source: string, target: string, color: string, width: number }> = [];

        // Process all paths
        paths.reverse().forEach((path, j) => {
            path.hops.forEach((hop, i) => {
                if (!nodes.has(hop)) {
                    nodes.set(hop.tokenIn.contractId, {
                        image: hop.tokenIn.image,
                        id: hop.tokenIn.contractId,
                        name: hop.tokenIn.symbol,
                        color: '#000000', // gray for intermediate nodes
                        val: 15
                    });
                    nodes.set(hop.tokenOut.contractId, {
                        image: hop.tokenOut.image,
                        id: hop.tokenOut.contractId,
                        name: hop.tokenOut.symbol,
                        color: '#000000', // gray for intermediate nodes
                        val: 15
                    });

                    links.push({
                        source: hop.tokenIn.contractId,
                        target: hop.tokenOut.contractId,
                        color: '#333333',
                        width: 1
                    });
                }

                // const source = path.hops[i - 1]?.tokenIn.contractId;
                // const target = hop.tokenIn.contractId;
                // const isOptimal = currentPath.some((t, idx) =>
                //     idx > 0 &&
                //     currentPath[idx - 1].contractId === source &&
                //     t.contractId === target
                // );

                // links.push({
                //     source,
                //     target,
                //     color: isOptimal ? '#3b82f6' : '#374151',
                //     width: isOptimal ? 20 : 1
                // });

            });
        });



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
                        <div class="${font.className}" style="
                            padding: 16px;
                            font-size: 13px;
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
                                    width: 72px;
                                    height: 72px;
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
                                        margin-bottom: 2px;
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
                                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;));">
                                        ${vaults.map(vault => `
                                            <div class="border border-b-0 border-x-0 border-t-[var(--accents-7)]" style="
                                                background: linear-gradient(to bottom, hsl(var(--accent-foreground) / 0.95), hsl(var(--accent-foreground) / 0.9)),
                                                            url('${vault.image}') center/cover;
                                                padding: 16px;
                                                border-radius: 8px;
                                                position: relative;
                                                backdrop-filter: blur(10px);
                                                min-width: 240px;
                                            ">
                                                <div style="
                                                    font-weight: 500;
                                                    font-size: 14px;
                                                    margin-bottom: 8px;
                                                    display: flex;
                                                    justify-content: space-between;
                                                    align-items: center;
                                                ">
                                                    <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%;">${vault.name}</span>
                                                    <span style="
                                                        font-size: 11px;
                                                        color: #94a3b8;
                                                        background: rgba(148, 163, 184, 0.1);
                                                        padding: 4px 8px;
                                                        border-radius: 12px;
                                                        white-space: nowrap;
                                                    ">Fee: ${(vault.fee / 1000000 * 100).toFixed(2)}%</span>
                                                </div>
                                                <div style="
                                                    display: flex;
                                                    justify-content: space-between;
                                                    align-items: center;
                                                    padding: 8px;
                                                    background: rgba(255, 255, 255, 0.03);
                                                    margin-top: 8px;
                                                    border-radius: 6px;
                                                ">
                                                    <span style="color: #94a3b8;">${vault.tokenA.symbol}</span>
                                                    <span style="
                                                        color: #e2e8f0;
                                                        font-family: 'SF Mono', monospace;
                                                    ">${(vault.tokenA.reserves / Math.pow(10, vault.tokenA.decimals)).toLocaleString()}</span>
                                                </div>
                                                <div style="
                                                    display: flex;
                                                    justify-content: space-between;
                                                    align-items: center;
                                                    padding: 8px;
                                                    background: rgba(255, 255, 255, 0.03);
                                                    margin-top: 8px;
                                                    border-radius: 6px;
                                                ">
                                                    <span style="color: #94a3b8;">${vault.tokenB.symbol}</span>
                                                    <span style="
                                                        color: #e2e8f0;
                                                        font-family: 'SF Mono', monospace;
                                                    ">${(vault.tokenB.reserves / Math.pow(10, vault.tokenB.decimals)).toLocaleString()}</span>
                                                </div>
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