import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { Coins, Users, LineChart, Info, Shield } from 'lucide-react';

const LaunchpadHeader = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Main Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Index Token & DEX Launchpad</h1>
        <p className="text-lg text-muted-foreground">
          Launch your own index token with built-in liquidity pool and adaptive fee structure
        </p>
      </div>

      {/* Key Benefits Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[var(--sidebar)]">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg">Protected LP</CardTitle>
            </div>
            <CardDescription>
              Higher initial fees protect early liquidity providers, adjustable as pool matures
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-[var(--sidebar)]">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg">Community Owned</CardTitle>
            </div>
            <CardDescription>
              All fees flow directly to LP token holders - creating true decentralized ownership
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-[var(--sidebar)]">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg">Index Creation</CardTitle>
            </div>
            <CardDescription>
              Combine tokens into index products with built-in liquidity and earning mechanics
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-[var(--sidebar)]">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <LineChart className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg">Hold-to-Earn</CardTitle>
            </div>
            <CardDescription>
              Advanced mechanics reward long-term liquidity providers with enhanced yields
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-[var(--sidebar)] border border-[var(--accents-7)]">
        <CardHeader>
          <CardTitle>How to Launch Your Index Token</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-4 sm:col-span-3">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Design Your Index Token</h3>
              <p className="text-sm text-muted-foreground">
                Choose a name, symbol, and logo for your index token. This token will represent a
                share in the liquidity pool and earn fees from trading activity.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">2. Select Trading Pair Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Enter the contract addresses for your trading pair tokens. These will be the
                underlying assets that your index token represents and tracks.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">3. Fee Structure</h3>
              <p className="text-sm text-muted-foreground">
                The default 5% swap fee is designed to protect early liquidity providers. As your
                pool matures and liquidity grows, this should be adjusted lower to encourage more
                trading volume.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">4. Initial Liquidity</h3>
              <div className="flex items-start space-x-2">
                <Info className="flex-shrink-0 w-4 h-4 mt-1 text-muted-foreground" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    The initial mint bootstraps your pool with starting liquidity. If you don't have
                    sufficient token balance, this mint will be safely ignored and you can add
                    liquidity later. Consider the initial ratio carefully as it sets the starting
                    price for your pool.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-4 sm:col-span-2">
            <div className="p-8 rounded-lg bg-primary/10">
              <p className="leading-loose text-md font-extralight">
                "This platform emphasizes creating sustainable index tokens with protected liquidity
                pools. The adaptable fee structure and hold-to-earn mechanics encourage long-term
                participation while protecting early supporters. As pools mature, they can evolve to
                serve both index tracking and efficient trading functions."
              </p>
            </div>
            <div className="flex grow" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LaunchpadHeader;
