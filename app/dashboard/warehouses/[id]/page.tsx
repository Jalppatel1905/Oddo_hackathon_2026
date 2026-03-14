"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ArrowLeft, MapPin, Package, TrendingUp, TrendingDown, AlertTriangle, Power, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  reorderLevel: number;
}

interface Stock {
  id: string;
  quantity: number;
  product: Product;
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  productCount: number;
  totalQuantity: number;
  stock: Stock[];
  _count: {
    stock: number;
    receipts: number;
    deliveries: number;
  };
}

export default function WarehouseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [warehouseId, setWarehouseId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setWarehouseId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouse();
    }
  }, [warehouseId]);

  const fetchWarehouse = async () => {
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}`);
      const data = await res.json();
      setWarehouse(data);
    } catch (error) {
      console.error("Failed to fetch warehouse:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!warehouse) return;

    setToggling(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: warehouse.name,
          location: warehouse.location,
          isActive: !warehouse.isActive,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWarehouse({ ...warehouse, isActive: data.isActive });
        toast.success(
          `Warehouse ${data.isActive ? "activated" : "deactivated"} successfully!`
        );
      } else {
        toast.error("Failed to update warehouse status");
      }
    } catch (error) {
      console.error("Failed to toggle warehouse status:", error);
      toast.error("Something went wrong");
    } finally {
      setToggling(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/warehouses/${warehouseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Warehouse deleted successfully!");
        router.push("/dashboard/warehouses");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete warehouse");
      }
    } catch (error) {
      console.error("Failed to delete warehouse:", error);
      toast.error("Something went wrong");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Warehouse not found
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title={warehouse.name}
        description={`Warehouse located at ${warehouse.location}`}
        actions={
          <div className="flex gap-2">
            <Link
              href={`/dashboard/warehouses/${warehouseId}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${
                warehouse.isActive
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              <Power className="h-4 w-4" />
              {toggling
                ? "Updating..."
                : warehouse.isActive
                ? "Deactivate"
                : "Activate"}
            </button>
            <Link
              href="/dashboard/warehouses"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        }
      />

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {warehouse.productCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {warehouse.totalQuantity.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receipts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {warehouse._count.receipts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <TrendingDown className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Deliveries</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {warehouse._count.deliveries}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  {warehouse.location}
                </p>
              </div>
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                warehouse.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
              }`}
            >
              {warehouse.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stock Details
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              All products in this warehouse
            </p>
          </div>

          {warehouse.stock.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No products in this warehouse
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Reorder Level
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {warehouse.stock.map((stock) => {
                    const isLowStock = stock.quantity <= stock.product.reorderLevel && stock.product.reorderLevel > 0;
                    const isOutOfStock = stock.quantity === 0;

                    return (
                      <tr key={stock.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {stock.product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {stock.product.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {stock.product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {stock.product.unitOfMeasure}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                          {stock.quantity.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700 dark:text-gray-300">
                          {stock.product.reorderLevel}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-full">
                              <AlertTriangle className="h-3 w-3" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Warehouse
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete warehouse "{warehouse.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
