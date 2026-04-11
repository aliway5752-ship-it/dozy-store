"use client";

import { cn } from "@/lib/utils";
import { Check, Package, Truck, CheckCircle2, Clock, MapPin, XCircle } from "lucide-react";
import { useState } from "react";

interface OrderTimelineProps {
  status: string;
  orderId: string;
}

// الحالات بالترتيب مع البيانات الكاملة (Steps 1-5)
const steps = [
  {
    id: "PENDING",
    label: "Pending",
    icon: Clock,
    progress: 10,
    color: "text-orange-400",
    barColor: "bg-orange-400",
    arabicMessage: "تم استلام طلبك، في انتظار التجهيز ⏳",
  },
  {
    id: "PROCESSING",
    label: "Processing",
    icon: Package,
    progress: 35,
    color: "text-luxury-gold",
    barColor: "bg-luxury-gold",
    arabicMessage: "طلبك قيد التجهيز والتحضير",
  },
  {
    id: "SHIPPED",
    label: "Shipped",
    icon: Truck,
    progress: 60,
    color: "text-luxury-gold",
    barColor: "bg-luxury-gold",
    arabicMessage: "طلبك انطلق في رحلته إليك",
  },
  {
    id: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    icon: MapPin,
    progress: 85,
    color: "text-luxury-gold",
    barColor: "bg-luxury-gold",
    arabicMessage: "طلبك في الطريق إليك الآن! 🚚",
  },
  {
    id: "DELIVERED",
    label: "Delivered",
    icon: CheckCircle2,
    progress: 100,
    color: "text-green-500",
    barColor: "bg-green-500",
    arabicMessage: "وصل طلبك بنجاح! نتمنى لك تجربة رائعة ✅",
  },
];

// الحالات التي يُسمح فيها بالإلغاء فقط
const CANCELLABLE_STATUSES = ["PENDING"];

const OrderTimeline: React.FC<OrderTimelineProps> = ({ status, orderId }) => {
  const [cancelling, setCancelling] = useState(false);

  const currentStep = steps.find((s) => s.id === status) ?? steps[0];
  const currentStepIndex = steps.findIndex((s) => s.id === status);
  const canCancel = CANCELLABLE_STATUSES.includes(status);

  const handleCancel = async () => {
    if (!confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;
    setCancelling(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/cancel`, {
        method: "PATCH",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        alert("فشل الإلغاء، يرجى المحاولة لاحقاً.");
      }
    } catch {
      alert("حدث خطأ، يرجى المحاولة لاحقاً.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="w-full py-6 space-y-8">

      {/* --- Arabic Status Message --- */}
      <div className={cn(
        "text-center text-sm font-bold tracking-wide px-4 py-3 rounded-2xl border border-luxury-gold/30 bg-luxury-gold/10 text-luxury-gold shadow-[0_0_15px_rgba(212,175,55,0.1)]",
      )}>
        {currentStep?.arabicMessage || "جاري تحديث حالة الطلب..."}
      </div>

      {/* --- Progress Bar --- */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/40 px-1">
          <span>Order Progress</span>
          <span className={currentStep.color}>{currentStep.progress}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-luxury-gold/50 via-luxury-gold to-luxury-gold shadow-[0_0_10px_rgba(212,175,55,0.5)]")}
            style={{ width: `${currentStep?.progress || 0}%` }}
          />
        </div>
      </div>

      {/* --- Step Circles Timeline --- */}
      <div className="flex items-start justify-between relative max-w-4xl mx-auto px-2">
        {/* Background connector line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-white/10 z-0" />

        {/* Active progress line */}
        <div
          className={cn("absolute top-5 left-0 h-0.5 transition-all duration-1000 z-0", currentStep.barColor)}
          style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 flex-1">
              {/* Circle */}
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0",
                  isCompleted
                    ? "bg-luxury-emerald border-luxury-emerald text-white shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                    : isActive
                    ? "bg-luxury-black border-luxury-gold text-luxury-gold shadow-[0_0_20px_rgba(212,175,55,0.3)] animate-pulse"
                    : "bg-luxury-black border-white/20 text-white/30"
                )}
              >
                {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center leading-tight",
                  isActive ? "text-luxury-gold" : isCompleted ? "text-white/80" : "text-white/25"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* --- Cancel Button --- */}
      {canCancel && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 px-5 py-2.5 rounded-full transition-all duration-300 hover:bg-red-400/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <XCircle size={14} />
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
