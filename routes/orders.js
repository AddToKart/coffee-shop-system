import express from "express";
import { ordersController } from "../controllers/ordersController.js";

const router = express.Router();

// GET /api/orders - Get all orders
router.get("/", ordersController.getAllOrders);

// GET /api/orders/:id - Get order by ID with items
router.get("/:id", ordersController.getOrderById);

// POST /api/orders - Create new order
router.post("/", ordersController.createOrder);

// PATCH /api/orders/:id/status - Update order status
router.patch("/:id/status", ordersController.updateOrderStatus);

export default router;
