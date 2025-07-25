import express from 'express';
import { queryAI, interpretDocument } from '../controllers/aiController.js';
import auth from '../middleware/auth.js'; // Assuming AI endpoints might require authentication

const router = express.Router();

// AI Agent Integration
router.post('/query', auth, queryAI);
router.post('/document/interpret', auth, interpretDocument);

export default router;