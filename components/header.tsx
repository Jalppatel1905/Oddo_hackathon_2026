"use client";

import { ThemeToggle } from "./theme-toggle";
import { LowStockAlerts } from "./low-stock-alerts";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 md:px-6 py-3 md:py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0 pl-12 md:pl-0">
          <h2 className="text-lg md:text-2xl font-heading font-bold text-gray-900 dark:text-white truncate">
            {title}
          </h2>
          {description && (
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {actions}
          <div className="flex items-center gap-2">
            <LowStockAlerts />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
