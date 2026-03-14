"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { Plus, MapPin, Package, TrendingUp, TrendingDown, Eye } from "lucide-react";
import Link from "next/link";

interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
  productCount: number;
  totalQuantity: number;
  _count: {
    stock: number;
    receipts: number;
    deliveries: number;
  };
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const data = await res.json();
      setWarehouses(data);
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Warehouses"
        description="Manage your warehouse locations"
        actions={
          <Link
            href="/dashboard/warehouses/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Warehouse
          </Link>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No warehouses found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((warehouse) => (
              <div
                key={warehouse.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {warehouse.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      {warehouse.location}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      warehouse.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {warehouse.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Products
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {warehouse.productCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Total Quantity
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                      {warehouse.totalQuantity.toLocaleString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Receipts
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {warehouse._count.receipts}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          Deliveries
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {warehouse._count.deliveries}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  href={`/dashboard/warehouses/${warehouse.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-md transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
