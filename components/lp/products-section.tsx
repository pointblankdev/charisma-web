import { APPS, AppInfo } from '@lib/apps';
import { Button } from '@components/ui/button';
import { cn } from '@lib/utils';
import Image from 'next/image';
import {
    ArrowRightIcon,
    BarChart2Icon,
    DatabaseIcon,
    GlobeIcon,
    LayoutGridIcon,
    RefreshCwIcon,
    SearchIcon,
    ServerIcon,
    ShieldIcon,
    ArrowDownUpIcon,
    NewspaperIcon,
    RocketIcon,
    BoxIcon,
    CodeIcon
} from 'lucide-react';

// Icon mapping based on app title keywords
const getAppIcon = (app: AppInfo) => {
    const title = app.title.toLowerCase();

    if (title.includes('blog')) return <NewspaperIcon className="h-4 w-4" />;
    if (title.includes('admin')) return <LayoutGridIcon className="h-4 w-4" />;
    if (title.includes('cache')) return <DatabaseIcon className="h-4 w-4" />;
    if (title.includes('meme') || title.includes('roulette')) return <RefreshCwIcon className="h-4 w-4" />;
    if (title.includes('metadata')) return <ServerIcon className="h-4 w-4" />;
    if (title.includes('token')) return <BarChart2Icon className="h-4 w-4" />;
    if (title.includes('signer')) return <ShieldIcon className="h-4 w-4" />;
    if (title.includes('swap')) return <ArrowDownUpIcon className="h-4 w-4" />;
    if (title.includes('launchpad')) return <RocketIcon className="h-4 w-4" />;
    if (title.includes('search') || title.includes('contract')) return <SearchIcon className="h-4 w-4" />;

    // Default icon for any unmatched app
    return <BoxIcon className="h-6 w-6" />;
};

export default function ProductsSection() {
    return (
        <section id="product-suite" className="py-20 bg-card/10 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Explore Apps</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Our collection of specialized solutions for the blockchain ecosystem,
                        from high-performance data services to user-facing applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {APPS.filter(app => app.isProduct).map((app, index) => (
                        <ProductCard key={app.href} app={app} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function ProductCard({ app }: { app: AppInfo }) {
    return (
        <div className="flex flex-col group rounded-xl overflow-hidden bg-card/30 backdrop-blur-md border border-muted-foreground/10 shadow-sm hover:shadow-lg transition-all duration-300">
            {/* Card header/icon */}
            <div className="p-6 border-b border-muted-foreground/10 flex items-center justify-between">
                <h3 className="text-xl font-semibold">{app.title}</h3>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary shadow-sm group-hover:bg-primary/25 group-hover:scale-110 transition-all duration-300">
                    {app.image ? (
                        <Image
                            src={app.image}
                            alt={`${app.title} icon`}
                            width={28}
                            height={28}
                            className="h-6 w-6"
                        />
                    ) : (
                        getAppIcon(app)
                    )}
                </div>
            </div>

            {/* Card body */}
            <div className="flex flex-col flex-1 p-6 bg-card/10">
                <p className="text-muted-foreground mb-6 flex-1 leading-relaxed">
                    {app.description}
                </p>

                <Button
                    variant="outline"
                    asChild
                    className="group-hover:bg-primary/20 justify-start backdrop-blur-sm bg-background/40 border-muted-foreground/10 hover:text-foreground/90"
                    size="sm"
                >
                    <a
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center"
                    >
                        <span>Open {app.title}</span>
                        <ArrowRightIcon className="ml-2 h-4 w-4 opacity-70 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </a>
                </Button>
            </div>
        </div>
    );
} 