import Image from 'next/image';
import { Button } from '@components/ui/button';
import { BRAND_NAME } from '@lib/constants';
import charisma from '@public/charisma.png';
import charismaFloating from '@public/sip9/pills/cha-floating.gif';
import { cn } from '@lib/utils';
import styleUtils from '@components/utils.module.css';

export default function HeroSection() {
    return (
        <div className="relative overflow-hidden bg-background/10 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-24 sm:py-32">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 items-center">
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center gap-3">
                            <Image
                                src={charisma}
                                alt="Charisma Logo"
                                width={50}
                                height={50}
                                className={cn(styleUtils.appear, styleUtils['appear-first'])}
                            />
                            <h1 className={cn("text-4xl sm:text-5xl font-bold tracking-tight", styleUtils.appear, styleUtils['appear-second'])}>
                                {BRAND_NAME}
                            </h1>
                        </div>

                        <p className={cn("text-xl text-muted-foreground max-w-lg", styleUtils.appear, styleUtils['appear-third'])}>
                            The next generation of decentralized finance tools and services
                            for bitcoin developers and users.
                        </p>

                        <div className={cn("flex flex-wrap gap-4 pt-2", styleUtils.appear, styleUtils['appear-fourth'])}>
                            <Button size="lg" asChild>
                                <a href="#product-suite">Explore Services</a>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <a href="https://docs.charisma.rocks" target="_blank" rel="noopener noreferrer">
                                    Read Documentation
                                </a>
                            </Button>
                        </div>
                    </div>

                    <div className={cn("hidden md:flex justify-end items-center", styleUtils.appear, styleUtils['appear-fifth'])}>
                        <div className="relative w-full h-[400px] pointer-events-none">
                            <div className="absolute inset-0 bg-gradient-radial from-primary/20 to-transparent rounded-full opacity-70 animate-pulse-slow blur-2xl" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Image
                                    src={charismaFloating}
                                    alt="Charisma Illustration"
                                    width={300}
                                    height={300}
                                    className="w-64 h-64 object-contain"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative shape */}
            {/* <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-background/10 backdrop-blur-sm" /> */}
        </div>
    );
} 