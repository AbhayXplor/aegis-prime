"use client";

import { useState, useEffect } from "react";
import { Bot, Sparkles, Bell, CheckCircle, ArrowRight, Loader2, Lock, Play, Pause, Settings } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { agentWallet } from "@/lib/agentWallet";
import { checkAgentStatus, executeTransferWithAgent } from "@/lib/blockchain";
import { REAL_MNEE_ADDRESS } from "@/lib/constants";
import { AgentAuthorizationModal } from "./AgentAuthorizationModal";
import { AgentSettingsModal } from "./AgentSettingsModal";
import { ethers } from "ethers";

interface Entity {
    id: string;
    name: string;
    wallet: string;
    limit: string;
    type: string;
}

export function PayrollAgent() {
    const [dueEntities, setDueEntities] = useState<Entity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAgentAuthorized, setIsAgentAuthorized] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [executionStatus, setExecutionStatus] = useState<string | null>(null);
    const [autoRun, setAutoRun] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [agentSettings, setAgentSettings] = useState({
        checkFrequency: 60, // Default 1 hour
        maxTransactionLimit: "10000",
        retryAttempts: 3,
        enabled: false
    });

    useEffect(() => {
        checkPayrollStatus();
        verifyAgent();
    }, []);

    useEffect(() => {
        // Load settings from localStorage
        const saved = localStorage.getItem("aegis_agent_settings");
        if (saved) {
            setAgentSettings(JSON.parse(saved));
        }
    }, []);

    const saveSettings = (newSettings: any) => {
        setAgentSettings(newSettings);
        localStorage.setItem("aegis_agent_settings", JSON.stringify(newSettings));
        setShowSettings(false);
    };

    // Auto-Run Effect with Frequency Check
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (autoRun && isAgentAuthorized) {
            // Initial check
            if (dueEntities.length > 0 && !isExecuting) {
                handleExecute();
            }

            // Scheduled check
            interval = setInterval(() => {
                console.log("Agent waking up for scheduled check...");
                checkPayrollStatus(); // Refresh data
                if (dueEntities.length > 0 && !isExecuting) {
                    handleExecute();
                }
            }, agentSettings.checkFrequency * 60 * 1000);
        }

        return () => clearInterval(interval);
    }, [autoRun, isAgentAuthorized, dueEntities, isExecuting, agentSettings.checkFrequency]);

    const verifyAgent = async () => {
        const address = agentWallet.getAddress();
        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
        if (address && AEGIS_ADDRESS) {
            const isAuth = await checkAgentStatus(AEGIS_ADDRESS, address, true);
            setIsAgentAuthorized(isAuth);
        }
    };

    const checkPayrollStatus = async () => {
        setIsLoading(true);
        const { data } = await supabase
            .from('entities')
            .select('*')
            .eq('status', 'active');

        if (data) {
            const entities = data.map(e => ({
                id: e.id,
                name: e.name,
                wallet: e.wallet_address,
                limit: e.monthly_allowance,
                type: e.type
            }));
            setDueEntities(entities);
        }
        setIsLoading(false);
    };

    const handleExecute = async () => {
        if (!isAgentAuthorized) {
            setShowAuthModal(true);
            return;
        }

        // Check Safety Cap
        const totalVolume = dueEntities.reduce((acc, e) => acc + parseFloat(e.limit.replace(/,/g, '')), 0);
        if (totalVolume > parseFloat(agentSettings.maxTransactionLimit)) {
            setExecutionStatus("Safety Cap Exceeded! Pausing.");
            setAutoRun(false);
            alert(`Safety Alert: Total volume (${totalVolume}) exceeds your cap (${agentSettings.maxTransactionLimit}). Auto-run paused.`);
            return;
        }

        setIsExecuting(true);
        setExecutionStatus("Initializing Agent...");

        const AEGIS_ADDRESS = process.env.NEXT_PUBLIC_AEGIS_GUARD_ADDRESS;
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_MAINNET_RPC || "https://eth.llamarpc.com"); // Use Mainnet for Real Mode
        const signer = agentWallet.getSigner(provider);

        if (!AEGIS_ADDRESS || !signer) {
            alert("Configuration error: Missing Aegis Address or Signer.");
            setIsExecuting(false);
            return;
        }

        let successCount = 0;
        for (const entity of dueEntities) {
            if (!entity.wallet) {
                console.warn(`Skipping entity ${entity.name}: Missing wallet address.`);
                continue;
            }
            setExecutionStatus(`Paying ${entity.name}...`);
            const hash = await executeTransferWithAgent(AEGIS_ADDRESS, REAL_MNEE_ADDRESS, entity.wallet, entity.limit.replace(/,/g, ''), signer as ethers.Wallet);
            if (hash) successCount++;
        }

        setExecutionStatus(null);
        setIsExecuting(false);
        if (!autoRun) {
            alert(`Auto-Pilot Complete! ${successCount}/${dueEntities.length} payments executed.`);
        }
    };

    const totalDue = dueEntities.reduce((acc, e) => acc + parseFloat(e.limit.replace(/,/g, '')), 0);

    return (
        <div className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg shadow-lg shadow-blue-500/20">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                Aegis Auto-Pilot
                                <span className={`px-2 py-0.5 rounded-full text-[9px] border flex items-center gap-1 ${isAgentAuthorized ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                                    {isAgentAuthorized ? <Sparkles className="w-2 h-2" /> : <Lock className="w-2 h-2" />}
                                    {isAgentAuthorized ? 'Active' : 'Auth Required'}
                                </span>
                            </h3>
                            <p className="text-[10px] text-blue-200 font-medium">Automated Treasury Agent</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Settings Button */}
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-white/10"
                        >
                            <Settings className="w-4 h-4" />
                        </button>

                        {/* Auto-Run Toggle */}
                        <button
                            onClick={() => setAutoRun(!autoRun)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${autoRun ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-slate-800 text-slate-400 border-white/10'}`}
                        >
                            {autoRun ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            {autoRun ? 'AUTO-RUN ON' : 'AUTO-RUN OFF'}
                        </button>
                    </div>
                </div>

                <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 mb-6 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                        <Bell className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 animate-pulse" />
                        <div>
                            <p className="text-sm text-white font-medium mb-1">
                                Payroll Cycle Detected
                            </p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                I've identified <span className="text-white font-bold">{dueEntities.length} pending payments</span> for this month's cycle.
                                Total volume: <span className="text-emerald-400 font-bold">{totalDue.toLocaleString()} MNEE</span>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-6">
                    {dueEntities.slice(0, 3).map((e, i) => (
                        <div key={i} className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-slate-300">{e.name}</span>
                            <span className="font-mono text-emerald-400">{e.limit} MNEE</span>
                        </div>
                    ))}
                    {dueEntities.length > 3 && (
                        <div className="text-center text-[10px] text-slate-500 italic">
                            + {dueEntities.length - 3} more recipients
                        </div>
                    )}
                </div>

                <button
                    onClick={handleExecute}
                    disabled={isExecuting || autoRun}
                    className={`w-full py-3 font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02] ${isAgentAuthorized ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'} ${autoRun ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isExecuting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{executionStatus}</span>
                        </>
                    ) : (
                        <>
                            <span>{isAgentAuthorized ? (autoRun ? 'Auto-Running...' : 'Execute Auto-Pilot') : 'Authorize Agent'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </div>

            {showAuthModal && (
                <AgentAuthorizationModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => {
                        setShowAuthModal(false);
                        setIsAgentAuthorized(true);
                    }}
                    isRealMode={true}
                />
            )}

            <AgentSettingsModal
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
                onSave={saveSettings}
                initialSettings={agentSettings}
            />
        </div>
    );
}
