// scripts/interact.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JsonRpcProvider, Wallet, Contract, getAddress } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Derive __dirname in ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // 1. Provider from RPC_URL
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  const provider = new JsonRpcProvider(rpcUrl);
  console.log("Using RPC URL:", rpcUrl);

  // 2. Owner wallet: must be the same key that deployed the contract
  const ownerPrivKey = process.env.OWNER_PRIVATE_KEY;
  if (!ownerPrivKey) {
    console.error("❌ Set OWNER_PRIVATE_KEY in .env to the deployer key");
    process.exit(1);
  }
  const ownerWallet = new Wallet(ownerPrivKey, provider);
  console.log("Owner address:", ownerWallet.address);
  // It should match the deployer address printed during deployment, e.g., 0xf39Fd6e5...

  // 3. Load contract ABI and address
  const contractAddress = process.env.CONTRACT_ADDRESS_LOCAL;
  if (!contractAddress) {
    console.error("❌ Set CONTRACT_ADDRESS_LOCAL in .env to the deployed contract address");
    process.exit(1);
  }
  // Load ABI JSON
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/OpenAcres.sol/OpenAcres.json"
  );
  if (!fs.existsSync(artifactPath)) {
    console.error("❌ ABI not found. Run `npx hardhat compile` first. Expected at:", artifactPath);
    process.exit(1);
  }
  const artifactJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const contractABI = artifactJson.abi;

  const contract = new Contract(contractAddress, contractABI, ownerWallet);

  // 4. Mint: recipient from TEST_ACCOUNT_1
  const recipient = process.env.TEST_ACCOUNT_1;
  if (!recipient) {
    console.error("❌ Set TEST_ACCOUNT_1 in .env for mint recipient");
    process.exit(1);
  }

  console.log("Minting to:", recipient);

  let mintTx;
  try {
    // Add placeholder values for the new arguments
    const location = "Test Location";
    const surveyNumber = "SN-12345";
    const area = 1000; // Example area in square meters
    const propertyType = "Residential";
    const marketValue = "1000000000000000000"; // Example market value in wei (as string to prevent overflow)

    mintTx = await contract.mintLand(
      recipient,
      location,
      surveyNumber,
      area,
      propertyType,
      marketValue
    );
  } catch (err) {
    console.error("❌ mintLand reverted or failed:", err);
    process.exit(1);
  }
  console.log("Mint tx hash:", mintTx.hash);

  const mintReceipt = await mintTx.wait();
  console.log("Mint confirmed in block", mintReceipt.blockNumber);

  // Debug: show raw logs
  console.log("Raw logs:", mintReceipt.logs);

  // 5. Parse LandMinted event to get tokenId
  let tokenId = null;
  for (const log of mintReceipt.logs) {
    // Filter logs by contract address
    if (log.address.toLowerCase() !== contractAddress.toLowerCase()) continue;
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === "LandMinted") {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch (_) {
      // Not our event
    }
  }
  if (!tokenId) {
    console.error("❌ Could not find LandMinted event in logs");
    process.exit(1);
  }
  console.log("Minted tokenId:", tokenId);

  // 6. Transfer: use TEST_ACCOUNT_1 private key
  const recipientPrivKey = process.env.TEST_ACCOUNT_1_PRIVATE_KEY;
  const newOwner = process.env.TEST_ACCOUNT_2;
  if (!recipientPrivKey || !newOwner) {
    console.error("❌ Set TEST_ACCOUNT_1_PRIVATE_KEY and TEST_ACCOUNT_2 in .env for transfer");
    process.exit(1);
  }
  const recipientWallet = new Wallet(recipientPrivKey, provider);
  console.log("Recipient address (owner of token):", recipientWallet.address);

  // Connect contract as recipient
  const contractAsRecipient = contract.connect(recipientWallet);
  console.log(`Transferring token ${tokenId} from ${recipientWallet.address} to ${newOwner}`);

  let transferTx;
  try {
    transferTx = await contractAsRecipient.transferLand(recipientWallet.address, newOwner, tokenId);
  } catch (err) {
    console.error("❌ transferLand reverted or failed:", err);
    process.exit(1);
  }
  console.log("Transfer tx hash:", transferTx.hash);

  const transferReceipt = await transferTx.wait();
  console.log("Transfer confirmed in block", transferReceipt.blockNumber);

    console.log("Done.");
}

async function grantAuthorityRole(recipientAddress) {
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  const provider = new JsonRpcProvider(rpcUrl);

  const ownerPrivKey = process.env.OWNER_PRIVATE_KEY;
  if (!ownerPrivKey) {
    console.error("❌ Set OWNER_PRIVATE_KEY in .env to the deployer key");
    process.exit(1);
  }
  const ownerWallet = new Wallet(ownerPrivKey, provider);

  const contractAddress = process.env.CONTRACT_ADDRESS_LOCAL;
  if (!contractAddress) {
    console.error("❌ Set CONTRACT_ADDRESS_LOCAL in .env to the deployed contract address");
    process.exit(1);
  }
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/OpenAcres.sol/OpenAcres.json"
  );
  const artifactJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const contractABI = artifactJson.abi;

  const contract = new Contract(contractAddress, contractABI, ownerWallet);

  const AUTHORITY_ROLE = await contract.AUTHORITY_ROLE();
  console.log(`Granting AUTHORITY_ROLE to ${recipientAddress}...`);
  
  // Ensure the address is a valid checksum address to prevent ENS resolution attempts
  const validatedRecipientAddress = getAddress(recipientAddress);

  const tx = await contract.grantRole(AUTHORITY_ROLE, validatedRecipientAddress);
  await tx.wait();
  console.log(`AUTHORITY_ROLE granted to ${recipientAddress} successfully!`);
}

async function getLandCount() {
  const rpcUrl = process.env.RPC_URL || "http://127.0.0.1:8545";
  const provider = new JsonRpcProvider(rpcUrl);

  const ownerPrivKey = process.env.OWNER_PRIVATE_KEY;
  if (!ownerPrivKey) {
    console.error("❌ Set OWNER_PRIVATE_KEY in .env to the deployer key");
    process.exit(1);
  }
  const ownerWallet = new Wallet(ownerPrivKey, provider);

  const contractAddress = process.env.CONTRACT_ADDRESS_LOCAL;
  if (!contractAddress) {
    console.error("❌ Set CONTRACT_ADDRESS_LOCAL in .env to the deployed contract address");
    process.exit(1);
  }
  const artifactPath = path.resolve(
    __dirname,
    "../artifacts/contracts/OpenAcres.sol/OpenAcres.json"
  );
  const artifactJson = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const contractABI = artifactJson.abi;

  const contract = new Contract(contractAddress, contractABI, ownerWallet);

  try {
    const landCount = await contract.getTokenIdCounter();
    console.log(`Total registered lands: ${landCount.toNumber()}`);
  } catch (error) {
    console.error("Error getting land count:", error);
  }
}

const args = process.argv.slice(2);

if (args[0] === "grant-authority" && args[1]) {
  grantAuthorityRole(args[1]).catch((err) => {
    console.error("Error granting authority role:", err);
    process.exitCode = 1;
  });
} else if (args[0] === "get-land-count") {
  getLandCount().catch((err) => {
    console.error("Error getting land count:", err);
    process.exitCode = 1;
  });
} else {
  main().catch((err) => {
    console.error("Error in script:", err);
    process.exitCode = 1;
  });
}
