import express from "express";
import {  getDashboardStats } from "../controllers/statistics.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardStats);


export default router;