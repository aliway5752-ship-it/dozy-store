import Stripe from "stripe";
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (error: any) {
         return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.customer_details?.address;

    const addressComponents = [
        address?.line1,
        address?.line2,
        address?.city,
        address?.state,
        address?.postal_code,
        address?.country,
    ];

    const addressString = addressComponents.filter(c => c !== null).join(', ');

    if(event.type === 'checkout.session.completed') {
        console.log("🎯 CRITICAL: checkout.session.completed event received");

        // Forward to Railway WhatsApp bot IMMEDIATELY (before any database operations)
        // This ensures bot notification executes even if database update fails
        (async () => {
            try {
                // Force Bot URL
                const botUrl = "https://web-production-a9cd0.up.railway.app/api/checkout";

                console.log("🔍 CRITICAL: Fetching order data for bot notification");

                // Fetch order first to get order items (not update yet)
                const order = await prismadb.order.findUnique({
                    where: {
                        id: session?.metadata?.orderId,
                    },
                    include: {
                        orderItems: {
                            include: {
                                product: true
                            }
                        }
                    }
                });

                if (!order) {
                    console.error("❌ CRITICAL: Order not found for bot notification:", session?.metadata?.orderId);
                    return;
                }

                // Calculate total from order items
                const totalAmount = order.orderItems.reduce((sum: number, item) => {
                    const price = Number(item.priceAtOrder || item.product.price);
                    return sum + (price * item.quantity);
                }, 0);

                const orderData = {
                    customerName: session.customer_details?.name || order.customerName,
                    customerPhone: session.customer_details?.phone || order.phone,
                    totalAmount: totalAmount,
                    items: order.orderItems.map((item) => ({
                        name: item.product.name,
                        quantity: item.quantity
                    }))
                };

                // Explicit Logging
                console.log("🚀 CRITICAL: Sending order data to bot now at:", botUrl);
                console.log("📦 Payload being sent:", JSON.stringify(orderData, null, 2));

                // Response Check
                const response = await fetch(botUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData)
                });

                console.log("📡 BOT RESPONSE STATUS:", response.status);
                if (response.ok) {
                    console.log("✅ Bot received the data successfully");
                } else {
                    console.log("❌ Bot rejected the data");
                }
            } catch (notificationError) {
                console.error("❌ CRITICAL: Failed to forward order to Railway bot:", notificationError);
                // Don't crash the webhook if notification fails
            }
        })(); // Fire and forget - non-blocking

        // Now update the order in the database (this can happen after bot notification)
        const order = await prismadb.order.update({
            where: {
                id: session?.metadata?.orderId,
            },
            data: {
                isPaid: true,
                status: "PAID",
                address: addressString,
                phone: session?.customer_details?.phone || ''
            },
            include: {
                orderItems: {
                    include: {
                        product: true
                    }
                }
            }
        });

        console.log("💾 Order updated successfully in database:", order.id);
    }

    return new NextResponse(null, { status: 200 });
}