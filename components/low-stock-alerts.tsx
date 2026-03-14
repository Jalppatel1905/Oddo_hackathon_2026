"use client";

import { useEffect, useState } from "react";
import { Bell, AlertCircle, Package } from "lucide-react";
import Link from "next/link";

interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  reorderLevel: number;
  totalQuantity: number;
  warehouses: {
    warehouse: string;
    quantity: number;
  }[];
}

export function LowStockAlerts() {
  const [alerts, setAlerts] = useState<LowStockProduct[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLowStockAlerts();
  }, []);

  const fetchLowStockAlerts = async () => {
    try {
      const res = await fetch("/api/alerts/low-stock");
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch low stock alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {alerts.length > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {alerts.length > 9 ? "9+" : alerts.length}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                Low Stock Alerts
              </h3>
            </div>

            <div className="overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No low stock items</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {alerts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/dashboard/products/${product.id}`}
                      className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            SKU: {product.sku}
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs rounded-full">
                          Low Stock
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        <div className="flex items-center gap-2">
                          <span>Total: {product.totalQuantity}</span>
                          <span>•</span>
                          <span>Reorder at: {product.reorderLevel}</span>
                        </div>
                        {product.warehouses.map((w, i) => (
                          <div key={i} className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {w.warehouse}: {w.quantity} units
                          </div>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {alerts.length > 0 && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/dashboard/products"
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                  onClick={() => setShowDropdown(false)}
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
