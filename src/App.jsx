import { useState, useEffect } from "react";
import { Coffee, ShoppingCart, History, BarChart3 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { ThemeToggle } from "./components/theme-toggle";
import ProductMenu from "./components/ProductMenu";
import OrderCart from "./components/OrderCart";
import OrderHistory from "./components/OrderHistory";
import Dashboard from "./components/Dashboard";

const App = () => {
  const [activeTab, setActiveTab] = useState("order");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(true); // Enable admin mode for demo

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      setCart(cart.filter((item) => item.id !== productId));
    } else {
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const submitOrder = async (customerName, orderType, notes) => {
    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const response = await fetch("http://localhost:3001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: customerName,
          items: orderItems,
          order_type: orderType,
          notes: notes,
        }),
      });

      if (response.ok) {
        clearCart();
        fetchOrders(); // Refresh orders list
        alert("Order submitted successfully!");
      } else {
        alert("Error submitting order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Error submitting order");
    }
  };

  const getTotalCartItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getPendingOrdersCount = () => {
    return orders.filter((order) => order.status === "pending").length;
  };

  const renderContent = () => {
    switch (activeTab) {
      case "order":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ProductMenu
                products={products}
                onAddToCart={addToCart}
                onProductUpdate={fetchProducts}
                isAdmin={isAdmin}
              />
            </div>
            <div>
              <OrderCart
                cart={cart}
                onUpdateQuantity={updateCartQuantity}
                onSubmitOrder={submitOrder}
              />
            </div>
          </div>
        );
      case "orders":
        return <OrderHistory orders={orders} onRefresh={fetchOrders} />;
      case "dashboard":
        return <Dashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coffee className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">
                Brew & Bean Coffee
              </h1>
            </div>

            <div className="flex items-center space-x-2">
              <nav className="flex items-center space-x-2">
                <Button
                  variant={activeTab === "order" ? "default" : "ghost"}
                  onClick={() => setActiveTab("order")}
                  className="relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Take Order
                  {getTotalCartItems() > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {getTotalCartItems()}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant={activeTab === "orders" ? "default" : "ghost"}
                  onClick={() => setActiveTab("orders")}
                  className="relative"
                >
                  <History className="h-4 w-4 mr-2" />
                  Orders
                  {getPendingOrdersCount() > 0 && (
                    <Badge
                      variant="secondary"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {getPendingOrdersCount()}
                    </Badge>
                  )}
                </Button>

                <Button
                  variant={activeTab === "dashboard" ? "default" : "ghost"}
                  onClick={() => setActiveTab("dashboard")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </nav>

              <div className="border-l pl-2 ml-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{renderContent()}</main>
    </div>
  );
};

export default App;
