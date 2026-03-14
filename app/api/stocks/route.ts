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

    const stocks = await prisma.stock.findMany({
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error("Stocks fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stocks" },
      { status: 500 }
    );
  }
}
