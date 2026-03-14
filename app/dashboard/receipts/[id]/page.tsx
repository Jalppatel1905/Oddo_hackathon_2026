"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

interface Receipt {
  id: string;
  receiptNo: string;
  supplier: string;
  status: string;
  notes: string;
  createdAt: string;
  validatedAt: string | null;
  warehouse: {
    name: string;
    location: string;
  };
  user: {
    name: string;
  };
  lines: Array<{
    id: string;
    quantity: number;
    product: {
      name: string;
      sku: string;
      unitOfMeasure: string;
    };
  }>;
}

export default function ReceiptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [receiptId, setReceiptId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setReceiptId(p.id);
    });
  }, [params]);

  useEffect(() => {
    if (receiptId) {
      fetchReceipt();
    }
  }, [receiptId]);

  const fetchReceipt = async () => {
    try {
      const res = await fetch(`/api/receipts/${receiptId}`);
      const data = await res.json();
      setReceipt(data);
    } catch (error) {
      console.error("Failed to fetch receipt:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!confirm("Are you sure you want to validate this receipt? This will update stock levels.")) {
      return;
    }

    setValidating(true);
    try {
      const res = await fetch(`/api/receipts/${receiptId}/validate`, {
        method: "POST",
      });

      if (res.ok) {
        fetchReceipt();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to validate receipt");
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setValidating(false);
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

  if (!receipt) {
    return <div>Receipt not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400";
      case "ready":
        return "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400";
      case "waiting":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400";
      case "canceled":
        return "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div>
      <Header
        title={`Receipt ${receipt.receiptNo}`}
        description="View receipt details"
        actions={
          <div className="flex items-center gap-3">
            {receipt.status !== "done" && (
              <button
                onClick={handleValidate}
                disabled={validating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {validating ? "Validating..." : "Validate Receipt"}
              </button>
            )}
            <Link
              href="/dashboard/receipts"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        }
      />

      <div className="p-6">
        <div className="max-w-4xl space-y-6">
          {/* Header Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Supplier
                </h3>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {receipt.supplier}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Warehouse
                </h3>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {receipt.warehouse.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {receipt.warehouse.location}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm capitalize ${getStatusColor(
                    receipt.status
                  )}`}
                >
                  {receipt.status}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Created By
                </h3>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {receipt.user.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {format(new Date(receipt.createdAt), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
            </div>

            {receipt.notes && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Notes
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{receipt.notes}</p>
              </div>
            )}
          </div>

          {/* Product Lines */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white">
                Products
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {receipt.lines.map((line) => (
                    <tr key={line.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {line.product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {line.product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {line.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {line.product.unitOfMeasure}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {receipt.validatedAt && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-800 dark:text-green-400">
                <strong>Validated:</strong>{" "}
                {format(new Date(receipt.validatedAt), "MMM dd, yyyy HH:mm")}
              </p>
              <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                Stock levels have been updated successfully.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
