import React, { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import { BuyBitcoinButton, CashOutButton, DepositButton, SendStxButton, WithdrawButton } from './action-buttons';
import { TransferDialog, WithdrawDialog, DepositDialog } from './action-dialogs';
import { getBalance, handleDeposit, handleTransfer, handleWithdraw } from './action-helpers';
import { PortfolioCards } from './portfolio-cards';
import { useGlobal } from '@lib/hooks/global-context';
import { Features } from './features';
import { CoinFlipCard } from './coin-flip';


const ProtocolDashboard = ({ prices }: { prices: Record<string, number> }) => {
    const [openDeposit, setOpenDeposit] = useState(false);
    const [openWithdraw, setOpenWithdraw] = useState(false);
    const [openTransfer, setOpenTransfer] = useState(false);

    const [balances, setBalances] = useState<Record<string, number>>({});
    const { stxAddress } = useGlobal();

    useEffect(() => {
        const fetchBalances = async () => {
            const welshBalance = await getBalance(stxAddress, 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token');
            setBalances({ '.welsh': welshBalance });
        };
        fetchBalances();
    }, [stxAddress]);

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
                        <SendStxButton onClick={() => setOpenTransfer(true)} disabled={false} />
                    </div>

                    <div className="hidden sm:block w-[1px] bg-border" />

                    <div className="flex gap-2">
                        <DepositButton onClick={() => setOpenDeposit(true)} />
                        <WithdrawButton onClick={() => setOpenWithdraw(true)} />
                    </div>
                </div>
            </div>

            <Features />

            <PortfolioCards balances={balances} prices={prices} />

            {/* dApp card grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <CoinFlipCard />
            </div>

            <TransferDialog prices={prices} open={openTransfer} onOpenChange={setOpenTransfer} onConfirm={handleTransfer} />
            <DepositDialog open={openDeposit} onOpenChange={setOpenDeposit} onConfirm={handleDeposit} />
            <WithdrawDialog open={openWithdraw} onOpenChange={setOpenWithdraw} onConfirm={handleWithdraw} />
        </div>
    );
};

export default ProtocolDashboard;