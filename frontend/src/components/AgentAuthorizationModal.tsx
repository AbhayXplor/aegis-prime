"use client";

import { useState, useEffect } from "react";
import { Bot, ShieldCheck, Loader2, CheckCircle, AlertTriangle, Key } from "lucide-react";
import { agentWallet } from "@/lib/agentWallet";
import { setAgent, checkAgentStatus } from "@/lib/blockchain";

interface AgentAuthorizationModalProps {
    onClose: () => void;
    onSuccess: () => void;
    isRealMode: boolean;
}

export function AgentAuthorizationModal({ onClose, onSuccess, isRealMode }: AgentAuthorizationModalProps) {
    const [step, setStep] = useState<'intro' | 'authorizing' | 'success'>('intro');
    const [agentAddress, setAgentAddress] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const address = agentWallet.getAddress();
        setAgentAddress(address);
    }, []);

    const handleAuthorize = async () => {
        if (!agentAddress) return;
        setIsLoading(true);
        setStep('authorizing');

        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
        if (!AEGIS_ADDRESS) {
            alert("Aegis Guard address not found.");
            setIsLoading(false);
            setStep('intro');
            return;
        }

        const success = await setAgent(AEGIS_ADDRESS, agentAddress, true, isRealMode);
        if (success) {
            setStep('success');
        } else {
            setStep('intro');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-6">
                    {step === 'intro' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/20 mb-4">
                                    <Bot className="w-8 h-8 text-blue-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Enable Auto-Pilot</h3>
                                <p className="text-sm text-slate-400 mt-2">
                                    Authorize a dedicated AI Agent to execute payments on your behalf.
                                </p>
                            </div>

                            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Key className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Agent Key</span>
                                </div>
                                <div className="font-mono text-[10px] text-slate-500 break-all bg-black/20 p-2 rounded">
                                    {agentAddress || "Generating..."}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-xs text-slate-400">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Zero-click automated payments</span>
                                </div>
                                <div className="flex items-start gap-3 text-xs text-slate-400">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Restricted by on-chain policies</span>
                                </div>
                                <div className="flex items-start gap-3 text-xs text-slate-400">
                                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    <span>Revocable at any time</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAuthorize}
                                    disabled={isLoading || !agentAddress}
                                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-blue-500/20"
                                >
                                    Authorize Agent
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 'authorizing' && (
                        <div className="py-10 text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                            <h3 className="text-lg font-bold text-white">Authorizing Agent...</h3>
                            <p className="text-sm text-slate-400">Please sign the transaction in your wallet.</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-10 text-center space-y-6">
                            <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Auto-Pilot Enabled!</h3>
                                <p className="text-sm text-slate-400">Your AI Agent is now authorized to run payroll.</p>
                            </div>
                            <button
                                onClick={onSuccess}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all"
                            >
                                Start Automating
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
