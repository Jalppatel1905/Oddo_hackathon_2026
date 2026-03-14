import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const warehouseId = searchParams.get("warehouseId");
    const movementType = searchParams.get("movementType");

    const where: any = {};
    if (productId) where.productId = productId;
    if (warehouseId) {
      where.OR = [
        { fromWarehouseId: warehouseId },
        { toWarehouseId: warehouseId },
      ];
    }
    if (movementType) where.movementType = movementType;

    const stockMoves = await prisma.stockMove.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: true,
        fromWarehouse: true,
        toWarehouse: true,
        user: {
          select: {
            name: true,
          },
        },
      },
      take: 100, // Limit to last 100 moves
    });

    return NextResponse.json(stockMoves);
  } catch (error) {
    console.error("Stock moves fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock moves" },
      { status: 500 }
    );
  }
}
