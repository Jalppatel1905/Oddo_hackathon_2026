"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Plus, Package, Check, X, Eye } from "lucide-react";
import { format } from "date-fns";
import Select from "react-select";

interface Product {
  id: string;
  name: string;
  sku: string;
  unitOfMeasure: string;
  availableQuantity?: number;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

interface TransferLine {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

interface Transfer {
  id: string;
  transferNo: string;
  fromWarehouse: Warehouse;
  toWarehouse: Warehouse;
  status: string;
  notes?: string;
  createdAt: string;
  validatedAt?: string;
  lines: TransferLine[];
  user: {
    name: string;
    email: string;
  };
}

export default function TransfersPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<{ productId: string; quantity: string }[]>([
    { productId: "", quantity: "" },
  ]);

  useEffect(() => {
    fetchTransfers();
    fetchWarehouses();
  }, []);

  // Fetch products when FROM warehouse is selected
  useEffect(() => {
    if (fromWarehouseId) {
      fetchWarehouseProducts();
    } else {
      setProducts([]);
      setLines([{ productId: "", quantity: "" }]);
    }
  }, [fromWarehouseId]);

  const fetchTransfers = async () => {
    try {
      const res = await fetch("/api/transfers");
      const data = await res.json();
      setTransfers(data);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
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

  const fetchWarehouseProducts = async () => {
    try {
      const res = await fetch(`/api/warehouses/${fromWarehouseId}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    const validLines = lines.filter(
      (line) => line.productId && line.quantity && parseFloat(line.quantity) > 0
    );

    if (validLines.length === 0) {
      alert("Please add at least one product");
      return;
    }

    if (fromWarehouseId === toWarehouseId) {
      alert("Source and destination warehouses must be different");
      return;
    }

    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWarehouseId,
          toWarehouseId,
          notes,
          lines: validLines,
        }),
      });

      if (res.ok) {
        setShowCreateForm(false);
        setFromWarehouseId("");
        setToWarehouseId("");
        setNotes("");
        setLines([{ productId: "", quantity: "" }]);
        fetchTransfers();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create transfer");
      }
    } catch (error) {
      console.error("Failed to create transfer:", error);
      alert("Failed to create transfer");
    }
  };

  const handleValidateTransfer = async (id: string) => {
    if (!confirm("Are you sure you want to validate this transfer? Stock levels will be updated.")) {
      return;
    }

    try {
      const res = await fetch(`/api/transfers/${id}/validate`, {
        method: "POST",
      });

      if (res.ok) {
        fetchTransfers();
        setSelectedTransfer(null);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to validate transfer");
      }
    } catch (error) {
      console.error("Failed to validate transfer:", error);
      alert("Failed to validate transfer");
    }
  };

  const addLine = () => {
    setLines([...lines, { productId: "", quantity: "" }]);
  };

  const removeLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: string, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      waiting: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      ready: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // View Transfer Details
  if (selectedTransfer) {
    return (
      <div>
        <Header
          title={`Transfer ${selectedTransfer.transferNo}`}
          description="Transfer details"
        />
        <div className="p-6 space-y-6">
          <Button
            variant="outline"
            onClick={() => setSelectedTransfer(null)}
          >
            ← Back to List
          </Button>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transfer No</p>
                <p className="font-semibold">{selectedTransfer.transferNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <div className="mt-1">{getStatusBadge(selectedTransfer.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">From Warehouse</p>
                <p className="font-semibold">{selectedTransfer.fromWarehouse.name}</p>
                <p className="text-sm text-gray-500">{selectedTransfer.fromWarehouse.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">To Warehouse</p>
                <p className="font-semibold">{selectedTransfer.toWarehouse.name}</p>
                <p className="text-sm text-gray-500">{selectedTransfer.toWarehouse.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created By</p>
                <p className="font-semibold">{selectedTransfer.user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
                <p className="font-semibold">
                  {format(new Date(selectedTransfer.createdAt), "PPp")}
                </p>
              </div>
              {selectedTransfer.validatedAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Validated At</p>
                  <p className="font-semibold">
                    {format(new Date(selectedTransfer.validatedAt), "PPp")}
                  </p>
                </div>
              )}
              {selectedTransfer.notes && (
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Notes</p>
                  <p className="mt-1">{selectedTransfer.notes}</p>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold mb-4">Products</h3>
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">SKU</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-left py-2 pl-4">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTransfer.lines.map((line) => (
                    <tr key={line.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">{line.product.name}</td>
                      <td className="py-2 text-gray-600 dark:text-gray-400">{line.product.sku}</td>
                      <td className="py-2 text-right font-semibold">{line.quantity}</td>
                      <td className="py-2 pl-4 text-gray-600 dark:text-gray-400">
                        {line.product.unitOfMeasure}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedTransfer.status !== "done" && selectedTransfer.status !== "canceled" && (
              <div className="mt-6 flex gap-2">
                <Button
                  onClick={() => handleValidateTransfer(selectedTransfer.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Validate Transfer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Create Transfer Form
  if (showCreateForm) {
    return (
      <div>
        <Header
          title="Create Internal Transfer"
          description="Transfer stock between warehouses"
        />
        <div className="p-6">
          <form onSubmit={handleCreateTransfer} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From Warehouse *
                  </label>
                  <Select
                    options={warehouses.map((w) => ({
                      value: w.id,
                      label: `${w.name} - ${w.location}`,
                    }))}
                    value={
                      fromWarehouseId
                        ? {
                            value: fromWarehouseId,
                            label: warehouses.find((w) => w.id === fromWarehouseId)
                              ? `${warehouses.find((w) => w.id === fromWarehouseId)?.name} - ${warehouses.find((w) => w.id === fromWarehouseId)?.location}`
                              : "",
                          }
                        : null
                    }
                    onChange={(option) => {
                      setFromWarehouseId(option?.value || "");
                      // Reset TO warehouse if same as FROM
                      if (option?.value === toWarehouseId) {
                        setToWarehouseId("");
                      }
                    }}
                    placeholder="Search from warehouse..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    To Warehouse *
                  </label>
                  <Select
                    options={warehouses
                      .filter((w) => w.id !== fromWarehouseId)
                      .map((w) => ({
                        value: w.id,
                        label: `${w.name} - ${w.location}`,
                      }))}
                    value={
                      toWarehouseId
                        ? {
                            value: toWarehouseId,
                            label: warehouses.find((w) => w.id === toWarehouseId)
                              ? `${warehouses.find((w) => w.id === toWarehouseId)?.name} - ${warehouses.find((w) => w.id === toWarehouseId)?.location}`
                              : "",
                          }
                        : null
                    }
                    onChange={(option) => setToWarehouseId(option?.value || "")}
                    placeholder="Search to warehouse..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    isClearable
                    isDisabled={!fromWarehouseId}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Products</h3>
                  <Button type="button" onClick={addLine} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>

                <div className="space-y-3">
                  {!fromWarehouseId && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                      Please select a FROM warehouse first to see available products
                    </div>
                  )}
                  {lines.map((line, index) => {
                    const selectedProduct = products.find((p) => p.id === line.productId);
                    return (
                      <div key={index} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product</label>
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
                            isDisabled={!fromWarehouseId}
                          />
                        </div>
                        <div className="w-32">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                          <input
                            type="number"
                            step="0.01"
                            value={line.quantity}
                            onChange={(e) => updateLine(index, "quantity", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white"
                            required
                            min="0.01"
                            max={selectedProduct?.availableQuantity || undefined}
                          />
                        </div>
                        {lines.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => removeLine(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Transfer</Button>
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

  // Transfer List
  return (
    <div>
      <Header
        title="Internal Transfers"
        description="Move stock between warehouses"
      />
      <div className="p-6">
        <div className="mb-6">
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Transfer
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">Transfer No</th>
                <th className="text-left p-4">From</th>
                <th className="text-left p-4">To</th>
                <th className="text-left p-4">Items</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    No transfers found. Create your first transfer.
                  </td>
                </tr>
              ) : (
                transfers.map((transfer) => (
                  <tr
                    key={transfer.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-4 font-medium">{transfer.transferNo}</td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{transfer.fromWarehouse.name}</div>
                        <div className="text-gray-500">{transfer.fromWarehouse.location}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div className="font-medium">{transfer.toWarehouse.name}</div>
                        <div className="text-gray-500">{transfer.toWarehouse.location}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Package className="w-4 h-4 mr-1" />
                        {transfer.lines.length}
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(transfer.status)}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                      {format(new Date(transfer.createdAt), "PP")}
                    </td>
                    <td className="p-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransfer(transfer)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
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
