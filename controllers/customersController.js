import db from "../database.js";

export const customersController = {
  // Get all customers
  getAllCustomers: async (req, res) => {
    try {
      const customers = await db.allAsync(
        "SELECT * FROM customers ORDER BY name"
      );
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get customer by ID
  getCustomerById: async (req, res) => {
    try {
      const customer = await db.getAsync(
        "SELECT * FROM customers WHERE id = ?",
        [req.params.id]
      );

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new customer
  createCustomer: async (req, res) => {
    try {
      const { name, phone, email } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({ error: "Customer name is required" });
      }

      // Basic email validation if provided
      if (email && !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      const result = await db.runAsync(
        "INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)",
        [name, phone || null, email || null]
      );

      res.status(201).json({
        id: result.lastID,
        message: "Customer created successfully",
      });
    } catch (error) {
      // Handle unique constraint violations
      if (error.message.includes("UNIQUE constraint")) {
        return res
          .status(409)
          .json({ error: "Customer with this email already exists" });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Update customer
  updateCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, email } = req.body;

      // Check if customer exists
      const existingCustomer = await db.getAsync(
        "SELECT * FROM customers WHERE id = ?",
        [id]
      );
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      // Basic email validation if provided
      if (email && !email.includes("@")) {
        return res.status(400).json({ error: "Invalid email format" });
      }

      await db.runAsync(
        "UPDATE customers SET name = ?, phone = ?, email = ? WHERE id = ?",
        [
          name || existingCustomer.name,
          phone !== undefined ? phone : existingCustomer.phone,
          email !== undefined ? email : existingCustomer.email,
          id,
        ]
      );

      res.json({ message: "Customer updated successfully" });
    } catch (error) {
      if (error.message.includes("UNIQUE constraint")) {
        return res
          .status(409)
          .json({ error: "Customer with this email already exists" });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // Delete customer
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if customer exists
      const existingCustomer = await db.getAsync(
        "SELECT * FROM customers WHERE id = ?",
        [id]
      );
      if (!existingCustomer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      await db.runAsync("DELETE FROM customers WHERE id = ?", [id]);
      res.json({ message: "Customer deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
