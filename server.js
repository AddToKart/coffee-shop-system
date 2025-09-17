import express from "express";
import cors from "cors";
import { initializeDatabase } from "./database.js";

// Import route modules
import productsRoutes from "./routes/products.js";
import ordersRoutes from "./routes/orders.js";
import customersRoutes from "./routes/customers.js";
import dashboardRoutes from "./routes/dashboard.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database on startup
initializeDatabase();

// Mount routes
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Coffee shop server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for API routes - must be after all other routes
app.use("/api", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Coffee shop server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
