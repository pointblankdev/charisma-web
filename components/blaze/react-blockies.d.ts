declare module 'react-blockies' {
    import { ComponentType } from 'react';

    interface BlockiesProps {
        seed: string;
        size?: number;
        scale?: number;
        color?: string;
        bgColor?: string;
        spotColor?: string;
        className?: string;
    }

    const Blockies: ComponentType<BlockiesProps>;
    export default Blockies;
}