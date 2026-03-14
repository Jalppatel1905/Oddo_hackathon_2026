"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

interface ImageUploadProps {
  currentImage?: string | null;
  onImageChange: (url: string | null) => void;
}

export function ImageUpload({ currentImage, onImageChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Only images are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size too large. Maximum 5MB allowed.");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to upload image");
        setPreview(currentImage || null);
        return;
      }

      onImageChange(data.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
      setPreview(currentImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Image removed");
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Product Image
      </label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <Image
                src={preview}
                alt="Product preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer transition-colors ${
              uploading
                ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Choose Image"}
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            JPG, PNG, GIF, WEBP up to 5MB
          </p>
        </div>
      </div>
    </div>
  );
}
