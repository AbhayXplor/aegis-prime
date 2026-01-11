"use client";

import { useState } from "react";
import { Send, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { ethers } from "ethers";
import { MneeLogo } from "./MneeLogo";
import { REAL_MNEE_ADDRESS, MNEE_ABI } from "@/lib/constants";

export function RealPaymentControl() {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [txHash, setTxHash] = useState("");

    const handlePayment = async () => {
        if (!recipient || !amount) return;
        setIsLoading(true);
        setStatus("idle");

        try {
            if (!window.ethereum) throw new Error("No wallet found");
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(REAL_MNEE_ADDRESS, MNEE_ABI, signer);
            const amountWei = ethers.parseUnits(amount, 18);

            const tx = await contract.transfer(recipient, amountWei);
            await tx.wait();

            setTxHash(tx.hash);
            setStatus("success");
            setAmount("");
            setRecipient("");
        } catch (error) {
            console.error("Payment failed:", error);
            setStatus("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Recipient Address</label>
                    <input
                        type="text"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Amount (MNEE)</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors font-mono"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <MneeLogo className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {status === "success" && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-emerald-400">Payment Sent!</p>
                        <p className="text-[10px] text-slate-400 font-mono break-all">{txHash}</p>
                    </div>
                </div>
            )}

            {status === "error" && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <p className="text-xs font-bold text-red-400">Transaction Failed</p>
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={isLoading || !recipient || !amount}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isLoading ? "Processing..." : "Send Payment"}
            </button>
        </div>
    );
}
