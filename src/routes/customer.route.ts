import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addCustomer, deleteCustomer, editCustomer } from "../controllers/customer.controller";


const router = express.Router();

// Customer routes
router.post('/', authMiddleware, addCustomer);
router.put('/:id', authMiddleware, editCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);

export default router;