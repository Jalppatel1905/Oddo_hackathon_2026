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

    // Get receipt with lines
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.status === "done") {
      return NextResponse.json(
        { error: "Receipt already validated" },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update receipt status
      await tx.receipt.update({
        where: { id },
        data: {
          status: "done",
          validatedAt: new Date(),
        },
      });

      // Update stock levels for each line
      for (const line of receipt.lines) {
        // Check if stock record exists
        const existingStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: receipt.warehouseId,
            },
          },
        });

        if (existingStock) {
          // Update existing stock
          await tx.stock.update({
            where: {
              productId_warehouseId: {
                productId: line.productId,
                warehouseId: receipt.warehouseId,
              },
            },
            data: {
              quantity: {
                increment: line.quantity,
              },
            },
          });
        } else {
          // Create new stock record
          await tx.stock.create({
            data: {
              productId: line.productId,
              warehouseId: receipt.warehouseId,
              quantity: line.quantity,
            },
          });
        }

        // Create stock move record
        await tx.stockMove.create({
          data: {
            productId: line.productId,
            toWarehouseId: receipt.warehouseId,
            quantity: line.quantity,
            movementType: "receipt",
            referenceNo: receipt.receiptNo,
            userId: session.user.id,
          },
        });
      }
    });

    return NextResponse.json({ success: true, message: "Receipt validated successfully" });
  } catch (error) {
    console.error("Receipt validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate receipt" },
      { status: 500 }
    );
  }
}
