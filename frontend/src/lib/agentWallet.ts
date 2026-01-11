import { ethers } from "ethers";

const AGENT_KEY_STORAGE = "aegis_agent_key";

export class AgentWallet {
    private wallet: ethers.Wallet | null = null;

    constructor() {
        this.loadOrGenerate();
    }

    private loadOrGenerate() {
        if (typeof window === 'undefined') return;

        const storedKey = localStorage.getItem(AGENT_KEY_STORAGE);
        if (storedKey) {
            try {
                this.wallet = new ethers.Wallet(storedKey);
            } catch (e) {
                console.error("Failed to load stored key, generating new one");
                this.generateNew();
            }
        } else {
            this.generateNew();
        }
    }

    private generateNew() {
        const randomWallet = ethers.Wallet.createRandom();
        this.wallet = new ethers.Wallet(randomWallet.privateKey);
        localStorage.setItem(AGENT_KEY_STORAGE, randomWallet.privateKey);
    }

    public getAddress(): string | null {
        return this.wallet ? this.wallet.address : null;
    }

    public getSigner(provider: ethers.Provider): ethers.Wallet | null {
        return this.wallet ? this.wallet.connect(provider) : null;
    }

    public reset() {
        localStorage.removeItem(AGENT_KEY_STORAGE);
        this.wallet = null;
        this.loadOrGenerate();
    }
}

export const agentWallet = new AgentWallet();
