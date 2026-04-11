import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// TEMPORARY API ROUTE - DELETE AFTER USE
// This route deletes all orders with null/undefined critical fields
// Use this to clean up corrupted data after schema changes

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    
    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    // Safety check: Only allow in development or with secret key
    const secretKey = process.env.CLEANUP_SECRET_KEY;
    const authHeader = req.headers.get('authorization');
    
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { error: "Unauthorized. This endpoint requires authorization in production." },
        { status: 401 }
      );
    }

    // Find orders with null/undefined critical fields
    const corruptedOrders = await prismadb.order.findMany({
      where: {
        storeId: storeId,
        OR: [
          { orderCode: null },
          { orderNumber: null },
          { customerName: null },
          { createdAt: null },
        ],
      },
      select: {
        id: true,
        orderCode: true,
        orderNumber: true,
        customerName: true,
        createdAt: true,
      },
    });

    console.log(`[CLEANUP_ORDERS] Found ${corruptedOrders.length} corrupted orders`);

    if (corruptedOrders.length === 0) {
      return NextResponse.json({
        message: "No corrupted orders found",
        deleted: 0,
        orders: [],
      });
    }

    // Delete corrupted orders
    const deleteResult = await prismadb.order.deleteMany({
      where: {
        id: {
          in: corruptedOrders.map(o => o.id),
        },
      },
    });

    console.log(`[CLEANUP_ORDERS] Deleted ${deleteResult.count} orders`);

    return NextResponse.json({
      message: `Successfully deleted ${deleteResult.count} corrupted orders`,
      deleted: deleteResult.count,
      orders: corruptedOrders.map(o => ({
        id: o.id,
        orderCode: o.orderCode,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        createdAt: o.createdAt,
      })),
    });

  } catch (error) {
    console.error("[CLEANUP_ORDERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to cleanup orders", details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to preview corrupted orders without deleting
export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    
    if (!storeId) {
      return NextResponse.json({ error: "Store ID required" }, { status: 400 });
    }

    // Find orders with null/undefined critical fields
    const corruptedOrders = await prismadb.order.findMany({
      where: {
        storeId: storeId,
        OR: [
          { orderCode: null },
          { orderNumber: null },
          { customerName: null },
          { createdAt: null },
        ],
      },
      select: {
        id: true,
        orderCode: true,
        orderNumber: true,
        customerName: true,
        createdAt: true,
        status: true,
      },
    });

    return NextResponse.json({
      count: corruptedOrders.length,
      orders: corruptedOrders,
      message: `Found ${corruptedOrders.length} corrupted orders. Use POST to delete them.`,
    });

  } catch (error) {
    console.error("[CLEANUP_ORDERS_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch corrupted orders", details: String(error) },
      { status: 500 }
    );
  }
}
