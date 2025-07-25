import express from 'express';
import { signup, login, getCurrentUser, getAvailableRoles } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getCurrentUser);
router.get('/roles', auth, getAvailableRoles);

export default router;