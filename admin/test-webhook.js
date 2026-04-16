/**
 * Test script to simulate Stripe webhook payload locally
 * Run this with: node test-webhook.js
 * 
 * This script sends a simulated checkout.session.completed event to your local webhook endpoint
 * to verify that the bot notification logic executes correctly.
 */

const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/webhook';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_placeholder';

// Simulated Stripe checkout.session.completed payload
const mockEvent = {
  id: 'evt_test_123456789',
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  type: 'checkout.session.completed',
  data: {
    object: {
      id: 'cs_test_123456789',
      object: 'checkout.session',
      customer_details: {
        name: 'Test Customer',
        phone: '+1234567890',
        email: 'test@example.com',
        address: {
          line1: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          postal_code: '12345',
          country: 'US'
        }
      },
      metadata: {
        orderId: 'test-order-id-123' // Replace with a real order ID from your database
      },
      payment_status: 'paid',
      total_amount: 5000
    }
  }
};

async function sendTestWebhook() {
  try {
    console.log('🧪 Starting webhook test...');
    console.log('📡 Target URL:', WEBHOOK_URL);
    console.log('📦 Event type:', mockEvent.type);
    console.log('');

    // Convert event to string
    const payload = JSON.stringify(mockEvent);
    
    // Generate Stripe signature (simplified for testing)
    const timestamp = Math.floor(Date.now() / 1000);
    const signaturePayload = `${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
      .update(signaturePayload)
      .digest('hex');
    
    const stripeSignature = `t=${timestamp},v1=${signature}`;

    console.log('🔐 Generated Stripe signature');
    console.log('');

    // Send webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Stripe-Signature': stripeSignature
      },
      body: payload
    });

    console.log('📊 Webhook response status:', response.status);
    console.log('📊 Webhook response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📊 Webhook response body:', responseText);
    console.log('');

    if (response.ok) {
      console.log('✅ Webhook received successfully');
      console.log('🔍 Check your server logs for the CRITICAL emoji markers:');
      console.log('   - 🎯 CRITICAL: checkout.session.completed event received');
      console.log('   - 🔍 CRITICAL: Fetching order data for bot notification');
      console.log('   - 🚀 CRITICAL: Sending order data to bot now at:');
      console.log('   - 📦 Payload being sent:');
      console.log('   - 📡 BOT RESPONSE STATUS:');
    } else {
      console.log('❌ Webhook failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('📋 Full error:', error);
  }
}

// Run the test
console.log('='.repeat(60));
console.log('STRIPE WEBHOOK TEST SCRIPT');
console.log('='.repeat(60));
console.log('');
console.log('⚠️  IMPORTANT: Make sure your dev server is running on http://localhost:3000');
console.log('⚠️  IMPORTANT: Replace the orderId in mockEvent.metadata with a real order ID from your database');
console.log('⚠️  IMPORTANT: Set STRIPE_WEBHOOK_SECRET environment variable if needed');
console.log('');
console.log('='.repeat(60));
console.log('');

sendTestWebhook();
