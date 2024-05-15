import { useEffect, useState } from 'react';
import { getContractSource } from '../lib/stacks-api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import SyntaxHighlighter from 'react-syntax-highlighter';
import SearchBar from '@components/search-bar';
import dynamic from 'next/dynamic';

const ForceGraph3D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph3D), { ssr: false }) as any;

const primaryColor = '#c1121f'; // Replace with your primary color HSL value
const primaryForegroundColor = '#c1121f'; // Replace with your primary foreground color HSL value

const IndexPage = () => {
    const [data, setData] = useState({ nodes: [], links: [] });
    const [hoveredNode, setHoveredNode] = useState(null);

    const handleSearch = async (contractPrincipal: string) => {
        const [contractAddress, contractName] = contractPrincipal.split('.')
        const contract = await getContractSource({ contractAddress, contractName });
        console.log(contract)
    };

    useEffect(() => {
        handleSearch('SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.dungeon-master').then(console.log);
    }, []);

    return (
        <div className='relative'>
            <h1 className="text-4xl font-bold text-center m-4 bg-transparent absolute top-0 h-12 z-10">Stacks Smart Contract Explorer</h1>
            <div className='absolute top-12 z-10'>

                <SearchBar onSearch={handleSearch} />
            </div>
            <TooltipProvider>
                <div className="flex justify-center relative">
                    <ForceGraph3D
                        style={{ height: '80vh', width: '100%' }}
                        graphData={genRandomTree(40)}
                        linkDirectionalArrowLength={3.5}
                        linkDirectionalArrowRelPos={1}
                        linkCurvature={0.25}
                        nodeColor={(node: any) => (node === hoveredNode ? primaryColor : primaryForegroundColor)}
                    />
                </div>
            </TooltipProvider>
        </div>
    );
};

export default IndexPage;

function genRandomTree(N = 300, reverse = false) {
    return {
        nodes: [...Array(N).keys()].map(i => ({ id: i })),
        links: [...Array(N).keys()]
            .filter(id => id)
            .map(id => ({
                [reverse ? 'target' : 'source']: id,
                [reverse ? 'source' : 'target']: Math.round(Math.random() * (id - 1))
            }))
    };
}