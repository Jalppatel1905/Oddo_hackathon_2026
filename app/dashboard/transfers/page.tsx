"use client";

import { Header } from "@/components/header";

export default function TransfersPage() {
  return (
    <div>
      <Header
        title="Internal Transfers"
        description="Move stock between warehouses"
      />
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Internal Transfers module - Coming soon
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This feature allows you to transfer stock between different warehouses
          </p>
        </div>
      </div>
    </div>
  );
}
