import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// EMERGENCY CLEANUP API - DELETE AFTER USE
// This route deletes ALL corrupted orders with null/undefined critical fields
// USE WITH CAUTION - THIS WILL DELETE DATA

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS_HEADERS });
}

// GET: Preview corrupted orders without deleting
export async function GET(req: Request) {
  try {
    console.log("[ADMIN_CLEANUP_GET] Starting corrupted orders scan...");

    // Find ALL orders with null/undefined critical fields across ALL stores
    const corruptedOrders = await prismadb.order.findMany({
      where: {
        OR: [
          { orderNumber: { equals: null } },
          { customerName: { equals: null } },
          { customerName: { equals: "" } },
          { createdAt: { equals: null } },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        storeId: true,
        customerName: true,
        createdAt: true,
        status: true,
        phone: true,
        address: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[ADMIN_CLEANUP_GET] Found ${corruptedOrders.length} corrupted orders`);

    // Group by store for better visibility
    const byStore = corruptedOrders.reduce((acc, order) => {
      const storeId = order.storeId || 'unknown';
      if (!acc[storeId]) acc[storeId] = [];
      acc[storeId].push(order);
      return acc;
    }, {} as Record<string, typeof corruptedOrders>);

    return NextResponse.json({
      message: `Found ${corruptedOrders.length} corrupted orders`,
      count: corruptedOrders.length,
      byStore: byStore,
      sample: corruptedOrders.slice(0, 5),
      action: "Send POST request to DELETE these orders",
    }, { headers: CORS_HEADERS });

  } catch (error) {
    console.error("[ADMIN_CLEANUP_GET_ERROR]", error);
    return NextResponse.json(
      { 
        error: "Failed to scan for corrupted orders", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

// POST: DELETE all corrupted orders
export async function POST(req: Request) {
  try {
    console.log("[ADMIN_CLEANUP_POST] Starting emergency cleanup...");

    // Safety: Check for secret key in production
    const authHeader = req.headers.get('authorization');
    const secretKey = process.env.CLEANUP_SECRET_KEY || 'emergency-cleanup-2024';
    
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json(
        { 
          error: "Unauthorized", 
          message: "Use: curl -H 'Authorization: Bearer emergency-cleanup-2024' [URL]"
        },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    // Step 1: Find all corrupted orders
    const corruptedOrders = await prismadb.order.findMany({
      where: {
        OR: [
          { orderNumber: { equals: null } },
          { customerName: { equals: null } },
          { customerName: { equals: "" } },
          { createdAt: { equals: null } },
        ],
      },
      select: {
        id: true,
        orderNumber: true,
        storeId: true,
        customerName: true,
      },
    });

    console.log(`[ADMIN_CLEANUP_POST] Found ${corruptedOrders.length} orders to delete`);

    if (corruptedOrders.length === 0) {
      return NextResponse.json({
        message: "No corrupted orders found - database is clean!",
        deleted: 0,
        orders: [],
      }, { headers: CORS_HEADERS });
    }

    const orderIds = corruptedOrders.map(o => o.id);

    // Step 2: Delete related order items first (foreign key constraint)
    console.log("[ADMIN_CLEANUP_POST] Deleting order items...");
    const deletedItems = await prismadb.orderItem.deleteMany({
      where: {
        orderId: {
          in: orderIds,
        },
      },
    });
    console.log(`[ADMIN_CLEANUP_POST] Deleted ${deletedItems.count} order items`);

    // Step 3: Delete the corrupted orders
    console.log("[ADMIN_CLEANUP_POST] Deleting orders...");
    const deleteResult = await prismadb.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    console.log(`[ADMIN_CLEANUP_POST] Successfully deleted ${deleteResult.count} orders`);

    return NextResponse.json({
      message: `Emergency cleanup completed`,
      deletedOrders: deleteResult.count,
      deletedItems: deletedItems.count,
      deletedOrderIds: orderIds,
      timestamp: new Date().toISOString(),
    }, { headers: CORS_HEADERS });

  } catch (error) {
    console.error("[ADMIN_CLEANUP_POST_ERROR]", error);
    return NextResponse.json(
      { 
        error: "Emergency cleanup failed", 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
