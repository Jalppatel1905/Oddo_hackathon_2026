"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ArrowLeft, CheckCircle, Printer } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { ConfirmModal } from "@/components/confirm-modal";

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
  const [validateModal, setValidateModal] = useState(false);

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
    setValidating(true);
    try {
      const res = await fetch(`/api/receipts/${receiptId}/validate`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Receipt validated successfully!");
        fetchReceipt();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to validate receipt");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setValidating(false);
    }
  };

  const handlePrint = () => {
    if (!receipt) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const totalItems = receipt.lines.reduce((sum, line) => sum + line.quantity, 0);

      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt ${receipt.receiptNo}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 40px;
                color: #000;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #000;
                padding-bottom: 20px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .header p {
                margin: 5px 0;
                color: #666;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
              }
              .info-item {
                margin-bottom: 10px;
              }
              .info-label {
                font-weight: bold;
                color: #666;
                font-size: 12px;
                text-transform: uppercase;
              }
              .info-value {
                font-size: 16px;
                margin-top: 5px;
              }
              .status-badge {
                display: inline-block;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 14px;
                text-transform: capitalize;
                background-color: #e8f5e9;
                color: #2e7d32;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
              }
              th {
                background-color: #f5f5f5;
                padding: 12px;
                text-align: left;
                border-bottom: 2px solid #000;
                font-size: 12px;
                text-transform: uppercase;
              }
              td {
                padding: 10px 12px;
                border-bottom: 1px solid #ddd;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
              }
              .total-row {
                font-weight: bold;
                background-color: #f9f9f9;
              }
              @media print {
                body { margin: 20px; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>RECEIPT</h1>
              <p>Receipt No: ${receipt.receiptNo}</p>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Supplier</div>
                <div class="info-value">${receipt.supplier}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Warehouse</div>
                <div class="info-value">${receipt.warehouse.name}</div>
                <div style="font-size: 14px; color: #666;">${receipt.warehouse.location}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Status</div>
                <div class="info-value">
                  <span class="status-badge">${receipt.status}</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Created By</div>
                <div class="info-value">${receipt.user.name}</div>
                <div style="font-size: 14px; color: #666;">${format(new Date(receipt.createdAt), "MMM dd, yyyy HH:mm")}</div>
              </div>
            </div>

            ${receipt.notes ? `
              <div style="margin-bottom: 30px; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #2196F3;">
                <div class="info-label">Notes</div>
                <div style="margin-top: 5px;">${receipt.notes}</div>
              </div>
            ` : ''}

            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th style="text-align: center;">Quantity</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                ${receipt.lines.map(line => `
                  <tr>
                    <td>${line.product.sku}</td>
                    <td>${line.product.name}</td>
                    <td style="text-align: center;">${line.quantity}</td>
                    <td>${line.product.unitOfMeasure}</td>
                  </tr>
                `).join('')}
                <tr class="total-row">
                  <td colspan="2">TOTAL ITEMS</td>
                  <td style="text-align: center;">${totalItems}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>

            ${receipt.validatedAt ? `
              <div style="padding: 15px; background-color: #e8f5e9; border-left: 4px solid #4caf50; margin-bottom: 20px;">
                <strong>Validated:</strong> ${format(new Date(receipt.validatedAt), "MMM dd, yyyy HH:mm")}
                <br><small>Stock levels have been updated successfully.</small>
              </div>
            ` : ''}

            <div class="footer">
              <p>Printed on: ${format(new Date(), "MMM dd, yyyy HH:mm")}</p>
              <p>CoreInventory - Inventory Management System</p>
            </div>

            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
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
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            {receipt.status !== "done" && (
              <button
                onClick={() => setValidateModal(true)}
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

      <ConfirmModal
        isOpen={validateModal}
        title="Validate Receipt"
        message="Are you sure you want to validate this receipt? This will update stock levels and cannot be undone."
        onConfirm={handleValidate}
        onCancel={() => setValidateModal(false)}
        confirmText="Validate"
        type="warning"
      />
    </div>
  );
}
