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

    const adjustments = await prisma.stockAdjustment.findMany({
      include: {
        product: true,
        warehouse: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(adjustments);
  } catch (error) {
    console.error("Adjustments fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch adjustments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, warehouseId, newQuantity, reason } = body;

    // Get current stock
    const currentStock = await prisma.stock.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    const oldQuantity = currentStock?.quantity || 0;
    const difference = parseFloat(newQuantity) - oldQuantity;

    // Generate adjustment number
    const count = await prisma.stockAdjustment.count();
    const adjustmentNo = `ADJ${String(count + 1).padStart(6, "0")}`;

    // Use transaction to update stock and create adjustment record
    const result = await prisma.$transaction(async (tx) => {
      // Create adjustment record
      const adjustment = await tx.stockAdjustment.create({
        data: {
          adjustmentNo,
          productId,
          warehouseId,
          oldQuantity,
          newQuantity: parseFloat(newQuantity),
          difference,
          reason,
          userId: session.user.id,
        },
        include: {
          product: true,
          warehouse: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      // Update stock
      if (currentStock) {
        await tx.stock.update({
          where: {
            productId_warehouseId: {
              productId,
              warehouseId,
            },
          },
          data: {
            quantity: parseFloat(newQuantity),
          },
        });
      } else {
        // Create new stock record if doesn't exist
        await tx.stock.create({
          data: {
            productId,
            warehouseId,
            quantity: parseFloat(newQuantity),
          },
        });
      }

      // Create stock move record
      await tx.stockMove.create({
        data: {
          productId,
          fromWarehouseId: difference < 0 ? warehouseId : null,
          toWarehouseId: difference > 0 ? warehouseId : null,
          quantity: Math.abs(difference),
          movementType: "adjustment",
          referenceNo: adjustmentNo,
          userId: session.user.id,
        },
      });

      return adjustment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Adjustment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    );
  }
}
