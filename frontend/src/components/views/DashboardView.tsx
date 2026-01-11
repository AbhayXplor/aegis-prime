"use client";

import { MetricsWidgets } from "../MetricsWidgets";
import { AnalyticsDashboard } from "../AnalyticsDashboard";
import { AuthorizedOperations } from "../AuthorizedOperations";
import { PageHeader } from "../PageHeader";
import { WalletStatus } from "../WalletStatus";
import { ShadowSpendDetector } from "../ShadowSpendDetector";

interface DashboardViewProps {
    balance: string;
    ethBalance: string;
    vaultBalance: string;
    userAddress: string | null;
    isConnected: boolean;
    isRealMode: boolean;
    isPaused: boolean;
    setIsPaused: (paused: boolean) => void;
    demoPhase: number;
    connectWallet?: () => void;
    disconnectWallet?: () => void;
}

export function DashboardView(props: DashboardViewProps) {
    const showRealData = props.isConnected;

    return (
        <div>
            <PageHeader
                title="Overview"
                subtitle="Financial performance and security status."
                action={
                    <div className="flex items-center gap-3">
                        <WalletStatus
                            {...props}
                            address={props.userAddress || ""}
                            riskLevel="LOW"
                            compact={true}
                        />
                        {props.isConnected ? (
                            <button
                                onClick={props.disconnectWallet}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-medium rounded-md transition-colors border border-white/10"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={props.connectWallet}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                }
            />

            {showRealData ? (
                <>
                    <MetricsWidgets
                        balance={props.balance}
                        vaultBalance={props.vaultBalance}
                        demoPhase={props.demoPhase}
                        isRealMode={props.isRealMode}
                    />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Analytics Section - Takes 2 columns on large screens */}
                        <div className="xl:col-span-2 space-y-6">
                            <ShadowSpendDetector isRealMode={props.isRealMode} />

                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">Analytics</h3>
                            </div>
                            <AnalyticsDashboard />
                        </div>

                        {/* Operations Section - Takes 1 column */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-white">Recent Operations</h3>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-lg p-0 overflow-hidden min-h-[600px]">
                                <AuthorizedOperations />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                    <div className="p-4 bg-slate-800 rounded-full">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Real Mode Locked</h3>
                        <p className="text-slate-400 max-w-md mx-auto">
                            Connect your wallet to view live financial data, runway forecasts, and shadow spend alerts.
                        </p>
                    </div>
                    <button
                        onClick={props.connectWallet}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    >
                        Connect Wallet to Unlock
                    </button>
                </div>
            )}
        </div>
    );
}
