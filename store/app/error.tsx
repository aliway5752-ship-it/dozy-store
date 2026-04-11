"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const sendErrorReport = async (error: Error) => {
  try {
    // Check if we've already sent an error report this session
    if (typeof window !== "undefined") {
      const hasReported = sessionStorage.getItem("error_report_sent");
      if (hasReported) {
        console.log("[ERROR_REPORT] Already sent this session, skipping");
        return;
      }

      const errorData = {
        subject: "🚨 SYSTEM ALERT: Store Crash Detected",
        message: error.message || "Unknown error",
        stack: error.stack || "No stack trace available",
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        digest: (error as any).digest,
      };

      // Send to admin API endpoint
      const response = await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(errorData),
      });

      if (response.ok) {
        sessionStorage.setItem("error_report_sent", "true");
        console.log("[ERROR_REPORT] Crash report sent successfully");
      } else {
        console.error("[ERROR_REPORT] Failed to send crash report");
      }
    }
  } catch (e) {
    console.error("[ERROR_REPORT] Error sending crash report:", e);
  }
};

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Log error to console
    console.error("[GLOBAL_ERROR]", error);

    // Send error report (only once per session)
    sendErrorReport(error);
  }, [error]);

  const handleRefresh = () => {
    setIsLoading(true);
    reset();
  };

  return (
    <div className="min-h-screen luxury-emerald flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl border border-luxury-gold/20 text-center">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6"
          >
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-[#d4af37] mb-4">
            Something Went Wrong
          </h1>

          {/* Error Message */}
          <p className="text-white/80 mb-2">
            We apologize for the inconvenience.
          </p>
          <p className="text-white/60 text-sm mb-6">
            Our team has been notified automatically.
          </p>

          {/* Error Details (Collapsible) */}
          <details className="mb-6 text-left">
            <summary className="text-luxury-gold cursor-pointer text-sm hover:text-white transition-colors">
              View Error Details
            </summary>
            <div className="mt-2 p-3 bg-black/30 rounded-lg overflow-auto max-h-32">
              <p className="text-red-300 text-xs font-mono whitespace-pre-wrap">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-gray-400 text-xs mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          </details>

          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-full bg-[#d4af37] text-black py-4 rounded-2xl font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#d4af37]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Refresh Now
              </>
            )}
          </motion.button>

          {/* Home Link */}
          <Link
            href="/"
            className="mt-4 inline-block text-white/60 hover:text-[#d4af37] transition-colors text-sm"
          >
            Return to Home Page
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-6">
          Dozy Store • Premium Fashion Experience
        </p>
      </motion.div>
    </div>
  );
}
