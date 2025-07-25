let OpenAcresABI;

import { ethers } from "https://cdnjs.cloudflare.com/ajax/libs/ethers/5.7.2/ethers.esm.min.js";

async function loadOpenAcresABI() {
    try {
        const response = await fetch('../../../Blockchain/artifacts/contracts/OpenAcres.sol/OpenAcres.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        OpenAcresABI = await response.json();
    } catch (error) {
        console.error("Could not load OpenAcres ABI:", error);
    }
}

loadOpenAcresABI();

const CONTRACT_ADDRESS_LOCAL = "0x7c7dDc679a6763d6502F40735276E4755ba81Ed"; // Deployed contract address on Amoy testnet

let provider;
let signer;
let openAcresContract;

export async function connectWalletAndContract() {
    if (!OpenAcresABI) {
        await loadOpenAcresABI();
    }
    const contractABI = OpenAcresABI.abi;

    if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        openAcresContract = new ethers.Contract(CONTRACT_ADDRESS_LOCAL, contractABI, signer);
        const signerAddress = await signer.getAddress();
        console.log("Connected to OpenAcres contract:", openAcresContract);
        return { contract: openAcresContract, signerAddress: signerAddress };
    } else {
        console.error("MetaMask or other Web3 provider not detected.");
        return null;
    }
}

export function getContract() {
    return openAcresContract;
}

export function getSigner() {
    return signer;
}

export function getProvider() {
    return provider;
}