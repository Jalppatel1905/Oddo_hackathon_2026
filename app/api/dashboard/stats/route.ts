import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total unique products
    const totalProducts = await prisma.product.count();

    // Get products with low stock (quantity < reorderLevel)
    // We need to fetch stocks with their products and filter manually
    const stocksWithProducts = await prisma.stock.findMany({
      include: {
        product: true,
      },
    });

    const lowStockProducts = stocksWithProducts.filter(
      (stock) =>
        stock.product.reorderLevel > 0 &&
        stock.quantity <= stock.product.reorderLevel
    ).length;

    // Get out of stock products
    const outOfStock = await prisma.stock.count({
      where: {
        quantity: 0,
      },
    });

    // Get pending receipts (not done or canceled)
    const pendingReceipts = await prisma.receipt.count({
      where: {
        status: {
          in: ["draft", "waiting", "ready"],
        },
      },
    });

    // Get pending deliveries
    const pendingDeliveries = await prisma.delivery.count({
      where: {
        status: {
          in: ["draft", "waiting", "ready"],
        },
      },
    });

    // Get pending transfers
    const pendingTransfers = await prisma.internalTransfer.count({
      where: {
        status: {
          in: ["draft", "waiting", "ready"],
        },
      },
    });

    return NextResponse.json({
      totalProducts,
      lowStock: lowStockProducts,
      outOfStock,
      pendingReceipts,
      pendingDeliveries,
      pendingTransfers,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
