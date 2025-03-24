import express from "express";
import { loginAdmin, changePassword, forgotPassword, resetPassword, logout, Auth } from "../controllers/admin.controller";
import { authMiddleware } from "../middlewares/auth.middleware";


const router = express.Router();

router.post("/login", loginAdmin);
router.post("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/logout", logout);
router.get("/auth",authMiddleware, Auth);

export default router;
