import express from "express";
import { customersController } from "../controllers/customersController.js";

const router = express.Router();

// GET /api/customers - Get all customers
router.get("/", customersController.getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get("/:id", customersController.getCustomerById);

// POST /api/customers - Create new customer
router.post("/", customersController.createCustomer);

// PUT /api/customers/:id - Update customer
router.put("/:id", customersController.updateCustomer);

// DELETE /api/customers/:id - Delete customer
router.delete("/:id", customersController.deleteCustomer);

export default router;
