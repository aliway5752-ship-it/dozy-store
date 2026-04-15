import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, getWhatsAppClient, disconnectWhatsAppClient } from '@/lib/whatsapp/client';

export const dynamic = 'force-dynamic';

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
  console.log('>>> API REACHED: /api/whatsapp/send');

  try {
    const body = await request.json();
    // Check both phone and phoneNumber fields for compatibility
    const phone = body.phone || body.phoneNumber;
    const message = body.message;
    const orderData = body.orderData;
    const forceNewSession = body.forceNewSession;

    // Validate required fields
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    // Force reconnect if requested
    if (forceNewSession) {
      console.log('[WhatsApp] Force reconnect requested, disconnecting client');
      await disconnectWhatsAppClient();
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

    // Step 1: Connecting
    console.log('[WhatsApp] Step 1: Establishing WhatsApp socket...');
    const client = await getWhatsAppClient();

    // Step 2: Sending
    console.log('[WhatsApp] Step 2: Socket open! Sending your message...');
    console.log('[WhatsApp] Attempting background send for phone:', phone);
    const sendPromise = sendWhatsAppMessage(phone, formattedMessage);
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        console.log('[WhatsApp] Send timeout (8s), proceeding with response');
        resolve(false);
      }, 8000);
    });

    const result = await Promise.race([sendPromise, timeoutPromise]);

    if (result) {
      return NextResponse.json(
        {
          success: true,
          step: 'completed',
          message: 'WhatsApp message sent successfully'
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          step: 'sending',
          message: 'Message sending in background (timed out waiting for confirmation)'
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('[WhatsApp API] Error:', error);

    // Check for CONNECTION_TIMEOUT error
    if (error instanceof Error && error.message === 'CONNECTION_TIMEOUT') {
      return NextResponse.json(
        {
          error: 'Server busy, retrying...',
          step: 'timeout'
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        step: 'error'
      },
      { status: 500 }
    );
  }
}
