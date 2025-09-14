import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import db, { initializeDatabase } from "./database.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase();

// Products endpoints
app.get("/api/products", async (req, res) => {
  try {
    const products = await db.allAsync(
      "SELECT * FROM products WHERE available = 1 ORDER BY category, name"
    );
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products/:id", async (req, res) => {
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
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, description, price, category, image_url } = req.body;
    const result = await db.runAsync(
      "INSERT INTO products (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, category, image_url]
    );
    res
      .status(201)
      .json({ id: result.lastID, message: "Product created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Orders endpoints
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await db.allAsync(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const order = await db.getAsync("SELECT * FROM orders WHERE id = ?", [
      req.params.id,
    ]);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderItems = await db.allAsync(
      "SELECT * FROM order_items WHERE order_id = ?",
      [req.params.id]
    );

    res.json({ ...order, items: orderItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const {
      customer_name,
      items,
      order_type = "dine-in",
      notes = "",
    } = req.body;

    if (!customer_name || !items || items.length === 0) {
      return res
        .status(400)
        .json({ error: "Customer name and items are required" });
    }

    const orderId = uuidv4();
    let totalAmount = 0;

    // Calculate total amount
    for (const item of items) {
      totalAmount += item.quantity * item.unit_price;
    }

    // Insert order
    await db.runAsync(
      "INSERT INTO orders (id, customer_name, total_amount, order_type, notes) VALUES (?, ?, ?, ?, ?)",
      [orderId, customer_name, totalAmount, order_type, notes]
    );

    // Insert order items
    for (const item of items) {
      await db.runAsync(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?)",
        [
          orderId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price,
        ]
      );
    }

    res.status(201).json({
      id: orderId,
      message: "Order created successfully",
      total_amount: totalAmount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    await db.runAsync("UPDATE orders SET status = ? WHERE id = ?", [
      status,
      req.params.id,
    ]);
    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customers endpoints
app.get("/api/customers", async (req, res) => {
  try {
    const customers = await db.allAsync(
      "SELECT * FROM customers ORDER BY name"
    );
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/customers", async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const result = await db.runAsync(
      "INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)",
      [name, phone, email]
    );
    res
      .status(201)
      .json({ id: result.lastID, message: "Customer created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard/stats endpoint
app.get("/api/dashboard", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const todayOrders = await db.getAsync(
      "SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders WHERE DATE(created_at) = ?",
      [today]
    );

    const pendingOrders = await db.getAsync(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );

    const totalProducts = await db.getAsync(
      "SELECT COUNT(*) as count FROM products WHERE available = 1"
    );

    const recentOrders = await db.allAsync(
      "SELECT * FROM orders ORDER BY created_at DESC LIMIT 5"
    );

    res.json({
      todayOrders: todayOrders.count,
      todayRevenue: todayOrders.revenue,
      pendingOrders: pendingOrders.count,
      totalProducts: totalProducts.count,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Coffee shop server running on port ${PORT}`);
});
