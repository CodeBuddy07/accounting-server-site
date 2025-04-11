import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { addProduct, deleteProduct, editProduct, getProducts } from "../controllers/product.controller";



const router = express.Router();

// Product routes
router.get('/', authMiddleware, getProducts);
router.post('/', authMiddleware, addProduct);
router.put('/:id', authMiddleware, editProduct);
router.delete('/:id', authMiddleware, deleteProduct);

export default router;