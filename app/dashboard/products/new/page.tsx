"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import { ImageUpload } from "@/components/image-upload";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    unitOfMeasure: "",
    reorderLevel: "0",
    price: "0",
    imageUrl: "",
  });

  // Auto-generate SKU from product name
  const generateSKU = (productName: string) => {
    if (!productName) return "";

    // Remove special characters and spaces, convert to uppercase
    const cleanName = productName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .toUpperCase();

    // Take first 3-4 letters
    const prefix = cleanName.split(" ").map(word => word.substring(0, 2)).join("").substring(0, 4);

    // Add timestamp suffix for uniqueness
    const suffix = Date.now().toString().slice(-4);

    return `${prefix || "PROD"}-${suffix}`;
  };

  const handleNameChange = (name: string) => {
    setFormData({ ...formData, name });

    // Auto-generate SKU only if not manually edited
    if (!skuManuallyEdited) {
      setFormData(prev => ({ ...prev, name, sku: generateSKU(name) }));
    }
  };

  const handleSkuChange = (sku: string) => {
    setSkuManuallyEdited(true);
    setFormData({ ...formData, sku });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || "Failed to create product";
        setError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }

      toast.success("Product created successfully!");
      router.push("/dashboard/products");
    } catch (error) {
      const errorMsg = "Something went wrong";
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Create Product"
        description="Add a new product to your inventory"
        actions={
          <Link
            href="/dashboard/products"
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <div className="p-6">
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SKU / Product Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => handleSkuChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Auto-generated (editable)"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Auto-generated from product name, but you can edit it
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Electronics, Raw Materials"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit of Measure *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unitOfMeasure}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        unitOfMeasure: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., kg, pcs, liters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Price per unit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorderLevel: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Minimum stock level"
                  />
                </div>

                <ImageUpload
                  currentImage={formData.imageUrl}
                  onImageChange={(url) =>
                    setFormData({ ...formData, imageUrl: url || "" })
                  }
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Product"}
                </button>
                <Link
                  href="/dashboard/products"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
