import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, name, phone, items, total, address, paymentMethod } = body;

    // Validate required fields
    if (!orderId || !name || !phone || !items || !total) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, name, phone, items, total' },
        { status: 400 }
      );
    }

    // Format items for WhatsApp message
    const itemsFormatted = items.map((item: any) => 
      `• ${item.name || item.product?.name || 'Unknown'} x${item.quantity || 1}`
    ).join('\n');

    // Format WhatsApp message in Arabic with emojis
    const message = `📦 *إشعار طلب جديد!*

🆔 *رقم الطلب:* ${orderId}
👤 *العميل:* ${name}
📞 *الهاتف:* ${phone}
🛍️ *المنتجات:*
${itemsFormatted}
💰 *الإجمالي:* ${total} EGP
${address ? `📍 *العنوان:* ${address}` : ''}
${paymentMethod ? `💳 *طريقة الدفع:* ${paymentMethod}` : ''}

شكراً لتسوقك معنا!`;

    // Owner's WhatsApp number (from environment variable or default)
    const ownerPhone = process.env.WHATSAPP_OWNER_PHONE || '201505914324';

    // Send message in background without waiting for confirmation
    sendWhatsAppMessage(ownerPhone, message).catch(error => {
      console.error('[Order Notification] Background send error:', error);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Notification sent to WhatsApp'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Order Notification] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
