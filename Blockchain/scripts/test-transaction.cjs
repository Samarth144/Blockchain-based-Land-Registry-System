const { ethers } = require("hardhat");

async function main() {
  console.log("Script started.");

  console.log("Attempting to get signers...");
  const [deployer] = await ethers.getSigners();
  console.log(`Signers obtained. Deployer address: ${deployer.address}`);

  console.log("Preparing transaction...");
  const tx = await deployer.sendTransaction({
    to: deployer.address,
    value: ethers.parseEther("0"),
  });
  console.log(`Transaction sent. Hash: ${tx.hash}`);

  console.log("Waiting for transaction confirmation...");
  await tx.wait();
  console.log("Transaction confirmed.");

  console.log("0 ETH transaction successful!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });