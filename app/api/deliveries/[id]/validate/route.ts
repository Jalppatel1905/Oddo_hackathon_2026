import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Get delivery with lines
    const delivery = await prisma.delivery.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });

    if (!delivery) {
      return NextResponse.json(
        { error: "Delivery not found" },
        { status: 404 }
      );
    }

    if (delivery.status === "done") {
      return NextResponse.json(
        { error: "Delivery already validated" },
        { status: 400 }
      );
    }

    // Check stock availability
    for (const line of delivery.lines) {
      const stock = await prisma.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId: line.productId,
            warehouseId: delivery.warehouseId,
          },
        },
      });

      if (!stock || stock.quantity < line.quantity) {
        const product = await prisma.product.findUnique({
          where: { id: line.productId },
        });
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product?.name}. Available: ${
              stock?.quantity || 0
            }, Required: ${line.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update delivery status
      await tx.delivery.update({
        where: { id },
        data: {
          status: "done",
          validatedAt: new Date(),
        },
      });

      // Update stock levels for each line
      for (const line of delivery.lines) {
        await tx.stock.update({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: delivery.warehouseId,
            },
          },
          data: {
            quantity: {
              decrement: line.quantity,
            },
          },
        });

        // Create stock move record
        await tx.stockMove.create({
          data: {
            productId: line.productId,
            fromWarehouseId: delivery.warehouseId,
            quantity: line.quantity,
            movementType: "delivery",
            referenceNo: delivery.deliveryNo,
            userId: session.user.id,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Delivery validated successfully",
    });
  } catch (error) {
    console.error("Delivery validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate delivery" },
      { status: 500 }
    );
  }
}
