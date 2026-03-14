"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  sku: string;
  unitOfMeasure: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

interface Stock {
  productId: string;
  warehouseId: string;
  quantity: number;
  product: Product;
  warehouse: Warehouse;
}

interface Adjustment {
  id: string;
  adjustmentNo: string;
  product: Product;
  warehouse: Warehouse;
  oldQuantity: number;
  newQuantity: number;
  difference: number;
  reason: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [productId, setProductId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchAdjustments();
    fetchWarehouses();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productId && warehouseId) {
      fetchCurrentStock();
    }
  }, [productId, warehouseId]);

  const fetchAdjustments = async () => {
    try {
      const res = await fetch("/api/adjustments");
      const data = await res.json();
      setAdjustments(data);
    } catch (error) {
      console.error("Failed to fetch adjustments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const data = await res.json();
      setWarehouses(data.filter((w: Warehouse & { isActive: boolean }) => w.isActive));
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCurrentStock = async () => {
    try {
      const res = await fetch("/api/stocks");
      const data = await res.json();
      setStocks(data);
    } catch (error) {
      console.error("Failed to fetch stocks:", error);
    }
  };

  const getCurrentStockQuantity = () => {
    const stock = stocks.find(
      (s) => s.productId === productId && s.warehouseId === warehouseId
    );
    return stock?.quantity || 0;
  };

  const handleCreateAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productId || !warehouseId || !newQuantity || !reason) {
      alert("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/adjustments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          warehouseId,
          newQuantity: parseFloat(newQuantity),
          reason,
        }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setProductId("");
        setWarehouseId("");
        setNewQuantity("");
        setReason("");
        fetchAdjustments();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create adjustment");
      }
    } catch (error) {
      console.error("Failed to create adjustment:", error);
      alert("Failed to create adjustment");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Create Adjustment Form
  if (showCreateForm) {
    const currentStock = getCurrentStockQuantity();
    const difference = newQuantity ? parseFloat(newQuantity) - currentStock : 0;

    return (
      <div>
        <Header
          title="Create Stock Adjustment"
          description="Adjust stock levels to fix discrepancies"
        />
        <div className="p-6">
          <form onSubmit={handleCreateAdjustment} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Warehouse *
                  </label>
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="">Select warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} - {warehouse.location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Product *
                  </label>
                  <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    required
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {productId && warehouseId && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Current Stock
                      </label>
                      <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <span className="font-semibold">{currentStock}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          {products.find((p) => p.id === productId)?.unitOfMeasure}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        New Quantity *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                        required
                        min="0"
                      />
                    </div>
                  </>
                )}

                {newQuantity && productId && warehouseId && (
                  <div className="col-span-2">
                    <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2">
                        {difference > 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        ) : difference < 0 ? (
                          <TrendingDown className="w-5 h-5 text-red-600" />
                        ) : null}
                        <span className="font-medium">
                          Difference:
                          <span className={difference > 0 ? "text-green-600 ml-2" : difference < 0 ? "text-red-600 ml-2" : "ml-2"}>
                            {difference > 0 ? "+" : ""}{difference.toFixed(2)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Reason *</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    rows={3}
                    placeholder="Explain why this adjustment is needed (e.g., Physical count correction, Damaged goods, etc.)"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Adjustment</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Adjustments List
  return (
    <div>
      <Header
        title="Stock Adjustments"
        description="Fix stock discrepancies"
      />
      <div className="p-6">
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Adjustment
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Adjustment No</th>
                <th className="text-left p-4">Product</th>
                <th className="text-left p-4">Warehouse</th>
                <th className="text-right p-4">Old Qty</th>
                <th className="text-right p-4">New Qty</th>
                <th className="text-right p-4">Difference</th>
                <th className="text-left p-4">Reason</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">By</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center p-8 text-gray-500">
                    No adjustments found. Create your first adjustment.
                  </td>
                </tr>
              ) : (
                adjustments.map((adjustment) => (
                  <tr
                    key={adjustment.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-4 font-medium">{adjustment.adjustmentNo}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{adjustment.product.name}</div>
                        <div className="text-gray-500">{adjustment.product.sku}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{adjustment.warehouse.name}</div>
                        <div className="text-gray-500">{adjustment.warehouse.location}</div>
                      </div>
                    </td>
                    <td className="p-4 text-right">{adjustment.oldQuantity}</td>
                    <td className="p-4 text-right font-semibold">{adjustment.newQuantity}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {adjustment.difference > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-green-600 font-semibold">
                              +{adjustment.difference}
                            </span>
                          </>
                        ) : adjustment.difference < 0 ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-red-600 font-semibold">
                              {adjustment.difference}
                            </span>
                          </>
                        ) : (
                          <span>0</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 max-w-xs truncate" title={adjustment.reason}>
                      {adjustment.reason}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(adjustment.createdAt), "PP")}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {adjustment.user.name}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
