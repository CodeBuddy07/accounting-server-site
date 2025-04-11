import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addCustomer, deleteCustomer, editCustomer, getCustomers } from "../controllers/customer.controller";


const router = express.Router();

// Customer routes
router.get("/",authMiddleware, getCustomers);
router.post('/', authMiddleware, addCustomer);
router.put('/:id', authMiddleware, editCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);

export default router;