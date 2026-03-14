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

    // Get products with reorder level set
    const products = await prisma.product.findMany({
      where: {
        reorderLevel: {
          gt: 0,
        },
      },
      include: {
        stock: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // Filter products that are low on stock
    const lowStockProducts = products
      .map((product) => {
        const totalQuantity = product.stock.reduce(
          (sum, s) => sum + s.quantity,
          0
        );

        // Check if total quantity is at or below reorder level
        if (totalQuantity <= product.reorderLevel) {
          return {
            id: product.id,
            name: product.name,
            sku: product.sku,
            category: product.category,
            reorderLevel: product.reorderLevel,
            totalQuantity,
            warehouses: product.stock.map((s) => ({
              warehouse: s.warehouse.name,
              quantity: s.quantity,
            })),
          };
        }
        return null;
      })
      .filter((p) => p !== null);

    return NextResponse.json(lowStockProducts);
  } catch (error) {
    console.error("Low stock alerts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock alerts" },
      { status: 500 }
    );
  }
}
