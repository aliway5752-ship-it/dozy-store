import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, getWhatsAppClient } from '@/lib/whatsapp/client';

export async function GET() {
  try {
    console.log('[WhatsApp API] GET request received');

    // Check if session is pre-authenticated via environment variable
    const hasPreAuthenticatedSession = !!process.env.WHATSAPP_SESSION_DATA;

    if (hasPreAuthenticatedSession) {
      console.log('[WhatsApp API] Session already authenticated via WHATSAPP_SESSION_DATA');
      // Initialize client to ensure it's ready
      await getWhatsAppClient();
      return NextResponse.json(
        {
          success: true,
          message: 'WhatsApp session already authenticated',
          authMethod: 'environment_variable'
        },
        { status: 200 }
      );
    }

    // No pre-authenticated session, request pairing code
    console.log('[WhatsApp API] Requesting pairing code for new session');
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
        phoneNumber: phoneNumber,
        authMethod: 'pairing_code'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WhatsApp API] GET Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initialize WhatsApp',
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

    // Check for CONNECTION_TIMEOUT error
    if (error instanceof Error && error.message === 'CONNECTION_TIMEOUT') {
      return NextResponse.json(
        { error: 'Server busy, retrying...' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
