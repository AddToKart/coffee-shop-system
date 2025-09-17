import db from "../database.js";

export const productsController = {
  // Get all available products
  getAllProducts: async (req, res) => {
    try {
      const products = await db.allAsync(
        "SELECT * FROM products WHERE available = 1 ORDER BY category, name"
      );
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get product by ID
  getProductById: async (req, res) => {
    try {
      const product = await db.getAsync("SELECT * FROM products WHERE id = ?", [
        req.params.id,
      ]);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create new product
  createProduct: async (req, res) => {
    try {
      const { name, description, price, category, available = true } = req.body;

      // Validation
      if (!name || !description || !price || !category) {
        return res.status(400).json({
          error: "Name, description, price, and category are required",
        });
      }

      if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
        return res
          .status(400)
          .json({ error: "Price must be a positive number" });
      }

      const result = await db.runAsync(
        "INSERT INTO products (name, description, price, category, available) VALUES (?, ?, ?, ?, ?)",
        [name, description, parseFloat(price), category, available ? 1 : 0]
      );

      res.status(201).json({
        id: result.lastID,
        message: "Product created successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update product
  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, category, available } = req.body;

      // Check if product exists
      const existingProduct = await db.getAsync(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      // Validation
      if (
        price !== undefined &&
        (isNaN(parseFloat(price)) || parseFloat(price) <= 0)
      ) {
        return res
          .status(400)
          .json({ error: "Price must be a positive number" });
      }

      await db.runAsync(
        "UPDATE products SET name = ?, description = ?, price = ?, category = ?, available = ? WHERE id = ?",
        [
          name || existingProduct.name,
          description || existingProduct.description,
          price !== undefined ? parseFloat(price) : existingProduct.price,
          category || existingProduct.category,
          available !== undefined
            ? available
              ? 1
              : 0
            : existingProduct.available,
          id,
        ]
      );

      res.json({ message: "Product updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete product
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;

      // Check if product exists
      const existingProduct = await db.getAsync(
        "SELECT * FROM products WHERE id = ?",
        [id]
      );
      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      await db.runAsync("DELETE FROM products WHERE id = ?", [id]);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
