import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { sanitizeEmail, sanitizePhone, sanitizeText, toPositiveInt } from "@/lib/input";
import { sendOrderConfirmationEmail } from "@/lib/resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const body = await req.json();
    const { cartItems, name, phone, backupPhone, email, address, notes, landmark, customerId } = body;

    if (!storeId) {
      return NextResponse.json({ error: "Store id is required" }, { status: 400, headers: corsHeaders });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400, headers: corsHeaders });
    }

    const safeName = sanitizeText(name, 100) || "Guest";
    const safePhone = sanitizePhone(phone);
    const safeBackupPhone = sanitizePhone(backupPhone);
    const safeEmail = sanitizeEmail(email);
    const safeAddress = sanitizeText(address, 400);
    const safeNotes = sanitizeText(notes, 500);
    const safeLandmark = sanitizeText(landmark, 200);

    if (!safePhone || !safeAddress) {
      return NextResponse.json({ error: "بيانات التواصل والعنوان مطلوبة" }, { status: 400, headers: corsHeaders });
    }

    const normalizedItems = cartItems
      .map((item: { id?: string; quantity?: number }) => ({
        id: sanitizeText(item?.id, 64),
        quantity: toPositiveInt(item?.quantity, 1) || 1,
      }))
      .filter((item: { id: string; quantity: number }) => item.id);

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "السلة غير صالحة" }, { status: 400, headers: corsHeaders });
    }

    const productIds = [...new Set(normalizedItems.map((item: { id: string }) => item.id))];
    const products = await prismadb.product.findMany({
      where: {
        id: { in: productIds },
        storeId,
        isArchived: false,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    const productsMap = new Map(products.map((product) => [product.id, product]));
    for (const item of normalizedItems) {
      const product = productsMap.get(item.id);
      if (!product) {
        return NextResponse.json({ error: "منتج غير صالح داخل السلة" }, { status: 400, headers: corsHeaders });
      }
      if (item.quantity > product.stock) {
        return NextResponse.json({ error: "الكمية المطلوبة غير متاحة حاليا" }, { status: 400, headers: corsHeaders });
      }
    }

    // جلب بيانات المتجر لمعرفة سعر الشحن الحالي
    const store = await prismadb.store.findFirst({
        where: { id: storeId }
    });

    if (!store) {
        return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404, headers: corsHeaders });
    }

    const order = await prismadb.$transaction(async (tx) => {
      // Get the next order number for this store
      const lastOrder = await tx.order.findFirst({
        where: { storeId },
        orderBy: { orderNumber: 'desc' },
        select: { orderNumber: true }
      });

      const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1001;
      const orderCode = `#DZ-${nextOrderNumber}`;

      const createdOrder = await tx.order.create({
        data: {
          storeId,
          isPaid: false,
          status: "PENDING",
          orderNumber: nextOrderNumber,
          orderCode: orderCode,
          shippingPrice: store.shippingPrice, // حفظ سعر الشحن الحالي كـ Snapshot
          customerName: safeName,
          customerId: customerId || null,
          phone: safePhone,
          backupPhone: safeBackupPhone,
          email: safeEmail,
          address: safeAddress,
          notes: safeNotes,
          landmark: safeLandmark,
          orderItems: {
            create: normalizedItems.map((item: { id: string; quantity: number }) => ({
              quantity: item.quantity,
              product: { connect: { id: item.id } },
            })),
          },
        },
      });

      for (const item of normalizedItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return createdOrder;
    });

    // Send order confirmation emails
    const orderItemsWithDetails = await prismadb.orderItem.findMany({
      where: { orderId: order.id },
      include: { product: true }
    });

    const emailData = {
      orderCode: order.orderCode,
      customerName: safeName,
      customerEmail: safeEmail,
      items: orderItemsWithDetails.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: Number(item.product.price)
      })),
      total: orderItemsWithDetails.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0),
      status: order.status
    };

    await sendOrderConfirmationEmail(emailData);

    return NextResponse.json(
      {
        url: `${process.env.FRONTEND_STORE_URL}/cart?success=1&orderId=${order.orderNumber}`,
      },
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.log("[CHECKOUT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}