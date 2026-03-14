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
    const documentType = searchParams.get("documentType");
    const status = searchParams.get("status");
    const warehouseId = searchParams.get("warehouseId");

    // Fetch all operations with filtering
    const receiptsPromise = prisma.receipt.findMany({
      where: {
        ...(status && { status }),
        ...(warehouseId && { warehouseId }),
      },
      include: {
        warehouse: true,
        user: { select: { name: true } },
        lines: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const deliveriesPromise = prisma.delivery.findMany({
      where: {
        ...(status && { status }),
        ...(warehouseId && { warehouseId }),
      },
      include: {
        warehouse: true,
        user: { select: { name: true } },
        lines: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const transfersPromise = prisma.internalTransfer.findMany({
      where: {
        ...(status && { status }),
        ...(warehouseId && {
          OR: [{ fromWarehouseId: warehouseId }, { toWarehouseId: warehouseId }],
        }),
      },
      include: {
        fromWarehouse: true,
        toWarehouse: true,
        user: { select: { name: true } },
        lines: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const adjustmentsPromise = prisma.stockAdjustment.findMany({
      where: {
        ...(warehouseId && { warehouseId }),
      },
      include: {
        product: true,
        warehouse: true,
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const [receipts, deliveries, transfers, adjustments] = await Promise.all([
      receiptsPromise,
      deliveriesPromise,
      transfersPromise,
      adjustmentsPromise,
    ]);

    // Transform to unified format
    const activities = [];

    if (!documentType || documentType === "receipts") {
      activities.push(
        ...receipts.map((r) => ({
          id: r.id,
          type: "receipt" as const,
          referenceNo: r.receiptNo,
          warehouse: r.warehouse.name,
          warehouseId: r.warehouseId,
          status: r.status,
          itemCount: r.lines.length,
          user: r.user.name,
          createdAt: r.createdAt,
          products: r.lines.map((l) => l.product.name).join(", "),
          categories: Array.from(new Set(r.lines.map((l) => l.product.category))),
        }))
      );
    }

    if (!documentType || documentType === "deliveries") {
      activities.push(
        ...deliveries.map((d) => ({
          id: d.id,
          type: "delivery" as const,
          referenceNo: d.deliveryNo,
          warehouse: d.warehouse.name,
          warehouseId: d.warehouseId,
          status: d.status,
          itemCount: d.lines.length,
          user: d.user.name,
          createdAt: d.createdAt,
          products: d.lines.map((l) => l.product.name).join(", "),
          categories: Array.from(new Set(d.lines.map((l) => l.product.category))),
        }))
      );
    }

    if (!documentType || documentType === "transfers") {
      activities.push(
        ...transfers.map((t) => ({
          id: t.id,
          type: "transfer" as const,
          referenceNo: t.transferNo,
          warehouse: `${t.fromWarehouse.name} → ${t.toWarehouse.name}`,
          warehouseId: t.fromWarehouseId,
          status: t.status,
          itemCount: t.lines.length,
          user: t.user.name,
          createdAt: t.createdAt,
          products: t.lines.map((l) => l.product.name).join(", "),
          categories: Array.from(new Set(t.lines.map((l) => l.product.category))),
        }))
      );
    }

    if (!documentType || documentType === "adjustments") {
      activities.push(
        ...adjustments.map((a) => ({
          id: a.id,
          type: "adjustment" as const,
          referenceNo: a.adjustmentNo,
          warehouse: a.warehouse.name,
          warehouseId: a.warehouseId,
          status: "done",
          itemCount: 1,
          user: a.user.name,
          createdAt: a.createdAt,
          products: a.product.name,
          categories: [a.product.category],
        }))
      );
    }

    // Sort by date
    activities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(activities.slice(0, 50));
  } catch (error) {
    console.error("Dashboard activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}
