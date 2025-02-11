import { Card } from "@components/ui/card";
import { BarChart3, LucideIcon, Shield, Zap } from "lucide-react";

interface InfoCardProps {
    icon: LucideIcon;
    title: string;
    content: React.ReactNode;
}

export function InfoCard({ icon: Icon, title, content }: InfoCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background/0" />
            <div className="relative p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                </div>
                {content}
            </div>
        </Card>
    );
}


export function Features() {
    return (
        <div className="mb-12">

            <div className="grid gap-6 md:grid-cols-3 mt-6">
                <InfoCard
                    icon={Zap}
                    title="Blazing Fast"
                    content={
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                Experience the future of Bitcoin with instant transactions and low fees.
                                No more waiting for confirmations or paying gas fees - just seamless,
                                instant trading.
                            </p>
                        </div>
                    }
                />

                <InfoCard
                    icon={BarChart3}
                    title="DeFi & Trading"
                    content={
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                Access professional-grade DeFi tools and trading features with bitcoin finality.
                                Built for traders who demand speed and reliability.
                            </p>
                        </div>
                    }
                />

                <InfoCard
                    icon={Shield}
                    title="Bitcoin Security"
                    content={
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <p>
                                Built on Bitcoin, the world's strongest network. Your keys, your coins -
                                always in control with irreversible and immutable settlement.
                            </p>
                        </div>
                    }
                />
            </div>
        </div>
    );
}