import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, message, orderData } = body;

    // Validate required fields
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    // Format message if order data is provided
    let formattedMessage = message;
    if (orderData) {
      formattedMessage = `
🛍️ *New Order Notification*

*Order #${orderData.orderNumber || 'N/A'}*

Customer: ${orderData.customerName || 'N/A'}
Phone: ${orderData.phone || phone}

Items:
${orderData.items?.map((item: any) => `- ${item.name} x${item.quantity}`).join('\n') || 'No items'}

Total: ${orderData.total || 'N/A'}

Status: ${orderData.status || 'Pending'}

Thank you for shopping at DozyFashion!
      `.trim();
    }

    // Send WhatsApp message
    const success = await sendWhatsAppMessage(phone, formattedMessage);

    if (success) {
      return NextResponse.json(
        { success: true, message: 'WhatsApp message sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[WhatsApp API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
