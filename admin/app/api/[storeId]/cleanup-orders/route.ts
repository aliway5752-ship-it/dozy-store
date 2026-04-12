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
    // Note: Prisma doesn't allow { field: null } syntax for non-nullable fields
    // We fetch all orders and filter in JavaScript
    const allOrders = await prismadb.order.findMany({
      where: {
        storeId: storeId!, // Non-null assertion - already validated above
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        createdAt: true,
      },
    });
    
    // Filter corrupted orders in JavaScript (checking for null/undefined/empty values)
    const corruptedOrders = allOrders.filter(order => {
      // Check for falsy values including null, undefined, empty string, 0
      const hasNoOrderNumber = order.orderNumber === null || order.orderNumber === undefined || order.orderNumber === 0;
      const hasNoCustomerName = order.customerName === null || order.customerName === undefined || order.customerName === '';
      const hasNoCreatedAt = order.createdAt === null || order.createdAt === undefined;
      return hasNoOrderNumber || hasNoCustomerName || hasNoCreatedAt;
    });

    console.log(`[CLEANUP_ORDERS] Found ${corruptedOrders.length} corrupted orders`);

    if (corruptedOrders.length === 0) {
      return NextResponse.json({
        message: "No corrupted orders found",
        deleted: 0,
        orders: [],
      });
    }

    // Delete corrupted orders by ID
    const idsToDelete = corruptedOrders.map(o => o.id);
    let deletedCount = 0;
    
    if (idsToDelete.length > 0) {
      const deleteResult = await prismadb.order.deleteMany({
        where: {
          id: {
            in: idsToDelete,
          },
        },
      });
      deletedCount = deleteResult.count;
    }

    console.log(`[CLEANUP_ORDERS] Deleted ${deletedCount} orders`);

    return NextResponse.json({
      message: `Successfully deleted ${deletedCount} corrupted orders`,
      deleted: deletedCount,
      orders: corruptedOrders.map(o => ({
        id: o.id,
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
    // Note: Prisma doesn't allow { field: null } syntax for non-nullable fields
    // We fetch all orders and filter in JavaScript
    const allOrders = await prismadb.order.findMany({
      where: {
        storeId: storeId!, // Non-null assertion - already validated above
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        createdAt: true,
        status: true,
      },
    });
    
    // Filter corrupted orders in JavaScript (checking for null/undefined/empty values)
    const corruptedOrders = allOrders.filter(order => {
      // Check for falsy values including null, undefined, empty string, 0
      const hasNoOrderNumber = order.orderNumber === null || order.orderNumber === undefined || order.orderNumber === 0;
      const hasNoCustomerName = order.customerName === null || order.customerName === undefined || order.customerName === '';
      const hasNoCreatedAt = order.createdAt === null || order.createdAt === undefined;
      return hasNoOrderNumber || hasNoCustomerName || hasNoCreatedAt;
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
