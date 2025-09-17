import express from "express";
import { dashboardController } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard - Get dashboard statistics
router.get("/", dashboardController.getDashboardStats);

// GET /api/dashboard/orders - Get order statistics by date range
router.get("/orders", dashboardController.getOrderStats);

// GET /api/dashboard/products - Get product performance
router.get("/products", dashboardController.getProductPerformance);

export default router;
