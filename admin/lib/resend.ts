// Note: Install resend package with: npm install resend
// Add RESEND_API_KEY to environment variables
import { Resend } from 'resend';

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: {
    fullName?: string;
    phoneNumber?: string;
    governorate?: string;
    city?: string;
    district?: string;
    streetName?: string;
    buildingNumber?: string;
    floor?: string;
    apartment?: string;
    landmark?: string;
    fullAddress?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  shippingPrice: number;
  status: string;
}

export const sendOrderConfirmationEmail = async (data: OrderEmailData) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log('Resend API key not configured, skipping email send');
      return { success: false, error: 'API key not configured' };
    }

    // Send dual emails using Resend onboarding constraints
    const emailPromises = [];
    
    // Primary email to ali.way.5752@gmail.com
    emailPromises.push(
      resend.emails.send({
        from: 'onboarding@resend.dev',
        to: ['ali.way.5752@gmail.com'],
        subject: `Order Confirmation ${data.orderCode}`,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #d4af37;">Order Confirmation</h1>
          <p>Dear ${data.customerName},</p>
          <p>Thank you for your order! Your order <strong>${data.orderCode}</strong> has been received.</p>
          
          <h2 style="color: #d4af37;">Order Details</h2>
          <p><strong>Status:</strong> ${data.status}</p>
          
          <h3>Shipping Address:</h3>
          <p><strong>Recipient:</strong> ${data.address.fullName || data.customerName}</p>
          <p><strong>Phone:</strong> ${data.address.phoneNumber || data.customerPhone}</p>
          <p><strong>Address:</strong> ${data.address.fullAddress || `${data.address.buildingNumber} ${data.address.streetName}, ${data.address.district}, ${data.address.city}, ${data.address.governorate}`}</p>
          ${data.address.landmark ? `<p><strong>Landmark:</strong> ${data.address.landmark}</p>` : ''}
          
          <h3>Items:</h3>
          <ul>
            ${data.items.map(item => `
              <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
            `).join('')}
          </ul>
          
          <p><strong>Subtotal:</strong> $${(data.total - data.shippingPrice).toFixed(2)}</p>
          <p><strong>Shipping:</strong> $${data.shippingPrice.toFixed(2)}</p>
          <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
          
          <p>We will notify you when your order status changes.</p>
          <p>Thank you for shopping with Dozy!</p>
        </div>
      `,
    })
    );
    
    // Secondary email to doaasalem115@gmail.com (with error handling)
    try {
      emailPromises.push(
        resend.emails.send({
          from: 'onboarding@resend.dev',
          to: ['doaasalem115@gmail.com'],
          subject: `Order Confirmation ${data.orderCode}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #d4af37;">Order Confirmation</h1>
              <p>Dear ${data.customerName},</p>
              <p>Thank you for your order! Your order <strong>${data.orderCode}</strong> has been received.</p>
              
              <h2 style="color: #d4af37;">Order Details</h2>
              <p><strong>Status:</strong> ${data.status}</p>
              
              <h3>Items:</h3>
              <ul>
                ${data.items.map(item => `
                  <li>${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</li>
                `).join('')}
              </ul>
              
              <p><strong>Total:</strong> $${data.total.toFixed(2)}</p>
              
              <p>We will notify you when your order status changes.</p>
              <p>Thank you for shopping with Dozy!</p>
            </div>
          `,
        })
      );
    } catch (secondaryEmailError) {
      console.log('[RESEND] Secondary email skipped:', secondaryEmailError);
    }
    
    // Wait for all emails (primary must succeed, secondary is best-effort)
    await Promise.allSettled(emailPromises);

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email' };
  }
};
