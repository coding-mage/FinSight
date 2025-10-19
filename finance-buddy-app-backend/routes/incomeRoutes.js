import express from 'express';
const router = express.Router();
import { getIncomes } from '../controllers/incomeController.js';
import authenticateJWT from '../middleware/authMiddleware.js';

router.get('/', authenticateJWT, getIncomes);

export default router;