import express from 'express';
import {
  registerLand,
  getLandDetails,
  listAllLands,
  uploadLandDocuments,
  getOwnershipAndDisputeHistory,
  initiateTransfer,
  confirmTransfer,
  getTransferStatus,
  flagDispute,
  unflagDispute,
  viewDisputeDetails,
  uploadDocument,
  listDocumentsForParcel,
  searchLandPublic,
  mintLand, // Keep existing mintLand if still needed
  transferLand // Keep existing transferLand if still needed
} from "../controllers/landController.js";

const router = express.Router();

// 1. Land Management
router.post("/register", registerLand);
router.get("/:surveyNumber", getLandDetails);
router.get("/lands", listAllLands);
router.put("/:surveyNumber/documents", uploadLandDocuments);
router.get("/:surveyNumber/history", getOwnershipAndDisputeHistory);

// 2. Ownership Transfer
router.post("/:surveyNumber/transfer/initiate", initiateTransfer);
router.post("/:surveyNumber/transfer/confirm", confirmTransfer);
router.get("/:surveyNumber/transfer/status", getTransferStatus);

// 3. Dispute Management
router.post("/disputes/flag", flagDispute);
router.post("/disputes/unflag", unflagDispute);
router.get("/disputes/:surveyNumber", viewDisputeDetails);

// 4. Document Handling (General)
router.post("/documents/upload", uploadDocument);
router.get("/documents/:surveyNumber", listDocumentsForParcel);

// 7. Public Search (Note: These might be better in a separate 'publicRoutes.js' but for now, adding here)
router.get("/public/search", searchLandPublic);

// Existing routes (if still relevant)
router.post("/mint", mintLand);
router.post("/transfer", transferLand);

export default router;
