import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400, headers: corsHeaders });
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId,
        ...(customerId ? { customerId } : {}),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(orders, { headers: corsHeaders });
  } catch (error) {
    console.log('[ORDERS_GET]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}
