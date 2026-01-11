export const MOCK_MNEE_ADDRESS = "0x469470675401b92f1D7f1e83B4660FE51026746e";
export const REAL_MNEE_ADDRESS = "0x8ccedbAe4916b79da7F3F612EfB2EB93A2bFD6cF";

export const KNOWN_ENTITIES: Record<string, string> = {
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D": "Uniswap V2 Router",
    "0x1234567890123456789012345678901234567890": "Unknown Wallet (Phishing)",
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef": "Blacklisted Mixer",
    "0x9999999999999999999999999999999999999999": "Suspicious Address",
    "0x4242424242424242424242424242424242424242": "OpenAI API Billing",
    "0x5555555555555555555555555555555555555555": "Anthropic Credits",
    "0x6666666666666666666666666666666666666666": "AWS Infrastructure",
    "0x7777777777777777777777777777777777777777": "Deel Payroll",
    [MOCK_MNEE_ADDRESS]: "MNEE Token (Mock)",
    [REAL_MNEE_ADDRESS]: "MNEE Token (Real)"
};

export const VALID_TARGETS = [
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap
    "0x4242424242424242424242424242424242424242", // OpenAI
    "0x5555555555555555555555555555555555555555", // Anthropic
    "0x6666666666666666666666666666666666666666", // AWS
    "0x7777777777777777777777777777777777777777"  // Deel
];

export const MNEE_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];
