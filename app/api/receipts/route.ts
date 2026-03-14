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

    const receipts = await prisma.receipt.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        warehouse: true,
        _count: {
          select: { lines: true },
        },
      },
    });

    return NextResponse.json(receipts);
  } catch (error) {
    console.error("Receipts fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch receipts" },
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
    const { supplier, warehouseId, lines, notes } = body;

    if (!supplier || !warehouseId || !lines || lines.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate receipt number
    const count = await prisma.receipt.count();
    const receiptNo = `REC-${(count + 1).toString().padStart(5, "0")}`;

    const receipt = await prisma.receipt.create({
      data: {
        receiptNo,
        supplier,
        warehouseId,
        userId: session.user.id,
        notes,
        status: "draft",
        lines: {
          create: lines.map((line: any) => ({
            productId: line.productId,
            quantity: parseFloat(line.quantity),
          })),
        },
      },
      include: {
        lines: {
          include: {
            product: true,
          },
        },
        warehouse: true,
      },
    });

    return NextResponse.json(receipt);
  } catch (error) {
    console.error("Receipt creation error:", error);
    return NextResponse.json(
      { error: "Failed to create receipt" },
      { status: 500 }
    );
  }
}
