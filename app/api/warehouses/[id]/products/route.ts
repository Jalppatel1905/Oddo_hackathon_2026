import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch all stock entries for this warehouse with product details
    const stocks = await prisma.stock.findMany({
      where: {
        warehouseId: id,
        quantity: {
          gt: 0, // Only products with stock > 0
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

    // Transform to product format with available quantity
    const products = stocks.map((stock) => ({
      ...stock.product,
      availableQuantity: stock.quantity,
      stockId: stock.id,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error("Warehouse products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouse products" },
      { status: 500 }
    );
  }
}
