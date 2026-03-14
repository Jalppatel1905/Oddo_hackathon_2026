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

    const deliveries = await prisma.delivery.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        warehouse: true,
        _count: {
          select: { lines: true },
        },
      },
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error("Deliveries fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deliveries" },
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
    const { customer, warehouseId, lines, notes } = body;

    if (!customer || !warehouseId || !lines || lines.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate delivery number
    const count = await prisma.delivery.count();
    const deliveryNo = `DEL-${(count + 1).toString().padStart(5, "0")}`;

    const delivery = await prisma.delivery.create({
      data: {
        deliveryNo,
        customer,
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

    return NextResponse.json(delivery);
  } catch (error) {
    console.error("Delivery creation error:", error);
    return NextResponse.json(
      { error: "Failed to create delivery" },
      { status: 500 }
    );
  }
}
