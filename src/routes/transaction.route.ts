import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addTransaction, getTotals, getTransactions } from "../controllers/transaction.controller";




const router = express.Router();

// Transaction routes
router.post('/', authMiddleware, addTransaction);
router.get('/', authMiddleware, getTransactions);
router.get('/totals', authMiddleware, getTotals);

export default router;