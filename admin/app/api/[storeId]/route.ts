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

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400, headers: corsHeaders });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
      },
      select: {
        id: true,
        name: true,
        shippingPrice: true,
      }
    });

    return NextResponse.json(store, { headers: corsHeaders });
  } catch (error) {
    console.log('[STORE_GET]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}
