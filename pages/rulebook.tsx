import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import {
    AlertCircle, Shield, Zap, Coins, Award,
    BookOpen, Lock, Gauge, Crown,
    LucideIcon,
    Bird,
    Bot,
    BatteryCharging,
    Snowflake,
    Dog
} from "lucide-react";
import Page from "@components/page";
import { cn } from "@lib/utils";

function InfoCard({
    icon: Icon,
    title,
    items,
    className = "",
    content
}: {
    icon: LucideIcon;
    title: string;
    items?: string[];
    className?: string;
    content?: React.ReactNode;
}) {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-xl border bg-card p-6",
            "transition-all hover:shadow-md",
            className
        )}>
            <div className="flex items-center gap-4 mb-4">
                <div className="rounded-lg border bg-accent-foreground p-2">
                    <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-semibold">{title}</h4>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
                {items?.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-foreground/20 shrink-0" />
                        {item}
                    </li>
                ))}
            </ul>
            {content && (
                <div className="mt-4">
                    {content}
                </div>
            )}
            <div className="absolute right-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
            <div className="absolute bottom-0 right-0 h-px w-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
        </div>
    );
}

export default function RulebookPage() {
    const meta = {
        title: 'Charisma | Rulebook',
        description: 'The central security and orchestration hub of the Charisma protocol.',
        image: 'https://charisma.rocks/governance/gorge1.png'
    };

    return (
        <Page meta={meta} fullViewport>
            <div className="container mx-auto py-8 px-4">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold">Charisma Rulebook</h1>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            The central security and orchestration hub of the Charisma protocol,
                            managing all token operations through a sophisticated system of verified
                            interactions, multi-owner authorization, and dynamic modifications.
                        </p>
                    </div>

                    {/* Important Alert */}
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription className="space-y-2">
                            <p>
                                All token operations in Charisma are governed by the Rulebook. Understanding
                                these rules is crucial for:
                            </p>
                            <ul className="list-disc pl-4">
                                <li>Optimizing your earnings through NFT bonuses</li>
                                <li>Avoiding token loss due to capacity limits</li>
                                <li>Understanding operation flow and security measures</li>
                            </ul>
                        </AlertDescription>
                    </Alert>

                    {/* Main Content Tabs */}
                    <Tabs defaultValue="overview" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="tokens">Token Rules</TabsTrigger>
                            <TabsTrigger value="bonuses">Bonuses</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab Content */}
                        <TabsContent value="overview">
                            <div className="grid gap-6">
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold">What is the Rulebook?</h2>
                                    <p className="text-muted-foreground">
                                        The Charisma Rulebook is the foundational layer of the protocol,
                                        ensuring all operations are secure, fair, and optimized through a sophisticated
                                        system of rules and modifications.
                                    </p>
                                </section>

                                <div className="grid gap-6 md:grid-cols-3">
                                    <InfoCard
                                        icon={BookOpen}
                                        title="Core Functions"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    At its heart, the Rulebook manages all token operations through a system of
                                                    verified interactions, ensuring that every operation follows protocol rules
                                                    while enabling complex GameFi mechanics.
                                                </p>
                                                <p>
                                                    The contract applies dynamic modifications through its status effects system,
                                                    allowing for flexible adjustments to operations based on NFT ownership,
                                                    protocol conditions, and other factors.
                                                </p>
                                                <p>
                                                    Through its multi-owner authorization system, the Rulebook maintains
                                                    high security standards while remaining adaptable to the protocol's needs.
                                                </p>
                                            </div>
                                        }
                                    />

                                    <InfoCard
                                        icon={Zap}
                                        title="Operation Flow"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    Every token operation in Charisma follows a carefully designed flow to ensure
                                                    security and proper modification application. The process begins when a
                                                    whitelisted contract initiates a token operation.
                                                </p>
                                                <p>
                                                    Before execution, the operation passes through the Status Effects contract,
                                                    where NFT bonuses and protocol conditions modify the operation parameters.
                                                    Finally, operation limits are enforced before the token contract executes
                                                    the modified operation.
                                                </p>
                                            </div>
                                        }
                                    />
                                    <InfoCard
                                        icon={Lock}
                                        title="Key Features"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    The Rulebook implements a multi-layered security architecture that protects
                                                    both users and the protocol. This includes distributed control through
                                                    multi-owner authorization and a robust system of operation limits.
                                                </p>
                                                <p>
                                                    Dynamic NFT-based bonuses provide flexible benefits to users, while
                                                    the extensible modification system allows the protocol to evolve and
                                                    adapt to new requirements.
                                                </p>
                                            </div>
                                        }
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* Token Rules Tab */}
                        <TabsContent value="tokens">
                            <div className="grid gap-6">
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold">Token Operations & Limits</h2>
                                    <p className="text-muted-foreground">
                                        The Charisma protocol manages three primary tokens, each with specific
                                        operation limits and rules to ensure protocol stability and fairness.
                                    </p>
                                </section>

                                <section className="grid gap-6 md:grid-cols-3">
                                    <InfoCard
                                        icon={Award}
                                        title="Experience Token (XP)"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    Experience tokens represent a user's progress within the Charisma ecosystem.
                                                    As a non-transferable token, XP can only be earned through active participation
                                                    and verified interactions within the protocol.
                                                </p>
                                                <p>
                                                    The protocol allows for rewards of up to 1,000 XP tokens per operation,
                                                    providing substantial room for progression while maintaining system stability.
                                                    Similarly, punishment operations can remove up to 1,000 XP tokens, serving
                                                    as a balancing mechanism for the ecosystem.
                                                </p>
                                                <p>
                                                    Unlike other tokens in the system, XP has no maximum supply limit,
                                                    allowing for unlimited growth potential as users engage with the protocol.
                                                    This design encourages long-term participation while maintaining fair
                                                    progression mechanics.
                                                </p>
                                            </div>
                                        }
                                    />

                                    <InfoCard
                                        icon={Zap}
                                        title="Energy Token"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    Energy serves as the primary utility token within Charisma, powering
                                                    various protocol operations and interactions. Each user starts with a
                                                    base storage capacity of 100 energy, which can be increased through
                                                    Memobot ownership.
                                                </p>
                                                <p>
                                                    Operations involving energy are carefully regulated, with both energize
                                                    and exhaust operations limited to 1,000 energy per transaction. This
                                                    limit helps prevent exploitation while providing sufficient flexibility
                                                    for normal protocol operations.
                                                </p>
                                                <p>
                                                    The energy system becomes particularly powerful when combined with NFT
                                                    bonuses. Memobot owners receive +10 energy capacity per NFT, while
                                                    Welsh NFTs can provide generation bonuses of up to 100%. These bonuses
                                                    are applied before capacity limits, ensuring optimal benefit from
                                                    your NFT holdings.
                                                </p>
                                            </div>
                                        }
                                    />

                                    <InfoCard
                                        icon={Crown}
                                        title="Governance Token (DMG)"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    The DMG token represents governance rights within the Charisma protocol.
                                                    As the most carefully regulated token, all DMG operations are limited
                                                    to 100 tokens per transaction and are protected by multi-owner
                                                    authorization requirements.
                                                </p>
                                                <p>
                                                    Token holders can participate in governance by locking their DMG,
                                                    which provides voting power proportional to the amount locked. The
                                                    lock/unlock mechanism is also limited to 100 DMG per operation,
                                                    ensuring gradual and controlled changes to voting power distribution.
                                                </p>
                                                <p>
                                                    Raven NFT holders receive special benefits when interacting with DMG,
                                                    particularly in the form of reduced burn fees. Higher tier Ravens
                                                    provide larger fee reductions, creating an ecosystem where governance
                                                    participation becomes more efficient with strategic NFT ownership.
                                                </p>
                                            </div>
                                        }
                                    />
                                </section>
                            </div>
                        </TabsContent>

                        {/* Bonuses Tab */}
                        <TabsContent value="bonuses">
                            <div className="grid gap-6">
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold">NFT Benefits & Bonuses</h2>
                                    <p className="text-muted-foreground">
                                        The Charisma protocol features an extensive NFT benefits system where different
                                        collections provide unique advantages to their holders. These benefits are
                                        automatically applied through the Status Effects contract before operation
                                        limits are enforced.
                                    </p>
                                </section>

                                <div className="grid gap-6 md:grid-cols-2">

                                    {/* Memobot Collection */}
                                    <section className="space-y-6">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <Bot className="h-5 w-5" />
                                            Memobot Collection
                                        </h3>
                                        <InfoCard
                                            icon={BatteryCharging}
                                            title="Energy Storage Boost"
                                            content={
                                                <div className="space-y-4 text-sm text-muted-foreground">
                                                    <p>
                                                        Memobots are unique in the Charisma ecosystem as they directly increase
                                                        your energy storage capacity. Each Memobot owned adds 10 energy to your
                                                        maximum storage capacity, on top of the base 100 energy available to all users.
                                                    </p>
                                                    <p>
                                                        There's no limit to how many Memobots you can own, allowing for
                                                        substantial capacity increases. This bonus is always active and doesn't
                                                        require any special activation or maintenance.
                                                    </p>
                                                    <p>
                                                        The capacity increase is particularly valuable when combined with Welsh NFT
                                                        generation bonuses, as it allows you to store more of the additional
                                                        energy you generate.
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </section>

                                    {/* Raven Collection */}
                                    <section className="space-y-6">
                                        <h3 className="text-xl font-semibold flex items-center gap-2">
                                            <Bird className="h-5 w-5" />
                                            Raven Collection
                                        </h3>
                                        <InfoCard
                                            icon={Snowflake}
                                            title="Burn Reduction"
                                            content={
                                                <div className="space-y-4 text-sm text-muted-foreground">
                                                    <p>
                                                        Ravens provide the powerful benefit of reducing all protocol token
                                                        burn fees. Higher tier Ravens offer larger fee reductions, but only
                                                        the highest tier Raven provides the reduction. It's effects won't stack
                                                        with additional Ravens.
                                                    </p>
                                                    <p>
                                                        This reduction applies automatically to all burn operations, making Ravens
                                                        particularly valuable for users who frequently interact with GameFi mechanics
                                                        and reward systems that require burning energy or Charisma Governance (DMG) tokens.
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </section>
                                </div>

                                {/* Welsh Collection */}
                                <section className="space-y-6">
                                    <h3 className="text-xl font-semibold flex items-center gap-2">
                                        <Dog className="h-5 w-5" />
                                        Welsh Collection
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <InfoCard
                                            icon={Award}
                                            title="Happy Welsh"
                                            content={
                                                <div className="space-y-4 text-sm text-muted-foreground">
                                                    <p>
                                                        The flagship collection of the Welsh ecosystem provides the highest
                                                        energy generation bonus at 25%. This bonus applies to all energy
                                                        generation operations and is configurable by protocol governance.
                                                    </p>
                                                    <p>
                                                        Holding just one Happy Welsh NFT is sufficient to receive the full
                                                        bonus, making it an excellent entry point for new users looking to
                                                        optimize their energy generation.
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <InfoCard
                                            icon={Award}
                                            title="Weird Welsh"
                                            content={
                                                <div className="space-y-4 text-sm text-muted-foreground">
                                                    <p>
                                                        The Weird Welsh collection offers a 15% energy generation bonus,
                                                        complementing other Welsh NFT bonuses. This collection is particularly
                                                        valuable for users looking to build a diversified portfolio of
                                                        generation bonuses.
                                                    </p>
                                                    <p>
                                                        The bonus stacks with other Welsh collections up to the maximum
                                                        combined bonus cap of 100%.
                                                    </p>
                                                </div>
                                            }
                                        />
                                        <InfoCard
                                            icon={Award}
                                            title="Welsh Punk"
                                            content={
                                                <div className="space-y-4 text-sm text-muted-foreground">
                                                    <p>
                                                        Welsh Punk NFTs provide a 10% energy generation bonus. While this is
                                                        the smallest bonus in the Welsh ecosystem, it offers an accessible
                                                        entry point for new users and can be effectively combined with other
                                                        Welsh NFTs.
                                                    </p>
                                                </div>
                                            }
                                        />
                                    </div>
                                </section>
                            </div>
                        </TabsContent>

                        {/* Security Tab */}
                        <TabsContent value="security">
                            <div className="grid gap-6">
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-bold">Security Architecture</h2>
                                    <p className="text-muted-foreground">
                                        The Charisma Rulebook implements a multi-layered security architecture to protect
                                        both users and the protocol. This comprehensive approach ensures resilience against
                                        exploits while maintaining operational flexibility.
                                    </p>
                                </section>

                                <section className="grid gap-6 md:grid-cols-2">
                                    <InfoCard
                                        icon={Lock}
                                        title="DAO Gatekeeper"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    At the core of Charisma's security is the Rulebook's role as the primary
                                                    gatekeeper for DAO operations. Rather than granting powerful extension
                                                    permissions to new contracts, the Rulebook acts as a secure filter,
                                                    intercepting and validating all token operations.
                                                </p>
                                                <p>
                                                    This architecture significantly reduces the security surface area by
                                                    eliminating the need to grant broad extension permissions to new
                                                    contracts. Instead, contracts only need to be verified by the Rulebook,
                                                    which then manages their interactions with the core DAO functionality
                                                    through its comprehensive rule system.
                                                </p>
                                                <p>
                                                    The Rulebook's verification system provides fine-grained control over
                                                    which operations each contract can perform, ensuring that even verified
                                                    contracts can only execute operations within their intended scope. This
                                                    creates a robust security model where the attack surface remains minimal
                                                    regardless of how many new contracts are added to the ecosystem.
                                                </p>
                                            </div>
                                        }
                                        className="border-secondary/10 bg-secondary/5"
                                    />

                                    <InfoCard
                                        icon={Shield}
                                        title="Interaction Verification"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    The protocol maintains a strict whitelist of verified interactions for contracts
                                                    that require DAO-level permissions to execute token operations. This primarily
                                                    includes GameFi mechanics that need to reward or punish users, such as energy
                                                    generation engines and gameplay systems.
                                                </p>
                                                <p>
                                                    By routing these operations through the Rulebook's verification system,
                                                    we ensure that even contracts with powerful capabilities can only execute
                                                    operations within their intended scope. Each operation automatically
                                                    benefits from the Rulebook's modification system, applying relevant NFT
                                                    bonuses and protocol conditions.
                                                </p>
                                                <p>
                                                    This architecture allows for the safe addition of new GameFi mechanics
                                                    without compromising security. Rather than granting broad permissions,
                                                    new contracts simply need verification for specific operations, maintaining
                                                    a minimal attack surface while enabling complex gameplay features.
                                                </p>
                                            </div>
                                        }
                                        className="border-secondary/10 bg-secondary/5"
                                    />

                                    <InfoCard
                                        icon={Gauge}
                                        title="Operation Limits"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    Every token operation in the protocol is subject to strict limits
                                                    that are automatically enforced by the Rulebook. These limits are
                                                    configurable per operation type, allowing for fine-tuned control
                                                    over protocol behavior while preventing potential exploits.
                                                </p>
                                                <p>
                                                    The limit system includes hard caps on token operations, such as
                                                    the 1,000 token limit for XP and energy operations, and the more
                                                    restrictive 100 token limit for DMG operations. These limits are
                                                    adjustable by protocol owners, enabling the system to adapt to
                                                    changing requirements.
                                                </p>
                                                <p>
                                                    In addition to standard limits, the protocol includes emergency
                                                    controls that allow for immediate response to potential security
                                                    threats. These include the ability to disable specific operations
                                                    and implement circuit breaker functionality when needed.
                                                </p>
                                            </div>
                                        }
                                        className="border-secondary/10 bg-secondary/5"
                                    />

                                    <InfoCard
                                        icon={AlertCircle}
                                        title="Status Effect System"
                                        content={
                                            <div className="space-y-4 text-sm text-muted-foreground">
                                                <p>
                                                    The Status Effect system serves as a secure middleware layer,
                                                    intercepting and modifying token operations based on protocol
                                                    conditions, NFT ownership, and other states. This system ensures
                                                    that all modifications follow protocol rules while enabling
                                                    complex gameplay mechanics.
                                                </p>
                                                <p>
                                                    All modifications are applied in a specific order: first retrieving
                                                    the base amount, then applying NFT-based modifications, and finally
                                                    enforcing protocol-wide limits. This ordered approach ensures
                                                    consistent and predictable operation behavior.
                                                </p>
                                                <p>
                                                    The system is designed to be extensible, allowing new effects to
                                                    be added while maintaining security through strict access controls
                                                    and owner-managed configuration. All modification functions are
                                                    read-only, preventing unauthorized state changes during calculations.
                                                </p>
                                            </div>
                                        }
                                        className="border-secondary/10 bg-secondary/5"
                                    />
                                </section>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </Page>
    );
}