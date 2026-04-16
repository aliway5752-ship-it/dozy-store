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

        // Forward to Railway WhatsApp bot
        try {
            console.log("Forwarding confirmed order to Railway bot...");

            // Calculate total from order items
            const totalAmount = order.orderItems.reduce((sum: number, item) => {
                const price = Number(item.priceAtOrder || item.product.price);
                return sum + (price * item.quantity);
            }, 0);

            const orderData = {
                customerName: order.customerName,
                customerPhone: order.phone,
                totalAmount: totalAmount,
                items: order.orderItems.map((item) => ({
                    name: item.product.name,
                    quantity: item.quantity
                }))
            };

            await fetch('https://web-production-a9cd0.up.railway.app/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            console.log("Order forwarded to Railway bot successfully");
        } catch (notificationError) {
            console.error("Failed to forward order to Railway bot:", notificationError);
            // Don't crash the webhook if notification fails
        }
    }

    return new NextResponse(null, { status: 200 });
}