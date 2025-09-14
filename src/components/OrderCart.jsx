import { useState } from "react";
import { ShoppingCart, Minus, Plus, Trash2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";

const OrderCart = ({ cart, onUpdateQuantity, onSubmitOrder }) => {
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Please enter customer name");
      return;
    }
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitOrder(customerName, orderType, notes);
      setCustomerName("");
      setNotes("");
    } catch (error) {
      console.error("Error submitting order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOrderTypeEmoji = (type) => {
    const emojiMap = {
      "dine-in": "🍽️",
      "takeaway": "🥡",
      "delivery": "🚚"
    };
    return emojiMap[type] || "🍽️";
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Current Order
          {cart.length > 0 && (
            <Badge variant="secondary">{cart.length} items</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cart Items */}
        <div className="space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    ${item.price.toFixed(2)} each
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onUpdateQuantity(item.id, 0)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="w-16 text-right font-semibold text-primary">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total */}
        {cart.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold">
              <span>Total:</span>
              <span className="text-primary">${totalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Name *</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Order Type</label>
            <div className="grid grid-cols-3 gap-2">
              {["dine-in", "takeaway", "delivery"].map((type) => (
                <Button
                  key={type}
                  type="button"
                  variant={orderType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOrderType(type)}
                  className="text-xs"
                >
                  {getOrderTypeEmoji(type)} {type.replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Special Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special requests..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Order
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderCart;