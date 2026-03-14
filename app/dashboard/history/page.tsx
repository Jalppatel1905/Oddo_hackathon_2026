"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/header";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowRightLeft } from "lucide-react";

interface StockMove {
  id: string;
  quantity: number;
  movementType: string;
  referenceNo: string;
  createdAt: string;
  product: {
    name: string;
    sku: string;
  };
  fromWarehouse: {
    name: string;
  } | null;
  toWarehouse: {
    name: string;
  } | null;
  user: {
    name: string;
  };
}

export default function HistoryPage() {
  const [moves, setMoves] = useState<StockMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchMoves();
  }, []);

  const fetchMoves = async () => {
    try {
      const res = await fetch("/api/stock-moves");
      const data = await res.json();
      setMoves(data);
    } catch (error) {
      console.error("Failed to fetch stock moves:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "receipt":
        return <ArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "delivery":
        return <ArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case "transfer":
        return <ArrowRightLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case "adjustment":
        return <ArrowRightLeft className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return null;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case "receipt":
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400";
      case "delivery":
        return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400";
      case "transfer":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
      case "adjustment":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  const getLocationText = (move: StockMove) => {
    if (move.movementType === "receipt") {
      return `→ ${move.toWarehouse?.name}`;
    } else if (move.movementType === "delivery") {
      return `${move.fromWarehouse?.name} →`;
    } else if (move.movementType === "transfer") {
      return `${move.fromWarehouse?.name} → ${move.toWarehouse?.name}`;
    }
    return move.toWarehouse?.name || move.fromWarehouse?.name || "-";
  };

  const filteredMoves = moves.filter(
    (move) =>
      move.product.name.toLowerCase().includes(filter.toLowerCase()) ||
      move.product.sku.toLowerCase().includes(filter.toLowerCase()) ||
      move.referenceNo.toLowerCase().includes(filter.toLowerCase()) ||
      move.movementType.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <Header
        title="Move History"
        description="Complete stock movement ledger"
      />

      <div className="p-6">
        {/* Filter */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by product, SKU, reference, or type..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {/* Moves Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : filteredMoves.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No stock movements found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      User
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredMoves.map((move) => (
                    <tr
                      key={move.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {format(new Date(move.createdAt), "MMM dd, yyyy HH:mm")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {getMovementIcon(move.movementType)}
                          <span
                            className={`px-2 py-1 rounded-full text-xs capitalize ${getMovementTypeColor(
                              move.movementType
                            )}`}
                          >
                            {move.movementType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {move.referenceNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">{move.product.name}</div>
                          <div className="text-xs text-gray-500">
                            {move.product.sku}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <span
                          className={
                            move.movementType === "receipt"
                              ? "text-green-600 dark:text-green-400 font-medium"
                              : move.movementType === "delivery"
                              ? "text-red-600 dark:text-red-400 font-medium"
                              : ""
                          }
                        >
                          {move.movementType === "receipt" ? "+" : move.movementType === "delivery" ? "-" : ""}
                          {move.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {getLocationText(move)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {move.user.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {!loading && filteredMoves.length > 0 && (
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredMoves.length} movement{filteredMoves.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
