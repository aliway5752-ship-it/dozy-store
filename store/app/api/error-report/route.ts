import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subject, message, stack, timestamp, userAgent, url, digest } = body;

    // Only send to this specific email - STRICTLY ENFORCED
    const RECIPIENT_EMAIL = "ali.way.5752@gmail.com";

    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn("[ERROR_REPORT_API] RESEND_API_KEY not configured - skipping email send");
      // Return success to not break the app, but log warning
      return NextResponse.json(
        { success: true, warning: "Email service not configured" },
        { headers: corsHeaders }
      );
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #1a1a1a; color: #ffffff;">
        <div style="background: linear-gradient(135deg, #1b4332 0%, #2d5a4a 100%); padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #d4af37;">
          <h1 style="color: #d4af37; margin: 0; font-size: 24px;">🚨 SYSTEM ALERT: Store Crash Detected</h1>
        </div>
        
        <div style="background-color: #2a2a2a; padding: 20px; border-radius: 10px; border-left: 4px solid #ff4444;">
          <h2 style="color: #ff4444; margin-top: 0;">Error Details</h2>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; width: 120px;"><strong>Timestamp:</strong></td>
              <td style="padding: 8px 0; color: #fff; font-family: monospace;">${timestamp}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;"><strong>Error ID:</strong></td>
              <td style="padding: 8px 0; color: #d4af37; font-family: monospace;">${digest || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888;"><strong>Page URL:</strong></td>
              <td style="padding: 8px 0; color: #fff;">${url}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #ff6666;">Error Message:</h3>
            <pre style="background-color: #1a1a1a; padding: 15px; border-radius: 5px; overflow-x: auto; color: #ff9999; font-size: 13px;">${message}</pre>
          </div>
          
          <div style="margin-top: 20px;">
            <h3 style="color: #ff6666;">Stack Trace:</h3>
            <pre style="background-color: #1a1a1a; padding: 15px; border-radius: 5px; overflow-x: auto; color: #aaa; font-size: 11px; max-height: 300px; overflow-y: auto;">${stack}</pre>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #444;">
            <h3 style="color: #888;">User Agent:</h3>
            <p style="color: #666; font-size: 12px; word-break: break-all;">${userAgent}</p>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #2a2a2a; border-radius: 10px; text-align: center;">
          <p style="color: #888; margin: 0; font-size: 12px;">
            This is an automated alert from Dozy Store Error Monitoring System.
          </p>
        </div>
      </div>
    `;

    // Send email ONLY to ali.way.5752@gmail.com
    const result = await resend.emails.send({
      from: "Dozy Store Alerts <alerts@dozy.com>",
      to: RECIPIENT_EMAIL,
      subject: subject,
      html: htmlContent,
    });

    console.log("[ERROR_REPORT_API] Email sent successfully:", result);

    return NextResponse.json(
      { success: true, message: "Error report sent" },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("[ERROR_REPORT_API] Failed to send error report:", error);
    return NextResponse.json(
      { error: "Failed to send error report" },
      { status: 500, headers: corsHeaders }
    );
  }
}
