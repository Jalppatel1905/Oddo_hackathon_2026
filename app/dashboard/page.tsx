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
} from "lucide-react";

interface DashboardStats {
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  pendingTransfers: number;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recent activity
          </div>
        </div>
      </div>
    </div>
  );
}
