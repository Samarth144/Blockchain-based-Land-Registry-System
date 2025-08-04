// controllers/landController.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers , Wallet } from "ethers";
import dotenv from "dotenv";
import _ from "lodash";

import LandEvent from "../models/LandEvent.js";

dotenv.config();

// ⚙️ Emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load ABI artifact
const artifact = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../abi/OpenAcres.json"), "utf8")
);

// Setup ethers.js contract instance
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS_LOCAL,
  artifact.abi,
  wallet
);

export async function mintLand(req, res) {
  try {
    const {
      surveyNumber,
      ownerAddress,
      location,
      area,
      propertyType,
      marketValue
    } = req.body;

    if (!surveyNumber || !ownerAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (surveyNumber, ownerAddress)"
      });
    }

    // Explicitly fetch the current nonce for the wallet
    const currentNonce = await wallet.getTransactionCount();

    // ✅ Perform blockchain mint (assuming your contract method is updated to support these fields)
    // Replace below with your actual mint logic
    const tx = await contract.mintLand(
      ownerAddress,
      location,
      surveyNumber,
      area,
      propertyType,
      marketValue,
      { nonce: currentNonce } // Pass the fetched nonce to the transaction
    );
    const receipt = await tx.wait();

    const event = contract.interface.getEvent("LandMinted");
    const log = receipt.logs.find(
      l => l.topics[0] === contract.interface.getEventTopic(event)
    );

    if (!log) {
      throw new Error("Minting event not found in transaction logs");
    }

    const decoded = contract.interface.decodeEventLog(event, log.data, log.topics);
    const tokenId = decoded.tokenId.toString();

    // ✅ Save to DB
    const landRecord = await LandEvent.create({
      tokenId,
      surveyNumber,
      ownerAddress,
      location,
      area,
      propertyType,
      marketValue,
      createdAt: new Date()
    });

    res.json({
      success: true,
      tokenId,
      txHash: tx.hash,
      landRecord
    });

  } catch (err) {
    console.error("Minting error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}

export async function confirmTransfer(req, res) {
  try {
    const { tokenId, from, to } = req.body;

    if (!tokenId || !from || !to) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (tokenId, from, to)"
      });
    }

    const normalizedFrom = ethers.utils.getAddress(from);
    const normalizedTo = ethers.utils.getAddress(to);

    // Find the land in the database
    const land = await LandEvent.findOne({
      tokenId: tokenId.toString(),
      currentOwner: normalizedTo // The new owner should be the current owner after transfer
    });

    if (!land) {
      return res.status(404).json({
        success: false,
        error: "Land not found or not owned by the recipient"
      });
    }

    // Optionally, add more checks here if needed, e.g., verify the transfer was initiated

    res.json({
      success: true,
      message: "Transfer confirmed and recorded successfully",
      landRecord: _.pick(land, ['tokenId', 'currentOwner', 'name', 'txHash'])
    });

  } catch (err) {
    console.error("❌ Confirm Transfer error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function listDocumentsForParcel(req, res) {
  try {
    // Placeholder for listDocumentsForParcel logic
    res.status(501).json({ success: false, message: "listDocumentsForParcel not implemented" });
  } catch (err) {
    console.error("❌ List Documents For Parcel error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function listDocumentsForParcelPublic(req, res) {
  try {
    // Placeholder for listDocumentsForParcelPublic logic
    res.status(501).json({ success: false, message: "listDocumentsForParcelPublic not implemented" });
  } catch (err) {
    console.error("❌ List Documents For Parcel Public error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function searchLand(req, res) {
  try {
    // Placeholder for searchLand logic
    res.status(501).json({ success: false, message: "searchLand not implemented" });
  } catch (err) {
    console.error("❌ Search Land error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function transferLand(req, res) {
  try {
    const { from, to, tokenId: optionalTokenId } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (from, to)"
      });
    }

    const normalizedFrom = ethers.utils.getAddress(from);
    const normalizedTo = ethers.utils.getAddress(to);

    // 🔍 1. Retrieve Land from DB
    let land;
    if (optionalTokenId) {
      land = await LandEvent.findOne({
        tokenId: optionalTokenId.toString(),
        currentOwner: normalizedFrom
      });
    } else {
      land = await LandEvent.findOne({ currentOwner: normalizedFrom }).sort({ createdAt: -1 });
    }

    if (!land) {
      return res.status(404).json({
        success: false,
        error: optionalTokenId
          ? "Specified token not found or not owned by sender"
          : "No lands found for this owner"
      });
    }

    const tokenId = land.tokenId.toString();

    // 🔐 2. Determine signer
    let signer;
    const knownAddresses = {
      [process.env.TEST_ACCOUNT_1.toLowerCase()]: process.env.TEST_ACCOUNT_1_PRIVATE_KEY,
      [process.env.TEST_ACCOUNT_2.toLowerCase()]: process.env.TEST_ACCOUNT_2_PRIVATE_KEY,
      ["0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"]: process.env.OWNER_PRIVATE_KEY
    };

    const privKey = knownAddresses[normalizedFrom.toLowerCase()];
    if (!privKey) {
      return res.status(403).json({ success: false, error: "Unauthorized sender address" });
    }

    signer = new ethers.Wallet(privKey, provider);
    const contractWithSigner = contract.connect(signer);

    // ✅ 3. Check On-chain ownership
    const onChainOwner = await contractWithSigner.ownerOf(tokenId);
    if (ethers.utils.getAddress(onChainOwner) !== normalizedFrom) {
      return res.status(403).json({
        success: false,
        error: "On-chain ownership verification failed"
      });
    }

    // 🚀 4. Transfer Land
    const tx = await contractWithSigner.transferLand(normalizedFrom, normalizedTo, tokenId);
    await tx.wait();

    // 🧠 5. Update MongoDB
    const updated = await LandEvent.findOneAndUpdate(
      { tokenId },
      {
        currentOwner: normalizedTo,
        $push: {
          transferHistory: {
            from: normalizedFrom,
            to: normalizedTo,
            txHash: tx.hash,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      console.warn("⚠️ Transfer succeeded but DB update failed for token:", tokenId);
    }

    res.json({
      success: true,
      tokenId,
      txHash: tx.hash,
      newOwner: normalizedTo,
      previousOwner: normalizedFrom,
      landRecord: _.pick(updated, ['tokenId', 'currentOwner', 'name', 'txHash'])
    });

  } catch (err) {
    console.error("❌ Transfer error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function flagDispute(req, res) {
  try {
    const { tokenId, reporterAddress, reason } = req.body;

    if (!tokenId || !reporterAddress || !reason) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (tokenId, reporterAddress, reason)"
      });
    }

    const normalizedReporterAddress = ethers.utils.getAddress(reporterAddress);

    // Find the land in the database
    const land = await LandEvent.findOne({
      tokenId: tokenId.toString()
    });

    if (!land) {
      return res.status(404).json({
        success: false,
        error: "Land not found"
      });
    }

    // Add the dispute to the land record
    land.disputes.push({
      reporter: normalizedReporterAddress,
      reason: reason,
      timestamp: new Date()
    });

    await land.save();

    res.json({
      success: true,
      message: "Dispute flagged successfully",
      landRecord: _.pick(land, ['tokenId', 'currentOwner', 'name', 'disputes'])
    });

  } catch (err) {
    console.error("❌ Flag Dispute error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getLandDetails(req, res) {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: tokenId"
      });
    }

    const land = await LandEvent.findOne({
      tokenId: tokenId.toString()
    });

    if (!land) {
      return res.status(404).json({
        success: false,
        error: "Land not found"
      });
    }

    res.json({
      success: true,
      landDetails: _.pick(land, ['tokenId', 'currentOwner', 'name', 'description', 'image', 'external_url', 'attributes', 'transferHistory'])
    });

  } catch (err) {
    console.error("❌ Get Land Details error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getOwnershipAndDisputeHistory(req, res) {
  try {
    const { tokenId } = req.params;

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: tokenId"
      });
    }

    const land = await LandEvent.findOne({
      tokenId: tokenId.toString()
    });

    if (!land) {
      return res.status(404).json({
        success: false,
        error: "Land not found"
      });
    }

    res.json({
      success: true,
      ownershipHistory: land.transferHistory,
      disputeHistory: land.disputes || []
    });

  } catch (err) {
    console.error("❌ Get Ownership and Dispute History error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getTransferStatus(req, res) {
  try {
    const { txHash } = req.params;

    if (!txHash) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameter: txHash"
      });
    }

    // In a real application, you would query the blockchain or a transaction indexer
    // to get the actual status of the transaction. For this example, we'll simulate it.
    const receipt = await provider.getTransactionReceipt(txHash);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        error: "Transaction not found on the blockchain"
      });
    }

    res.json({
      success: true,
      txHash: txHash,
      status: receipt.status === 1 ? "confirmed" : "failed",
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString()
    });

  } catch (err) {
    console.error("❌ Get Transfer Status error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function initiateTransfer(req, res) {
  try {
    const { from, to, tokenId } = req.body;

    if (!from || !to || !tokenId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (from, to, tokenId)"
      });
    }

    const normalizedFrom = ethers.utils.getAddress(from);
    const normalizedTo = ethers.utils.getAddress(to);

    // Find the land in the database
    const land = await LandEvent.findOne({
      tokenId: tokenId.toString(),
      currentOwner: normalizedFrom
    });

    if (!land) {
      return res.status(404).json({
        success: false,
        error: "Land not found or not owned by the sender"
      });
    }

    // Here you would typically interact with your smart contract to initiate the transfer.
    // For this example, we'll just return a success message.

    res.json({
      success: true,
      message: "Transfer initiated successfully",
      tokenId: tokenId,
      from: normalizedFrom,
      to: normalizedTo
    });

  } catch (err) {
    console.error("❌ Initiate Transfer error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function listAllLands(req, res) {
  try {
    const lands = await LandEvent.find({});
    res.json({
      success: true,
      lands: lands.map(land => _.pick(
        land, [
          'tokenId',
          'surveyNumber',
          'ownerAddress',
          'location',
          'area',
          'propertyType',
          'marketValue',
          'status',
          'createdAt'
        ]
      ))
    });
  } catch (err) {
    console.error("❌ List All Lands error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function registerLand(req, res) {
    // Placeholder for registerLand logic
    try {
    const {
      surveyNumber,
      ownerAddress,
      location,
      area,
      propertyType,
      marketValue
    } = req.body;

    if (!surveyNumber || !ownerAddress) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields (surveyNumber, ownerAddress)"
      });
    }

    // ✅ Perform blockchain mint (assuming your contract method is updated to support these fields)
    // Replace below with your actual mint logic
    const tx = await contract.mintLand(
      ownerAddress,
      location,
      surveyNumber,
      area,
      propertyType,
      marketValue
    );
    const receipt = await tx.wait();

    const event = contract.interface.getEvent("LandMinted");
    const log = receipt.logs.find(
      l => l.topics[0] === contract.interface.getEventTopic(event)
    );

    if (!log) {
      throw new Error("Minting event not found in transaction logs");
    }

    const decoded = contract.interface.decodeEventLog(event, log.data, log.topics);
    const tokenId = decoded.tokenId.toString();

    // ✅ Save to DB
    const landRecord = await LandEvent.create({
      tokenId,
      surveyNumber,
      ownerAddress,
      location,
      area,
      propertyType,
      marketValue,
      createdAt: new Date()
    });

    res.json({
      success: true,
      tokenId,
      txHash: tx.hash,
      landRecord
    });
    res.status(501).json({ success: false, message: "registerLand not implemented" });
  } catch (err) {
    console.error("❌ Register Land error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function searchLandPublic(req, res) {
  try {
    // Placeholder for searchLandPublic logic
    res.status(501).json({ success: false, message: "searchLandPublic not implemented" });
  } catch (err) {
    console.error("❌ Search Land Public error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getOwnershipAndDisputeHistoryPublic(req, res) {
  try {
    // Placeholder for getOwnershipAndDisputeHistoryPublic logic
    res.status(501).json({ success: false, message: "getOwnershipAndDisputeHistoryPublic not implemented" });
  } catch (err) {
    console.error("❌ Get Ownership And Dispute History Public error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getTransferStatusPublic(req, res) {
  try {
    // Placeholder for getTransferStatusPublic logic
    res.status(501).json({ success: false, message: "getTransferStatusPublic not implemented" });
  } catch (err) {
    console.error("❌ Get Transfer Status Public error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function unflagDispute(req, res) {
  try {
    // Placeholder for unflagDispute logic
    res.status(501).json({ success: false, message: "unflagDispute not implemented" });
  } catch (err) {
    console.error("❌ Unflag Dispute error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getDisputeDetails(req, res) {
  try {
    // Placeholder for getDisputeDetails logic
    res.status(501).json({ success: false, message: "getDisputeDetails not implemented" });
  } catch (err) {
    console.error("❌ Get Dispute Details error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function resolveDispute(req, res) {
  try {
    // Placeholder for resolveDispute logic
    res.status(501).json({ success: false, message: "resolveDispute not implemented" });
  } catch (err) {
    console.error("❌ Resolve Dispute error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getDisputes(req, res) {
  try {
    // Placeholder for getDisputes logic
    res.status(501).json({ success: false, message: "getDisputes not implemented" });
  } catch (err) {
    console.error("❌ Get Disputes error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getLandByOwner(req, res) {
  try {
    // Placeholder for getLandByOwner logic
    res.status(501).json({ success: false, message: "getLandByOwner not implemented" });
  } catch (err) {
    console.error("❌ Get Land By Owner error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getLandByOwnerPublic(req, res) {
  try {
    // Placeholder for getLandByOwnerPublic logic
    res.status(501).json({ success: false, message: "getLandByOwnerPublic not implemented" });
  } catch (err) {
    console.error("❌ Get Land By Owner Public error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getLandDetailsByOwner(req, res) {
  try {
    // Placeholder for getLandDetailsByOwner logic
    res.status(501).json({ success: false, message: "getLandDetailsByOwner not implemented" });
  } catch (err) {
    console.error("❌ Get Land Details By Owner error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

export async function getLandDetailsByOwnerPublic(req, res) {
  try {
    // Placeholder for getLandDetailsByOwnerPublic logic
    res.status(501).json({ success: false, message: "getLandDetailsByOwnerPublic not implemented" });
  } catch (err) {
    console.error("❌ Get Land Details By Owner Public error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

// Add these to landController.js

// Upload Land Documents (for specific surveyNumber)
export async function uploadLandDocuments(req, res) {
  try {
    const { surveyNumber } = req.params;
    // Placeholder implementation
    res.status(501).json({ 
      success: false, 
      message: "uploadLandDocuments not implemented",
      surveyNumber
    });
  } catch (err) {
    console.error("❌ Upload Land Documents error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

// View Dispute Details
export async function viewDisputeDetails(req, res) {
  try {
    const { surveyNumber } = req.params;
    // Placeholder implementation
    res.status(501).json({ 
      success: false, 
      message: "viewDisputeDetails not implemented",
      surveyNumber
    });
  } catch (err) {
    console.error("❌ View Dispute Details error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}

// Upload Document (general)
export async function uploadDocument(req, res) {
  try {
    // Placeholder implementation
    res.status(501).json({ 
      success: false, 
      message: "uploadDocument not implemented" 
    });
  } catch (err) {
    console.error("❌ Upload Document error:", err);
    res.status(500).json({
      success: false,
      error: err.reason || err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }
}