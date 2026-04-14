import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { sanitizeEmail, sanitizePhone, sanitizeText, toPositiveInt } from "@/lib/input";
import { sendOrderConfirmationEmail } from "@/lib/resend";

// CACHE-BUSTER: Recovery Deploy - 2026-04-12T14:38:00Z
// HARDCODED: Storefront URL for redirect
const FRONTEND_STORE_URL = 'https://store-dozyfashion.vercel.app';

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

    console.log("[CHECKOUT_START]", { storeId, cartItemsCount: cartItems?.length, customerId });

    if (!storeId) {
      return NextResponse.json({ error: "Store id is required" }, { status: 400, headers: corsHeaders });
    }

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400, headers: corsHeaders });
    }

    const safeName = sanitizeText(name, 100) || "Guest Customer";
    const safePhone = sanitizePhone(phone) || "No Phone";
    const safeBackupPhone = sanitizePhone(backupPhone);
    const safeEmail = sanitizeEmail(email);
    const safeAddress = sanitizeText(address, 400) || "No Address";
    const safeNotes = sanitizeText(notes, 500);
    const safeLandmark = sanitizeText(landmark, 200);

    // Validate required fields - must have real data not placeholders
    if (!name || !phone || !address) {
      return NextResponse.json(
        { error: "Please update your profile details before ordering. Name, phone, and address are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!safePhone || safePhone === "No Phone") {
      return NextResponse.json(
        { error: "Please provide a valid phone number" },
        { status: 400, headers: corsHeaders }
      );
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

    console.log("[CHECKOUT_ITEMS]", normalizedItems);

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

    console.log("[CHECKOUT_PRODUCTS]", products);

    const productsMap = new Map(products.map((product) => [product.id, product]));
    for (const item of normalizedItems) {
      const product = await prismadb.product.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          stock: true,
        },
      });

      if (!product) {
        return NextResponse.json({ error: "منتج غير صالح داخل السلة" }, { status: 400, headers: corsHeaders });
      }
      // Safety check: handle null/undefined stock as 0
      const currentStock = product.stock ?? 0;
      if (currentStock === 0) {
        return NextResponse.json({ error: "Wait! One or more items in your cart are no longer available." }, { status: 400, headers: corsHeaders });
      }
      if (item.quantity > currentStock) {
        return NextResponse.json({ error: "Wait! One or more items in your cart have insufficient stock." }, { status: 400, headers: corsHeaders });
      }
    }

    // جلب بيانات المتجر لمعرفة سعر الشحن الحالي
    const store = await prismadb.store.findFirst({
        where: { id: storeId }
    });

    if (!store) {
        return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404, headers: corsHeaders });
    }

    console.log("[CHECKOUT_STORE]", { storeId, shippingPrice: store.shippingPrice });
    console.log("[CHECKOUT_FRONTEND_URL]", process.env.FRONTEND_STORE_URL);

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
          orderCode,
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

      console.log("[CHECKOUT_ORDER_CREATED]", { orderId: createdOrder.id, orderNumber: createdOrder.orderNumber });

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

      console.log("[CHECKOUT_STOCK_UPDATED]");
      return createdOrder;
    });

    // Send order confirmation emails (non-blocking)
    try {
      const orderItemsWithDetails = await prismadb.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true }
      });

      const orderCode = `#DZ-${order.orderNumber}`;

      // Parse full address from body if available
      const addressData = body.fullAddress ? JSON.parse(body.fullAddress) : {};

      const emailData = {
        orderCode,
        customerName: safeName,
        customerEmail: safeEmail,
        customerPhone: safePhone,
        address: {
          fullName: addressData.fullName || safeName,
          phoneNumber: addressData.phoneNumber || safePhone,
          governorate: addressData.governorate || "",
          city: addressData.city || "",
          district: addressData.district || "",
          streetName: addressData.streetName || "",
          buildingNumber: addressData.buildingNumber || "",
          floor: addressData.floor || "",
          apartment: addressData.apartment || "",
          landmark: safeLandmark || addressData.landmark || "",
          fullAddress: safeAddress
        },
        items: orderItemsWithDetails.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: Number(item.product.price)
        })),
        total: orderItemsWithDetails.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) + (store.shippingPrice || 0),
        shippingPrice: store.shippingPrice || 0,
        status: order.status
      };

      await sendOrderConfirmationEmail(emailData);
      console.log("[CHECKOUT_EMAIL_SENT]", { orderCode });
    } catch (emailError) {
      console.log("[CHECKOUT_EMAIL_ERROR]", emailError);
      // Email failure should not prevent order completion
    }

    // Send WhatsApp notification (non-blocking)
    // TEMPORARILY DISABLED: Integration causing build errors
    // TODO: Fix Baileys auth state structure and re-enable
    /*
    try {
      const orderItemsWithDetails = await prismadb.orderItem.findMany({
        where: { orderId: order.id },
        include: { product: true }
      });

      const whatsappMessage = `
🛍️ *New Order Notification*

*Order #${order.orderNumber}*

Customer: ${safeName}
Phone: ${safePhone}
Address: ${safeAddress}

Items:
${orderItemsWithDetails.map(item => `- ${item.product.name} x${item.quantity}`).join('\n')}

Total: ${orderItemsWithDetails.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) + (store.shippingPrice || 0)} EGP

Status: ${order.status}
      `.trim();

      const adminPhone = process.env.ADMIN_WHATSAPP_NUMBER || '';
      if (adminPhone) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: adminPhone,
            message: whatsappMessage,
            orderData: {
              orderNumber: order.orderNumber,
              customerName: safeName,
              phone: safePhone,
              items: orderItemsWithDetails.map(item => ({
                name: item.product.name,
                quantity: item.quantity
              })),
              total: orderItemsWithDetails.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) + (store.shippingPrice || 0),
              status: order.status
            }
          })
        });
        console.log("[CHECKOUT_WHATSAPP_SENT]", { orderNumber: order.orderNumber });
      }
    } catch (whatsappError) {
      console.log("[CHECKOUT_WHATSAPP_ERROR]", whatsappError);
      // WhatsApp failure should not prevent order completion
    }
    */

    // HARDCODED: Force redirect to storefront (not admin)
    const successUrl = `${FRONTEND_STORE_URL}/cart?success=1&orderId=${order.orderNumber}`;
    console.log("[CHECKOUT_SUCCESS_URL]", successUrl);

    return NextResponse.json(
      {
        url: successUrl,
      },
      {
        headers: corsHeaders,
      }
    );

  } catch (error) {
    console.error("[CHECKOUT_POST_ERROR]", error);
    
    // Detailed error logging for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown',
      // Prisma specific error details
      code: (error as any)?.code,
      meta: (error as any)?.meta,
      clientVersion: (error as any)?.clientVersion,
    };
    
    console.error("[CHECKOUT_ERROR_DETAILS]", JSON.stringify(errorDetails, null, 2));
    
    // Return specific error message for Prisma validation errors
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json({ error: "Duplicate order code. Please try again." }, { status: 500, headers: corsHeaders });
    }
    
    if ((error as any)?.code?.startsWith('P')) {
      return NextResponse.json({ 
        error: "Database error occurred", 
        details: error instanceof Error ? error.message : 'Unknown database error'
      }, { status: 500, headers: corsHeaders });
    }
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}