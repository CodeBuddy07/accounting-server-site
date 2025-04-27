import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addTransaction, deleteTransaction, getTotals, getTransactions } from "../controllers/transaction.controller";




const router = express.Router();

// Transaction routes
router.post('/', authMiddleware, addTransaction);
router.delete('/:id', authMiddleware, deleteTransaction);
router.get('/', authMiddleware, getTransactions);
router.get('/totals', authMiddleware, getTotals);

export default router;