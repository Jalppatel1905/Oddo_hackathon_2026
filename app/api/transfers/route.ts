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

    const transfers = await prisma.internalTransfer.findMany({
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Transfers fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transfers" },
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
    const { fromWarehouseId, toWarehouseId, notes, lines } = body;

    // Validate warehouses are different
    if (fromWarehouseId === toWarehouseId) {
      return NextResponse.json(
        { error: "Source and destination warehouses must be different" },
        { status: 400 }
      );
    }

    // Generate transfer number
    const count = await prisma.internalTransfer.count();
    const transferNo = `TR${String(count + 1).padStart(6, "0")}`;

    // Create transfer with lines
    const transfer = await prisma.internalTransfer.create({
      data: {
        transferNo,
        fromWarehouseId,
        toWarehouseId,
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
        fromWarehouse: true,
        toWarehouse: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(transfer);
  } catch (error) {
    console.error("Transfer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create transfer" },
      { status: 500 }
    );
  }
}
