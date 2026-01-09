const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("AegisGuard", function () {
    let aegis;
    let owner, agent, hacker;
    let mockTarget;
    let mockToken;

    // Mock function selector for "transfer(address,uint256)"
    const TRANSFER_SELECTOR = "0xa9059cbb";
    // Mock function selector for "approve(address,uint256)"
    const APPROVE_SELECTOR = "0x095ea7b3";

    beforeEach(async function () {
        [owner, agent, hacker] = await ethers.getSigners();

        // Deploy AegisGuard
        const AegisGuardFactory = await ethers.getContractFactory("AegisGuard");
        aegis = await AegisGuardFactory.deploy(agent.address);
        await aegis.waitForDeployment();

        // Deploy a Mock Target (just an address for now, or we can deploy a real mock)
        const MockTargetFactory = await ethers.getContractFactory("AegisGuard");
        mockTarget = await MockTargetFactory.deploy(owner.address);

        // Deploy Mock Token
        const MockTokenFactory = await ethers.getContractFactory("MockMNEE");
        mockToken = await MockTokenFactory.deploy();
        await mockToken.waitForDeployment();

        // Mint tokens to AegisGuard
        await mockToken.mint(aegis.target, ethers.parseEther("10000"));
    });

    it("Should set the correct owner and agent", async function () {
        expect(await aegis.owner()).to.equal(owner.address);
        expect(await aegis.agent()).to.equal(agent.address);
    });

    it("Should allow owner to set policy", async function () {
        await aegis.setPolicy(mockTarget.target, TRANSFER_SELECTOR, true);
        // Note: allowedSelectors is a mapping, in JS we access it as a function
        expect(await aegis.allowedSelectors(mockTarget.target, TRANSFER_SELECTOR)).to.be.true;
    });

    it("Should block agent from calling unauthorized function", async function () {
        // Agent tries to call 'approve' which is NOT allowed
        const payload = APPROVE_SELECTOR + "000000000000000000000000" + agent.address.slice(2);

        await expect(
            aegis.connect(agent).execute(mockTarget.target, payload)
        ).to.emit(aegis, "PolicyViolation")
        .withArgs(mockTarget.target, APPROVE_SELECTOR, "Policy Violation - Not Authorized", payload.toLowerCase());
    });

    it("Should allow agent to call authorized function", async function () {
        // 1. Allow 'transfer'
        await aegis.setPolicy(mockTarget.target, TRANSFER_SELECTOR, true);

        // 2. Agent calls 'transfer'
        const payload = TRANSFER_SELECTOR + "000000000000000000000000" + agent.address.slice(2);

        try {
            await aegis.connect(agent).execute(mockTarget.target, payload);
        } catch (error) {
            expect(error.message).to.not.include("Policy Violation");
        }
    });

    describe("Daily Spending Limits", function () {
        const LIMIT = ethers.parseEther("100");
        let tokenAddress;

        beforeEach(async function () {
            tokenAddress = mockToken.target;
            // Set spending limit for the token
            await aegis.setSpendingLimit(tokenAddress, LIMIT);
            // Allow transfer
            await aegis.setPolicy(tokenAddress, TRANSFER_SELECTOR, true);

            // Mint tokens to AegisGuard (simulating it holds funds)
            // But AegisGuard calls `execute` to trigger transfers on OTHER contracts.
            // Wait, AegisGuard is a wallet. If it holds tokens, it calls token.transfer().
            // So `target` in `execute` should be the token address.
        });

        it("Should enforce daily spending limit", async function () {
            const amount = ethers.parseEther("60");

            // Encode transfer(recipient, amount)
            // Recipient: hacker (just for test)
            const iface = new ethers.Interface(["function transfer(address,uint256)"]);
            const data = iface.encodeFunctionData("transfer", [hacker.address, amount]);

            // 1. First transaction (60) - Should succeed
            await expect(aegis.connect(agent).execute(tokenAddress, data))
                .to.emit(aegis, "Executed");

            expect(await aegis.spentToday(tokenAddress)).to.equal(amount);

            // 2. Second transaction (50) - Total 110 > 100 - Should fail
            const amount2 = ethers.parseEther("50");
            const data2 = iface.encodeFunctionData("transfer", [hacker.address, amount2]);

            // Note: execute doesn't revert, it emits PolicyViolation for limit breach
            await expect(aegis.connect(agent).execute(tokenAddress, data2))
                .to.emit(aegis, "PolicyViolation")
                .withArgs(tokenAddress, TRANSFER_SELECTOR, "Spending Limit Exceeded", data2);

            // Limit shouldn't change
            expect(await aegis.spentToday(tokenAddress)).to.equal(amount);
        });

        it("Should reset daily limit after 24 hours", async function () {
            const amount = ethers.parseEther("60");
            const iface = new ethers.Interface(["function transfer(address,uint256)"]);
            const data = iface.encodeFunctionData("transfer", [hacker.address, amount]);

            // 1. Spend 60
            await aegis.connect(agent).execute(tokenAddress, data);
            expect(await aegis.spentToday(tokenAddress)).to.equal(amount);

            // 2. Increase time by 25 hours
            await time.increase(25 * 60 * 60);

            // 3. Spend 50 (Total would be 110 if not reset, but should be 50 after reset)
            const amount2 = ethers.parseEther("50");
            const data2 = iface.encodeFunctionData("transfer", [hacker.address, amount2]);

            await expect(aegis.connect(agent).execute(tokenAddress, data2))
                .to.emit(aegis, "Executed");

            // spentToday should be 50
            expect(await aegis.spentToday(tokenAddress)).to.equal(amount2);
        });

        it("Should not reset daily limit before 24 hours", async function () {
            const amount = ethers.parseEther("60");
            const iface = new ethers.Interface(["function transfer(address,uint256)"]);
            const data = iface.encodeFunctionData("transfer", [hacker.address, amount]);

            // 1. Spend 60
            await aegis.connect(agent).execute(tokenAddress, data);

            // 2. Increase time by 20 hours
            await time.increase(20 * 60 * 60);

            // 3. Spend 50 - Should fail
            const amount2 = ethers.parseEther("50");
            const data2 = iface.encodeFunctionData("transfer", [hacker.address, amount2]);

            await expect(aegis.connect(agent).execute(tokenAddress, data2))
                .to.emit(aegis, "PolicyViolation");
        });
    });
});
