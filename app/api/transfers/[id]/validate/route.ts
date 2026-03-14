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

    // Get transfer with lines
    const transfer = await prisma.internalTransfer.findUnique({
      where: { id },
      include: {
        lines: true,
      },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: "Transfer not found" },
        { status: 404 }
      );
    }

    if (transfer.status === "done") {
      return NextResponse.json(
        { error: "Transfer already validated" },
        { status: 400 }
      );
    }

    // Check stock availability in source warehouse
    for (const line of transfer.lines) {
      const stock = await prisma.stock.findUnique({
        where: {
          productId_warehouseId: {
            productId: line.productId,
            warehouseId: transfer.fromWarehouseId,
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
      // Update transfer status
      await tx.internalTransfer.update({
        where: { id },
        data: {
          status: "done",
          validatedAt: new Date(),
        },
      });

      // Update stock levels for each line
      for (const line of transfer.lines) {
        // Decrease stock in source warehouse
        const sourceStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: transfer.fromWarehouseId,
            },
          },
        });

        if (sourceStock) {
          await tx.stock.update({
            where: {
              productId_warehouseId: {
                productId: line.productId,
                warehouseId: transfer.fromWarehouseId,
              },
            },
            data: {
              quantity: {
                decrement: line.quantity,
              },
            },
          });
        }

        // Increase stock in destination warehouse
        const destStock = await tx.stock.findUnique({
          where: {
            productId_warehouseId: {
              productId: line.productId,
              warehouseId: transfer.toWarehouseId,
            },
          },
        });

        if (destStock) {
          await tx.stock.update({
            where: {
              productId_warehouseId: {
                productId: line.productId,
                warehouseId: transfer.toWarehouseId,
              },
            },
            data: {
              quantity: {
                increment: line.quantity,
              },
            },
          });
        } else {
          // Create new stock record if doesn't exist
          await tx.stock.create({
            data: {
              productId: line.productId,
              warehouseId: transfer.toWarehouseId,
              quantity: line.quantity,
            },
          });
        }

        // Create stock move record
        await tx.stockMove.create({
          data: {
            productId: line.productId,
            fromWarehouseId: transfer.fromWarehouseId,
            toWarehouseId: transfer.toWarehouseId,
            quantity: line.quantity,
            movementType: "transfer",
            referenceNo: transfer.transferNo,
            userId: session.user.id,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Transfer validated successfully",
    });
  } catch (error) {
    console.error("Transfer validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate transfer" },
      { status: 500 }
    );
  }
}
