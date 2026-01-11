"use client";

import { Settings, Moon, Sun, Shield, User, Bell, Globe } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../PageHeader";

export function SettingsView() {
    const [darkMode, setDarkMode] = useState(true);

    return (
        <div className="space-y-8">
            <PageHeader
                title="Settings"
                subtitle="Manage your account preferences and system configuration."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Categories */}
                <div className="lg:col-span-1 space-y-4">
                    {[
                        { icon: User, label: "Account Profile", active: true },
                        { icon: Bell, label: "Notifications", active: false },
                        { icon: Shield, label: "Security & Privacy", active: false },
                        { icon: Globe, label: "Network Settings", active: false },
                    ].map((item, i) => (
                        <button
                            key={i}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${item.active
                                ? "bg-blue-600/10 border-blue-500/50 text-white"
                                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10"
                                }`}
                        >
                            <item.icon className={`w-4 h-4 ${item.active ? "text-blue-400" : "text-slate-500"}`} />
                            <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* Right Column: Settings Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Appearance Section */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Appearance</h3>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    {darkMode ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Dark Mode</p>
                                    <p className="text-[10px] text-slate-500">Adjust the interface theme</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${darkMode ? "bg-blue-600" : "bg-slate-700"}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full transition-all ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
                            </button>
                        </div>
                    </div>

                    {/* Account Info Section */}
                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">System Status</h3>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-xs text-slate-400">Aegis Version</span>
                                <span className="text-xs font-mono text-white">v2.4.0-stable</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-b border-white/5">
                                <span className="text-xs text-slate-400">Network</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs text-white">Ethereum Sepolia</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-3">
                                <span className="text-xs text-slate-400">AI Engine</span>
                                <span className="text-xs text-blue-400 font-medium">Gemini 2.5 Flash Lite</span>
                            </div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 backdrop-blur-md">
                        <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4">Danger Zone</h3>
                        <p className="text-xs text-slate-500 mb-6">Permanently delete all local cache and reset the application state.</p>
                        <button className="px-4 py-2 bg-rose-600/10 border border-rose-600/50 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
                            Reset Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
