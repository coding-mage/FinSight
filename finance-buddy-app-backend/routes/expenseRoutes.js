import express from 'express';
const router = express.Router();
import { getExpenses } from '../controllers/expenseController.js';
import authenticateJWT from'../middleware/authMiddleware.js';

router.get('/', authenticateJWT, getExpenses);

export default router;