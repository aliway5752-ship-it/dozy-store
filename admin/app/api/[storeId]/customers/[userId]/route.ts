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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await req.json();
    const { isBlocked } = body;

    if (!userId) {
      return new NextResponse("User ID is required", { status: 400, headers: corsHeaders });
    }

    const user = await prismadb.user.update({
      where: { id: userId },
      data: { isBlocked }
    });

    return NextResponse.json(user, { headers: corsHeaders });
  } catch (error) {
    console.log('[CUSTOMERS_PATCH]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}
