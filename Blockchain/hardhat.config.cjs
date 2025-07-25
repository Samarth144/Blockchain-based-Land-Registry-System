// hardhat.config.cjs
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    amoy: {
      url: process.env.RPC_URL,
      accounts: [process.env.OWNER_PRIVATE_KEY],
      chainId: 80002,
      gasPrice: 70000000000,
      timeout: 60000
    },
  } 
};
