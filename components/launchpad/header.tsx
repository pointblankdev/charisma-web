import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@components/ui/card';
import { Coins, Users, Percent, LineChart, Info } from 'lucide-react';

const LaunchpadHeader = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Main Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Community DEX Launchpad</h1>
        <p className="text-lg text-muted-foreground">
          Launch your own decentralized exchange and earn fees as a community
        </p>
      </div>

      {/* Key Benefits Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[var(--sidebar)]">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg">0.4% Base Fee</CardTitle>
            </div>
            <CardDescription>
              Competitive fee structure generates consistent yield for liquidity providers while
              keeping swaps affordable
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
              All fees go directly to LP token holders - no middlemen, no corporate overhead
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-[var(--sidebar)]">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-primary" />
              <CardTitle className="text-lg">Automatic Compounding</CardTitle>
            </div>
            <CardDescription>
              Fees automatically compound in the pool, increasing the value of LP positions over
              time
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
              Built-in mechanics reward long-term liquidity providers with enhanced yields
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="bg-[var(--sidebar)] border border-[var(--accents-7)]">
        <CardHeader>
          <CardTitle>How to Launch Your DEX</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          <div className="space-y-4 sm:col-span-3">
            <div className="space-y-2">
              <h3 className="font-semibold">1. Design Your Index Token</h3>
              <p className="text-sm text-muted-foreground">
                Fill in the basic details about your new token including name, symbol, and logo.
                Choose meaningful identifiers that reflect your token or it's underlying trading
                pair.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">2. Select Trading Pair Tokens</h3>
              <p className="text-sm text-muted-foreground">
                Enter the contract addresses for your trading pair tokens. These will be the assets
                that can be swapped on your DEX.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">3. Initial Settings</h3>
              <p className="text-sm text-muted-foreground">
                The default 0.4% swap fee provides a balanced incentive for liquidity providers
                while keeping trading costs competitive.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">4. Initial Liquidity</h3>
              <div className="flex items-start space-x-2">
                <Info className="flex-shrink-0 w-4 h-4 mt-1 text-muted-foreground" />
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    The initial mint amount is a convenience feature to seed initial liquidity. If
                    you don't have sufficient token balance, this mint will be safely ignored and
                    you can add liquidity later. After deployment, you may need to perform a swap to
                    balance the token ratios in the pool. This helps establish the initial price and
                    ensures optimal liquidity distribution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col mt-4 sm:col-span-2">
            <div className="p-8 rounded-lg bg-primary/10">
              <p className="leading-loose text-md font-extralight">
                "By launching a community DEX, you're participating in true decentralized finance
                where profits flow directly to liquidity providers instead of centralized entities.
                This aligns with Bitcoin's original vision of peer-to-peer finance and helps build a
                more equitable financial system."
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
