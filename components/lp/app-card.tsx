import Image from 'next/image';
import { Button } from '@components/ui/button';
import { AppInfo } from '@lib/apps';
import { cn } from '@lib/utils';

interface Props {
    app: AppInfo;
}

export default function AppCard({ app }: Props) {
    return (
        <div
            className={cn(
                'flex flex-col rounded-lg border-muted-foreground/10 bg-card shadow-sm hover:shadow-lg transition-shadow',
            )}
        >
            {app.image ? (
                <div className="relative w-full h-40 overflow-hidden rounded-t-lg bg-muted/40">
                    <Image
                        src={app.image}
                        alt={`${app.title} logo`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-40 rounded-t-lg bg-muted/20 text-muted-foreground text-4xl font-semibold">
                    {app.title.charAt(0)}
                </div>
            )}
            <div className="flex-1 flex flex-col p-4">
                <h3 className="text-lg font-semibold mb-1">{app.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {app.description}
                </p>
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="mt-auto self-start"
                >
                    <a
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Visit →
                    </a>
                </Button>
            </div>
        </div>
    );
} 