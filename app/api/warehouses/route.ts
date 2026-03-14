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

    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: {
            stock: true,
            receipts: true,
            deliveries: true,
          },
        },
        stock: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate total quantity for each warehouse
    const warehousesWithStats = warehouses.map((warehouse) => ({
      ...warehouse,
      totalQuantity: warehouse.stock.reduce((sum, s) => sum + s.quantity, 0),
      productCount: warehouse._count.stock,
    }));

    return NextResponse.json(warehousesWithStats);
  } catch (error) {
    console.error("Warehouses fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch warehouses" },
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
    const { name, location, isActive } = body;

    if (!name || !location) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        location,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(warehouse);
  } catch (error) {
    console.error("Warehouse creation error:", error);
    return NextResponse.json(
      { error: "Failed to create warehouse" },
      { status: 500 }
    );
  }
}
