import db from "../database.js";
import { v4 as uuidv4 } from "uuid";

export const ordersController = {
  // Get all orders with item count
  getAllOrders: async (req, res) => {
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
  },

  // Get order by ID with items
  getOrderById: async (req, res) => {
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
  },

  // Create new order
  createOrder: async (req, res) => {
    try {
      const {
        customer_name,
        items,
        order_type = "dine-in",
        notes = "",
      } = req.body;

      // Validation
      if (!customer_name || !items || items.length === 0) {
        return res.status(400).json({
          error: "Customer name and items are required",
        });
      }

      // Validate items structure
      for (const item of items) {
        if (
          !item.product_id ||
          !item.product_name ||
          !item.quantity ||
          !item.unit_price
        ) {
          return res.status(400).json({
            error:
              "Each item must have product_id, product_name, quantity, and unit_price",
          });
        }
        if (item.quantity <= 0 || item.unit_price <= 0) {
          return res.status(400).json({
            error: "Quantity and unit price must be positive numbers",
          });
        }
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
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = [
        "pending",
        "preparing",
        "ready",
        "completed",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Valid statuses are: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      // Check if order exists
      const existingOrder = await db.getAsync(
        "SELECT * FROM orders WHERE id = ?",
        [id]
      );
      if (!existingOrder) {
        return res.status(404).json({ error: "Order not found" });
      }

      await db.runAsync("UPDATE orders SET status = ? WHERE id = ?", [
        status,
        id,
      ]);

      res.json({
        message: "Order status updated successfully",
        orderId: id,
        newStatus: status,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
