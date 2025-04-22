import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addCustomer, deleteCustomer, editCustomer, getCustomerReport, getCustomers, sendSMSToCustomer } from "../controllers/customer.controller";


const router = express.Router();

// Customer routes
router.get("/",authMiddleware, getCustomers);
router.post('/', authMiddleware, addCustomer);
router.put('/:id', authMiddleware, editCustomer);
router.post('/:id', authMiddleware, sendSMSToCustomer);
router.delete('/:id', authMiddleware, deleteCustomer);
router.get('/:customerId/report', getCustomerReport);

export default router;