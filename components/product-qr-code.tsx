"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";

interface ProductQRCodeProps {
  productId: string;
  productName: string;
  sku: string;
}

export function ProductQRCode({ productId, productName, sku }: ProductQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Generate QR code with product info
      const productData = JSON.stringify({
        id: productId,
        sku: sku,
        name: productName,
      });

      QRCode.toCanvas(
        canvasRef.current,
        productData,
        {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error("QR Code generation error:", error);
        }
      );
    }
  }, [productId, productName, sku]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const url = canvasRef.current.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR_${sku}.png`;
      link.href = url;
      link.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow && canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL();
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code - ${sku}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
                border: 2px solid #000;
              }
              img {
                display: block;
                margin: 20px auto;
              }
              h2 {
                margin: 10px 0;
              }
              p {
                margin: 5px 0;
                font-size: 14px;
              }
              @media print {
                body {
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h2>${productName}</h2>
              <p><strong>SKU:</strong> ${sku}</p>
              <img src="${dataUrl}" alt="QR Code" />
              <p style="font-size: 12px;">Scan to view product details</p>
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Product QR Code
      </h3>

      <div className="flex flex-col items-center">
        <canvas ref={canvasRef} className="mb-4" />

        <div className="text-center mb-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{productName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">SKU: {sku}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm rounded-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Label
          </button>
        </div>
      </div>
    </div>
  );
}
