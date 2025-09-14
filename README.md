# ☕ Brew & Bean Coffee Shop Order System

A complete coffee shop order management system built with React, Express.js, and SQLite.

## Features

- **Order Taking**: Interactive menu with cart functionality
- **Order Management**: View and update order statuses
- **Dashboard**: Real-time analytics and recent order tracking
- **Database**: SQLite database with proper relationships
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: SQLite
- **Development**: Concurrently for running both servers

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start the Application**

   ```bash
   npm run dev:full
   ```

   This starts both the backend server (port 3001) and frontend (port 5173)

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001

## Available Scripts

- `npm run dev` - Start frontend development server only
- `npm run server` - Start backend server only
- `npm run dev:full` - Start both servers concurrently
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Database Schema

The system uses SQLite with the following tables:

- **products**: Coffee shop menu items
- **customers**: Customer information
- **orders**: Order headers with customer and totals
- **order_items**: Individual items within orders

## Usage

### Taking Orders

1. Navigate to "Take Order" tab
2. Browse the menu by category
3. Add items to cart with quantity controls
4. Enter customer name and order details
5. Submit the order

### Managing Orders

1. Go to "Order History" tab
2. Click on any order to view details
3. Update order status (pending → preparing → ready → completed)
4. View order items and customer notes

### Dashboard

1. Visit "Dashboard" tab
2. View today's statistics (orders, revenue)
3. Monitor pending orders
4. See recent order activity

## API Endpoints

### Products

- `GET /api/products` - Get all available products
- `GET /api/products/:id` - Get specific product
- `POST /api/products` - Create new product

### Orders

- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order with items
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id/status` - Update order status

### Dashboard

- `GET /api/dashboard` - Get dashboard statistics

### Customers

- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create new customer

## Sample Data

The system comes pre-loaded with sample coffee shop products including:

- Various coffee drinks (Espresso, Cappuccino, Latte, etc.)
- Pastries and food items
- Different price points and categories

## Development

The application is structured as follows:

```
src/
  components/
    ProductMenu.jsx    # Menu display and filtering
    OrderCart.jsx      # Shopping cart and order submission
    OrderHistory.jsx   # Order list and management
    Dashboard.jsx      # Analytics and quick stats
  App.jsx             # Main application with routing
  main.jsx           # React entry point
  index.css          # Tailwind CSS imports

server.js            # Express API server
database.js          # SQLite database setup and initialization
```

## Contributing

Feel free to extend the system with additional features like:

- Customer management
- Inventory tracking
- Payment processing
- Receipt printing
- Reporting and analytics
- Multi-location support+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
