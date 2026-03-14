"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { KPICard } from "@/components/kpi-card";
import {
  Package,
  AlertCircle,
  TruckIcon,
  Send,
  ArrowRightLeft,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
}

interface Activity {
  id: string;
  type: "receipt" | "delivery" | "transfer" | "adjustment";
  referenceNo: string;
  warehouse: string;
  warehouseId: string;
  status: string;
  itemCount: number;
  user: string;
  createdAt: string;
  products: string;
  categories: string[];
}

interface Warehouse {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    pendingTransfers: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [documentType, setDocumentType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    fetchStats();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [documentType, statusFilter, warehouseFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (documentType) params.append("documentType", documentType);
      if (statusFilter) params.append("status", statusFilter);
      if (warehouseFilter) params.append("warehouseId", warehouseFilter);

      const res = await fetch(`/api/dashboard/activity?${params.toString()}`);
      const data = await res.json();
      setActivities(data);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("/api/warehouses");
      const data = await res.json();
      setWarehouses(data.filter((w: any) => w.isActive));
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      receipt: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      delivery: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      transfer: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      adjustment: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      waiting: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
      ready: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      done: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      canceled: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  // Get unique categories from activities
  const allCategories = Array.from(
    new Set(activities.flatMap((a) => a.categories))
  ).filter(Boolean);

  // Apply category filter client-side
  const filteredActivities = categoryFilter
    ? activities.filter((a) => a.categories.includes(categoryFilter))
    : activities;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Dashboard"
        description="Overview of your inventory operations"
      />

      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <KPICard
            title="Total Products in Stock"
            value={stats.totalProducts}
            icon={Package}
            color="blue"
          />
          <KPICard
            title="Low Stock Items"
            value={stats.lowStock}
            icon={AlertCircle}
            color="yellow"
          />
          <KPICard
            title="Out of Stock"
            value={stats.outOfStock}
            icon={AlertCircle}
            color="red"
          />
          <KPICard
            title="Pending Receipts"
            value={stats.pendingReceipts}
            icon={TruckIcon}
            color="green"
          />
          <KPICard
            title="Pending Deliveries"
            value={stats.pendingDeliveries}
            icon={Send}
            color="purple"
          />
          <KPICard
            title="Internal Transfers"
            value={stats.pendingTransfers}
            icon={ArrowRightLeft}
            color="blue"
          />
        </div>

        {/* Recent Activity with Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Header with Filter Toggle */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="receipts">Receipts</option>
                    <option value="deliveries">Deliveries</option>
                    <option value="transfers">Internal Transfers</option>
                    <option value="adjustments">Adjustments</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="waiting">Waiting</option>
                    <option value="ready">Ready</option>
                    <option value="done">Done</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </div>

                {/* Warehouse */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Warehouse
                  </label>
                  <select
                    value={warehouseFilter}
                    onChange={(e) => setWarehouseFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Filters */}
                {(documentType || statusFilter || warehouseFilter || categoryFilter) && (
                  <div className="md:col-span-2 lg:col-span-4">
                    <button
                      onClick={() => {
                        setDocumentType("");
                        setStatusFilter("");
                        setWarehouseFilter("");
                        setCategoryFilter("");
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity List */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No activity found
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(
                            activity.type
                          )}`}
                        >
                          {activity.type.toUpperCase()}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {activity.referenceNo}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs ${getStatusColor(
                            activity.status
                          )}`}
                        >
                          {activity.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <span>{activity.warehouse}</span>
                          <span>•</span>
                          <span>{activity.itemCount} items</span>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(activity.createdAt), "MMM dd, HH:mm")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
