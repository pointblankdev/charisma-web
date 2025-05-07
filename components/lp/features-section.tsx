import { cn } from '@lib/utils';
import styleUtils from '@components/utils.module.css';
import { ArrowRight, Code, Database, Globe, Shield } from 'lucide-react';

const features = [
    {
        icon: <Shield className="w-10 h-10 text-primary" />,
        title: 'Security First',
        description: 'All services built with industry-leading security practices and rigorous testing.',
    },
    {
        icon: <Database className="w-10 h-10 text-primary" />,
        title: 'High Performance',
        description: 'Optimized infrastructure with blazingly fast response times across all products.',
    },
    {
        icon: <Code className="w-10 h-10 text-primary" />,
        title: 'Developer Friendly',
        description: 'Comprehensive APIs and SDKs designed for seamless integration.',
    },
    {
        icon: <Globe className="w-10 h-10 text-primary" />,
        title: 'Global Ecosystem',
        description: 'Connect with services and solutions built for worldwide accessibility.',
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-20 bg-background/10 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Why Choose Charisma</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        From DeFi to developer tools, our platform delivers the
                        reliability and performance needed for blockchain innovation.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={cn(
                                "flex flex-col p-6 rounded-lg border border-muted-foreground/10 bg-card/30 backdrop-blur-md shadow-sm hover:shadow-md transition-all hover:bg-card/40",
                                styleUtils.appear,
                                styleUtils[`appear-${index + 2}`]
                            )}
                        >
                            <div className="mb-4">{feature.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-muted-foreground flex-1">{feature.description}</p>
                            <div className="mt-4">
                                <a href="#learn-more" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                                    Learn more <ArrowRight className="ml-1 h-3 w-3" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
} 