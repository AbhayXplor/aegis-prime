const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("Deploying AegisGuard V2...");

    // 1. Get Signer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 2. Reuse Existing MNEE (DO NOT REDEPLOY)
    const MNEE_ADDRESS = "0x469470675401b92f1D7f1e83B4660FE51026746e";
    console.log("Using existing MNEE at:", MNEE_ADDRESS);

    // 3. Deploy AegisGuard V2
    const AegisGuard = await hre.ethers.getContractFactory("AegisGuard");
    const aegis = await AegisGuard.deploy(deployer.address);
    await aegis.waitForDeployment();
    const aegisAddress = await aegis.getAddress();

    console.log("AegisGuard V2 deployed to:", aegisAddress);

    // 4. Save Deployment Info
    const deploymentInfo = `
AegisGuard V2: ${aegisAddress}
MNEE (Existing): ${MNEE_ADDRESS}
Owner: ${deployer.address}
Timestamp: ${new Date().toISOString()}
`;

    fs.writeFileSync("deployment_v2.txt", deploymentInfo);
    console.log("Deployment info saved to deployment_v2.txt");

    // 5. Fund the new contract
    try {
        const mnee = await hre.ethers.getContractAt("MockMNEE", MNEE_ADDRESS);
        console.log("Minting 10,000 MNEE to new AegisGuard...");
        const tx = await mnee.mint(aegisAddress, hre.ethers.parseUnits("10000", 18));
        await tx.wait();
        console.log("Funded AegisGuard V2 with 10,000 MNEE");
    } catch (error) {
        console.log("Could not mint MNEE (maybe not owner?):", error.message);
    }
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
