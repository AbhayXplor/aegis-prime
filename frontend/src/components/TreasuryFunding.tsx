import { useState } from "react";
import { Wallet, ArrowRight, Loader2 } from "lucide-react";
import { depositToVault } from "@/lib/blockchain";

import { MOCK_MNEE_ADDRESS, REAL_MNEE_ADDRESS } from "@/lib/constants";

export function TreasuryFunding({ isRealMode }: { isRealMode?: boolean }) {
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleDeposit = async () => {
        if (!amount || isNaN(Number(amount))) return;

        setIsLoading(true);
        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
        // Use Real address if in Real Mode, otherwise Mock
        const MNEE_ADDRESS = isRealMode ? REAL_MNEE_ADDRESS : MOCK_MNEE_ADDRESS;

        if (AEGIS_ADDRESS && MNEE_ADDRESS) {
            const success = await depositToVault(AEGIS_ADDRESS, MNEE_ADDRESS, amount, isRealMode);
            if (success) {
                alert("Deposit successful!");
                setAmount("");
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Wallet className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Treasury Funding</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Deposit MNEE to Aegis Vault</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
                        Amount (MNEE)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all font-mono"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500">
                            MNEE
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleDeposit}
                    disabled={isLoading || !amount}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing...
                        </>
                    ) : (
                        <>
                            Deposit Funds <ArrowRight className="w-3 h-3" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
