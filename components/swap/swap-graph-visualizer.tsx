import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Dexterity, Route, Token } from 'dexterity-sdk';
import { Ysabeau_Infant } from 'next/font/google';

const font = Ysabeau_Infant({ subsets: ['latin'] });
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
    ssr: false
});

interface SwapGraphVisualizerProps {
    fromToken: any;
    toToken: any;
    paths: Token[][];
    currentPath: Route;
    setShowGraph: (show: boolean) => void;
}

export function SwapGraphVisualizer({ fromToken, toToken, paths, currentPath, setShowGraph }: SwapGraphVisualizerProps) {


    // Transform paths into graph data
    const graphData = useMemo(() => {
        const nodes = new Map();
        const links: Array<{ source: string, target: string, color: string, width: number }> = [];

        // Process all paths
        paths.reverse().forEach((path, j) => {
            path.forEach((hop, i) => {
                if (!nodes.has(hop.contractId)) {
                    nodes.set(hop.contractId, {
                        image: hop.image,
                        id: hop.contractId,
                        name: hop.symbol,
                        color: '#000000', // gray for intermediate nodes
                        val: 15
                    });
                    nodes.set(hop.contractId, {
                        image: hop.image,
                        id: hop.contractId,
                        name: hop.symbol,
                        color: '#000000', // gray for intermediate nodes
                        val: 15
                    });

                    // links.push({
                    //     source: hop.contractId,
                    //     target: hop.contractId,
                    //     color: '#333333',
                    //     width: 1
                    // });
                }

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
        <div className="fixed inset-0 w-2 h-2 bg-black/50 z-50" onClick={() => setShowGraph(false)}>
            <ForceGraph2D
                graphData={graphData}
                width={window.outerWidth}
                height={window.outerHeight}
                nodeLabel={(node: any) => {
                    const routerNode = Dexterity.router.nodes.get(node.id);
                    const token = routerNode?.token as Token
                    const vaults = Array.from(Dexterity.getVaultsForToken(token.contractId).values());

                    return `
                        <div class="${font.className} w-auto" style="
                            padding: 16px;
                            font-size: 13px;
                            position: relative;
                            overflow: hidden;
                            background: linear-gradient(to bottom, hsl(var(--accent-foreground) / 0.99), hsl(var(--accent-foreground) / 0.95)),
                                        url('${token.image}') center/cover;
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
                                        overflow: hidden;
                                        text-overflow: ellipsis;
                                        white-space: nowrap;
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
                                    <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 12px;));">
                                        ${vaults.map(vault => `
                                            <div class="border border-b-0 border-x-0 border-t-[var(--accents-7)]" style="
                                                background: url('${vault.image}') center/cover;
                                                padding: 16px;
                                                opacity: 0.9;
                                                border-radius: 12px;
                                                position: relative;
                                                min-width: 120px;
                                                min-height: 120px;
                                            ">

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