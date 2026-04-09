import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

// Public route — allows a customer to cancel their own PENDING order
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; orderId: string }> }
) {
  try {
    const { storeId, orderId } = await params;

    if (!storeId || !orderId) {
      return new NextResponse("Store id and Order id are required", { status: 400 });
    }

    // Fetch the order to verify it belongs to this store and is PENDING
    const order = await prismadb.order.findFirst({
      where: {
        id: orderId,
        storeId: storeId,
      },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Only allow cancellation if the order is still PENDING
    if (order.status !== "PENDING") {
      return new NextResponse(
        `Order cannot be cancelled — current status is ${order.status}`,
        { status: 400 }
      );
    }

    const updatedOrder = await prismadb.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.log("[ORDER_CANCEL_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
