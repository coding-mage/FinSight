// routes/expenseAIRoutes.js
import express from 'express';
import multer from 'multer';
import { parseExpense, autocompleteIncome } from '../controllers/expenseAIController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/parse-expense', upload.single('file'), parseExpense);
router.post('/autocomplete-income', autocompleteIncome);

export default router;
