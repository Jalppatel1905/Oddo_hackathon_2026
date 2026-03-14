"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Select from "react-select";

interface Product {
  id: string;
  name: string;
  sku: string;
  availableQuantity?: number;
}

interface Warehouse {
  id: string;
  name: string;
}

interface Line {
  productId: string;
  quantity: string;
}

export default function NewDeliveryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    customer: "",
    warehouseId: "",
    notes: "",
  });
  const [lines, setLines] = useState<Line[]>([{ productId: "", quantity: "" }]);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Fetch products when warehouse is selected
  useEffect(() => {
    if (formData.warehouseId) {
      fetchWarehouseProducts();
    } else {
      setProducts([]);
      setLines([{ productId: "", quantity: "" }]);
    }
  }, [formData.warehouseId]);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const data = await res.json();
      setWarehouses(data.filter((w: Warehouse & { isActive: boolean }) => w.isActive));
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };

  const fetchWarehouseProducts = async () => {
    try {
      const res = await fetch(`/api/warehouses/${formData.warehouseId}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const addLine = () => {
    setLines([...lines, { productId: "", quantity: "" }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: keyof Line, value: string) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validLines = lines.filter((l) => l.productId && l.quantity);
    if (validLines.length === 0) {
      setError("Please add at least one product");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lines: validLines,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create delivery");
        setLoading(false);
        return;
      }

      router.push(`/dashboard/deliveries/${data.id}`);
    } catch (error) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="New Delivery"
        description="Create outgoing stock delivery"
        actions={
          <Link
            href="/dashboard/deliveries"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <div className="p-6">
        <div className="max-w-4xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Customer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Customer name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Warehouse *
                  </label>
                  <Select
                    options={warehouses.map((w) => ({
                      value: w.id,
                      label: w.name,
                    }))}
                    value={
                      formData.warehouseId
                        ? {
                            value: formData.warehouseId,
                            label: warehouses.find((w) => w.id === formData.warehouseId)?.name || "",
                          }
                        : null
                    }
                    onChange={(option) =>
                      setFormData({ ...formData, warehouseId: option?.value || "" })
                    }
                    placeholder="Search warehouse..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Products *
                  </label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </button>
                </div>

                <div className="space-y-2">
                  {!formData.warehouseId && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Please select a warehouse first to see available products
                    </div>
                  )}
                  {lines.map((line, index) => {
                    const selectedProduct = products.find((p) => p.id === line.productId);
                    return (
                      <div key={index} className="flex gap-2">
                        <div className="flex-1">
                          <Select
                            options={products.map((p) => ({
                              value: p.id,
                              label: `${p.name} (${p.sku}) - Available: ${p.availableQuantity || 0}`,
                            }))}
                            value={
                              line.productId
                                ? {
                                    value: line.productId,
                                    label: selectedProduct
                                      ? `${selectedProduct.name} (${selectedProduct.sku}) - Available: ${selectedProduct.availableQuantity || 0}`
                                      : "",
                                  }
                                : null
                            }
                            onChange={(option) =>
                              updateLine(index, "productId", option?.value || "")
                            }
                            placeholder="Search product..."
                            className="react-select-container"
                            classNamePrefix="react-select"
                            isClearable
                            isDisabled={!formData.warehouseId}
                          />
                        </div>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          max={selectedProduct?.availableQuantity || undefined}
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(index, "quantity", e.target.value)
                          }
                          placeholder="Quantity"
                          className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="p-2 text-red-600 hover:text-red-700 dark:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Delivery"}
                </button>
                <Link
                  href="/dashboard/deliveries"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
