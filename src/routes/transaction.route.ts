import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addTransaction, getTotals } from "../controllers/transaction.controller";




const router = express.Router();

// Transaction routes
router.post('/transactions', authMiddleware, addTransaction);
router.get('/totals', authMiddleware, getTotals);

export default router;