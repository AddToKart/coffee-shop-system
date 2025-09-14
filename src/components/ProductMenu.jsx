import { useState } from "react";
import { Plus, Filter, Edit, Settings, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import ProductForm from "./ProductForm";

const ProductMenu = ({
  products,
  onAddToCart,
  onProductUpdate,
  isAdmin = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Get unique categories
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      coffee: "☕",
      tea: "🍵",
      pastry: "🥐",
      sandwich: "🥯",
      beverage: "🥤",
      dessert: "🍰",
      All: "🍽️",
    };
    return emojiMap[category] || "🍽️";
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      try {
        const response = await fetch(
          `http://localhost:3001/api/products/${product.id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          onProductUpdate();
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleProductSave = async (productData) => {
    try {
      const url = productData.id
        ? `http://localhost:3001/api/products/${productData.id}`
        : "http://localhost:3001/api/products";

      const method = productData.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        onProductUpdate();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      throw error;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Menu
          </CardTitle>
          {isAdmin && (
            <Button
              onClick={handleAddProduct}
              size="sm"
              className="gap-2 btn-press animate-bounceIn"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-sm btn-press"
            >
              {getCategoryEmoji(category)} {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product, index) => (
            <Card
              key={product.id}
              className={`card-hover animate-fadeIn ${
                !product.available ? "opacity-60" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      {!product.available && (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      {product.description}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-lg font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {getCategoryEmoji(product.category)} {product.category}
                  </Badge>
                  <div className="flex gap-2">
                    {isAdmin && (
                      <>
                        <Button
                          onClick={() => handleEditProduct(product)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 btn-press"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteProduct(product)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 btn-press"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => onAddToCart(product)}
                      size="sm"
                      className="gap-1 btn-press"
                      disabled={!product.available}
                    >
                      <Plus className="h-4 w-4" />
                      {product.available ? "Add" : "Unavailable"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products found in this category.</p>
          </div>
        )}
      </CardContent>

      {/* Product Form Modal */}
      <ProductForm
        isOpen={isProductFormOpen}
        onClose={() => setIsProductFormOpen(false)}
        product={editingProduct}
        onSave={handleProductSave}
      />
    </Card>
  );
};

export default ProductMenu;
