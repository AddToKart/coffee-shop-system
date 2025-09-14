import sqlite3 from "sqlite3";
import { promisify } from "util";

const db = new sqlite3.Database("./coffee_shop.db");

// Promisify database methods for async/await support
db.getAsync = promisify(db.get.bind(db));
db.allAsync = promisify(db.all.bind(db));
db.runAsync = promisify(db.run.bind(db));

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Products table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Customers table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Orders table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        customer_id INTEGER,
        customer_name TEXT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        order_type TEXT DEFAULT 'dine-in',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      )
    `);

    // Order items table
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT NOT NULL,
        product_id INTEGER NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);

    // Insert sample products
    const sampleProducts = [
      {
        name: "Espresso",
        description: "Rich and bold coffee shot",
        price: 2.5,
        category: "Coffee",
      },
      {
        name: "Cappuccino",
        description: "Espresso with steamed milk and foam",
        price: 4.0,
        category: "Coffee",
      },
      {
        name: "Latte",
        description: "Espresso with steamed milk",
        price: 4.5,
        category: "Coffee",
      },
      {
        name: "Americano",
        description: "Espresso with hot water",
        price: 3.0,
        category: "Coffee",
      },
      {
        name: "Mocha",
        description: "Espresso with chocolate and steamed milk",
        price: 5.0,
        category: "Coffee",
      },
      {
        name: "Macchiato",
        description: "Espresso with a dollop of foam",
        price: 3.5,
        category: "Coffee",
      },
      {
        name: "Croissant",
        description: "Buttery, flaky pastry",
        price: 3.5,
        category: "Pastry",
      },
      {
        name: "Blueberry Muffin",
        description: "Fresh baked muffin with blueberries",
        price: 2.75,
        category: "Pastry",
      },
      {
        name: "Bagel with Cream Cheese",
        description: "Everything bagel with cream cheese",
        price: 4.25,
        category: "Food",
      },
      {
        name: "Green Tea",
        description: "Organic green tea",
        price: 2.25,
        category: "Tea",
      },
    ];

    // Check if products already exist
    const existingProducts = await db.getAsync(
      "SELECT COUNT(*) as count FROM products"
    );

    if (existingProducts.count === 0) {
      for (const product of sampleProducts) {
        await db.runAsync(
          "INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)",
          [product.name, product.description, product.price, product.category]
        );
      }
      console.log("Sample products inserted successfully");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export default db;
