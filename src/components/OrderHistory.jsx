import { useState, useEffect } from "react";
import { History, RefreshCw, Clock, User, DollarSign, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const OrderHistory = ({ orders, onRefresh }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'pending': return 'default';
      case 'preparing': return 'secondary';
      case 'ready': return 'outline';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '✅';
      case 'completed': return '📦';
      case 'cancelled': return '❌';
      default: return '⏳';
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        onRefresh();
        if (selectedOrder === orderId) {
          fetchOrderDetails(orderId);
        }
      } else {
        alert('Error updating order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${orderId}`);
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleOrderClick = (orderId) => {
    setSelectedOrder(orderId);
    fetchOrderDetails(orderId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Orders List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Order History
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <Card
                  key={order.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedOrder === order.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  onClick={() => handleOrderClick(order.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="font-bold text-primary">
                            ${order.total_amount.toFixed(2)}
                          </span>
                        </div>
                        <Badge variant={getStatusVariant(order.status)}>
                          {getStatusEmoji(order.status)} {order.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>🍽️ {order.order_type}</span>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        <span>{order.item_count} items</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOrder && orderDetails ? (
            <div className="space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="text-lg font-semibold">{orderDetails.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Order Type</label>
                  <p className="text-lg">🍽️ {orderDetails.order_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Amount</label>
                  <p className="text-lg font-bold text-primary">
                    ${orderDetails.total_amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge variant={getStatusVariant(orderDetails.status)} className="mt-1">
                    {getStatusEmoji(orderDetails.status)} {orderDetails.status}
                  </Badge>
                </div>
              </div>
              
              {orderDetails.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-lg">{orderDetails.notes}</p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Items
                </h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-semibold text-primary">
                          ${item.total_price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Status Update Buttons */}
              <div>
                <h3 className="font-semibold mb-3">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'preparing', 'ready', 'completed', 'cancelled'].map(status => (
                    <Button
                      key={status}
                      variant={orderDetails.status === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateOrderStatus(orderDetails.id, status)}
                      disabled={orderDetails.status === status}
                    >
                      {getStatusEmoji(status)} {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select an order to view details</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;