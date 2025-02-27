import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { BuyBitcoinButton, CashOutButton, DepositButton, SendTokensButton, WithdrawButton } from './action-buttons';
import { TransferDialog, WithdrawDialog, DepositDialog } from './action-dialogs';
import { PortfolioCards } from './portfolio-cards';
import { useGlobal } from '@lib/hooks/global-context';
import { Features } from './features';
import { CoinFlipCard } from './coin-flip';
import { FaucetButton } from './faucet-button';
import { FaucetCard } from './faucet-card';


const ProtocolDashboard = ({ prices }: { prices: Record<string, number> }) => {
    const [openDeposit, setOpenDeposit] = useState(false);
    const [openWithdraw, setOpenWithdraw] = useState(false);
    const [openTransfer, setOpenTransfer] = useState(false);
    const { blazeBalances } = useGlobal();

    return (

        <div className="container px-4 py-8 mx-auto space-y-8">
            {/* Header with Quick Actions */}
            <div className="mb-8 space-y-6">
                {/* Header Content */}
                <div className="text-left space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Flame className="w-10 h-10 text-primary/90 font-bold relative z-10" strokeWidth={3} />
                            <div className="absolute inset-0 z-0">
                                <Flame className="w-10 h-10 text-primary/10 animate-ping" strokeWidth={8} />
                            </div>
                            <div className="absolute inset-0 z-0">
                                <Flame className="w-10 h-10 text-primary/40 animate-pulse-glow" strokeWidth={6} />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold text-white">blaze</h1>
                    </div>
                    <p className="text-gray-400 max-w-prose leading-tight">
                        Your gateway to the future of web3 finance and decentralized applications.
                        <br className="hidden md:block" />
                        Experience instant transactions, low fees, and limitless scaling with Bitcoin finality.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex gap-2">
                        <BuyBitcoinButton />
                        <CashOutButton />
                    </div>

                    <div className="hidden sm:block w-[1px] bg-border" />

                    <div className="flex gap-2">
                        <SendTokensButton onClick={() => setOpenTransfer(true)} disabled={false} />
                        {/* <FaucetButton /> */}
                    </div>

                    <div className="hidden sm:block w-[1px] bg-border" />

                    <div className="flex gap-2">
                        <DepositButton onClick={() => setOpenDeposit(true)} />
                        <WithdrawButton onClick={() => setOpenWithdraw(true)} />
                    </div>
                </div>
            </div>

            {/* <Features /> */}

            {blazeBalances && <PortfolioCards balances={blazeBalances} prices={prices} />}

            {/* dApp card grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* <CoinFlipCard /> */}
                {/* <FaucetCard /> */}
            </div>

            <TransferDialog prices={prices} open={openTransfer} onOpenChange={setOpenTransfer} />
            <DepositDialog open={openDeposit} onOpenChange={setOpenDeposit} />
            <WithdrawDialog open={openWithdraw} onOpenChange={setOpenWithdraw} />
        </div>
    );
};

export default ProtocolDashboard;