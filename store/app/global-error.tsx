"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const sendErrorReport = async (error: Error) => {
  try {
    // Check if we've already sent an error report this session
    if (typeof window !== "undefined") {
      const hasReported = sessionStorage.getItem("global_error_report_sent");
      if (hasReported) {
        console.log("[GLOBAL_ERROR_REPORT] Already sent this session, skipping");
        return;
      }

      const errorData = {
        subject: "🚨 GLOBAL ERROR: Site Crash Detected",
        message: error.message || "Unknown error",
        stack: error.stack || "No stack trace available",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        digest: (error as any).digest,
        type: "GLOBAL_ERROR",
      };

      // Send to admin API endpoint
      const response = await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorData),
      });

      if (response.ok) {
        sessionStorage.setItem("global_error_report_sent", "true");
        console.log("[GLOBAL_ERROR_REPORT] Crash report sent successfully");
      } else {
        console.error("[GLOBAL_ERROR_REPORT] Failed to send crash report");
      }
    }
  } catch (e) {
    console.error("[GLOBAL_ERROR_REPORT] Error sending crash report:", e);
  }
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log error to console
    console.error("[GLOBAL_ERROR_BOUNDARY]", error);

    // Send error report (only once per session)
    sendErrorReport(error);
  }, [error]);

  const handleRefresh = () => {
    reset();
    window.location.reload();
  };

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1b4332 0%, #2d5a4a 50%, #1b4332 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              maxWidth: "500px",
              width: "100%",
              textAlign: "center",
              backgroundColor: "rgba(27, 67, 50, 0.6)",
              backdropFilter: "blur(20px)",
              borderRadius: "24px",
              padding: "48px 32px",
              border: "1px solid rgba(212, 175, 55, 0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <AlertTriangle size={40} color="#f87171" />
            </div>

            {/* Primary Message */}
            <h1
              style={{
                color: "#d4af37",
                fontSize: "28px",
                fontWeight: "bold",
                marginBottom: "16px",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Our servers are taking a moment to breathe...
            </h1>

            {/* Secondary Message */}
            <p
              style={{
                color: "rgba(255, 255, 255, 0.8)",
                fontSize: "16px",
                marginBottom: "32px",
                lineHeight: "1.6",
              }}
            >
              Please click the button below to refresh and continue your premium experience.
            </p>

            {/* Error Details (Collapsible) */}
            <details style={{ marginBottom: "32px", textAlign: "left" }}>
              <summary
                style={{
                  color: "#d4af37",
                  cursor: "pointer",
                  fontSize: "14px",
                  textAlign: "center",
                  listStyle: "none",
                }}
              >
                View Error Details ↓
              </summary>
              <div
                style={{
                  marginTop: "16px",
                  padding: "16px",
                  backgroundColor: "rgba(0, 0, 0, 0.3)",
                  borderRadius: "12px",
                  maxHeight: "150px",
                  overflow: "auto",
                }}
              >
                <p
                  style={{
                    color: "#fca5a5",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {error.message}
                </p>
                {error.digest && (
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "11px",
                      marginTop: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            </details>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              style={{
                width: "100%",
                padding: "16px 32px",
                backgroundColor: "#d4af37",
                color: "#000",
                border: "none",
                borderRadius: "16px",
                fontSize: "16px",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 10px 25px rgba(212, 175, 55, 0.3)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#e5c158";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#d4af37";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <RefreshCw size={20} />
              Refresh Now
            </button>

            {/* Home Link */}
            <a
              href="/"
              style={{
                display: "inline-block",
                marginTop: "24px",
                color: "rgba(255, 255, 255, 0.6)",
                textDecoration: "none",
                fontSize: "14px",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#d4af37";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.6)";
              }}
            >
              Return to Home Page
            </a>

            {/* Footer */}
            <p
              style={{
                marginTop: "32px",
                color: "rgba(255, 255, 255, 0.4)",
                fontSize: "12px",
              }}
            >
              Dozy Store • Premium Fashion Experience
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
