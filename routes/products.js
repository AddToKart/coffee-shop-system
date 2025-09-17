import express from "express";
import { productsController } from "../controllers/productsController.js";

const router = express.Router();

// GET /api/products - Get all products
router.get("/", productsController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get("/:id", productsController.getProductById);

// POST /api/products - Create new product
router.post("/", productsController.createProduct);

// PUT /api/products/:id - Update product
router.put("/:id", productsController.updateProduct);

// DELETE /api/products/:id - Delete product
router.delete("/:id", productsController.deleteProduct);

export default router;
