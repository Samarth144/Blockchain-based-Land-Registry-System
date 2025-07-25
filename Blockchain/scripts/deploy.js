// scripts/deploy.js
import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import hardhat from "hardhat";
import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";

async function main() {
  // 1. Provider
  const rpcUrl = process.env.RPC_URL || "";
  const provider = new JsonRpcProvider(rpcUrl);
  console.log("Using RPC URL:", rpcUrl);

  // 2. Deployer wallet
  const ownerPrivKey = process.env.OWNER_PRIVATE_KEY;
  if (!ownerPrivKey) {
    console.error("❌ Set OWNER_PRIVATE_KEY in .env to the deployer private key");
    process.exit(1);
  }
  const deployerWallet = new Wallet(ownerPrivKey, provider);
  console.log("Deploying with account:", deployerWallet.address);

  // 3. Check balance via provider.getBalance(...)
  const balanceBn = await provider.getBalance(deployerWallet.address);
  console.log("Balance:", hardhat.ethers.formatEther(balanceBn), "ETH");

  // 4. Load compiled artifact via Hardhat
  const artifact = await hardhat.artifacts.readArtifact("OpenAcres");
  // 5. Create ContractFactory
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, deployerWallet);

  // 6. Deploy
  const contract = await factory.deploy();
  // Wait for deployment transaction to be mined
  await contract.deploymentTransaction().wait();
  console.log("OpenAcres deployed at:", contract.target || contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
