// routes/simulatorRoutes.js
import express from 'express';
import { simulateScenario } from '../controllers/simulatorController.js';
const router = express.Router();

router.post('/simulate', simulateScenario);

export default router;
