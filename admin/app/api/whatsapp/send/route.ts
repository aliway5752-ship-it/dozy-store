import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, getWhatsAppClient } from '@/lib/whatsapp/client';

export async function GET() {
  try {
    console.log('[WhatsApp API] GET request received - requesting pairing code');

    // Get WhatsApp client and request pairing code
    const client = await getWhatsAppClient();
    const phoneNumber = '201505914324';

    // Request pairing code
    const pairingCode = await client.requestPairingCode(phoneNumber);

    // Log pairing code to console for Vercel logs
    console.log('--- PAIRING CODE:', pairingCode, '---');

    // Return response to browser
    return NextResponse.json(
      {
        success: true,
        message: 'Pairing code requested successfully',
        pairingCode: pairingCode,
        phoneNumber: phoneNumber
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WhatsApp API] GET Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to request pairing code',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

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
