"use client";

import { Header } from "@/components/header";

export default function AdjustmentsPage() {
  return (
    <div>
      <Header
        title="Stock Adjustments"
        description="Fix stock discrepancies"
      />
      <div className="p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Stock Adjustments module - Coming soon
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            This feature allows you to adjust stock levels to fix discrepancies
          </p>
        </div>
      </div>
    </div>
  );
}
