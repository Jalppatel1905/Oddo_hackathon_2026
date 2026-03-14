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

    // Get all products with stock
    const products = await prisma.product.findMany({
      include: {
        stock: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // Calculate total inventory value
    let totalValue = 0;
    const categoryMap = new Map<string, { value: number; count: number }>();
    const warehouseMap = new Map<string, { value: number; quantity: number }>();
    const productValues: { name: string; value: number; quantity: number }[] = [];

    products.forEach((product) => {
      const totalQuantity = product.stock.reduce((sum, s) => sum + s.quantity, 0);
      const productValue = totalQuantity * product.price;

      totalValue += productValue;

      // Category breakdown
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, { value: 0, count: 0 });
      }
      const catData = categoryMap.get(product.category)!;
      catData.value += productValue;
      catData.count += 1;

      // Warehouse distribution
      product.stock.forEach((s) => {
        if (!warehouseMap.has(s.warehouse.name)) {
          warehouseMap.set(s.warehouse.name, { value: 0, quantity: 0 });
        }
        const whData = warehouseMap.get(s.warehouse.name)!;
        whData.value += s.quantity * product.price;
        whData.quantity += s.quantity;
      });

      // Top products
      if (totalQuantity > 0) {
        productValues.push({
          name: product.name,
          value: productValue,
          quantity: totalQuantity,
        });
      }
    });

    // Convert maps to arrays
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);

    const warehouseDistribution = Array.from(warehouseMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.value - a.value);

    const topProducts = productValues
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    // Stock trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const stockMoves = await prisma.stockMove.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by date
    const trendsMap = new Map<string, { receipts: number; deliveries: number }>();
    stockMoves.forEach((move) => {
      const dateKey = move.createdAt.toISOString().split("T")[0];
      if (!trendsMap.has(dateKey)) {
        trendsMap.set(dateKey, { receipts: 0, deliveries: 0 });
      }
      const dayData = trendsMap.get(dateKey)!;
      if (move.movementType === "receipt") {
        dayData.receipts += move.quantity;
      } else if (move.movementType === "delivery") {
        dayData.deliveries += move.quantity;
      }
    });

    // Calculate cumulative stock
    const stockTrends = Array.from(trendsMap.entries())
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        receipts: data.receipts,
        deliveries: data.deliveries,
        stock: 0, // Will be calculated
      }))
      .slice(0, 7);

    // Simple stock calculation
    let currentStock = products.reduce(
      (sum, p) => sum + p.stock.reduce((s, st) => s + st.quantity, 0),
      0
    );
    stockTrends.reverse().forEach((trend) => {
      trend.stock = currentStock;
      currentStock = currentStock - trend.receipts + trend.deliveries;
    });
    stockTrends.reverse();

    return NextResponse.json({
      totalValue: Math.round(totalValue),
      categoryBreakdown,
      warehouseDistribution,
      topProducts,
      stockTrends,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
