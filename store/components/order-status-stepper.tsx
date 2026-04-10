"use client";

interface OrderStatusStepperProps {
  status: string;
}

const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({ status }) => {
  const steps = [
    { key: 'PENDING', label: 'Pending' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' },
    { key: 'CANCELED', label: 'Canceled' },
  ];

  const currentIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="flex items-center space-x-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isCanceled = status === 'CANCELED';

        return (
          <div key={step.key} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                isCanceled && step.key === 'CANCELED'
                  ? 'bg-red-600 text-white'
                  : isCurrent
                  ? 'bg-luxury-gold text-black'
                  : isCompleted
                  ? 'bg-green-600 text-white'
                  : 'bg-luxury-black/50 text-white'
              }`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-8 h-1 ${
                  isCompleted && !isCanceled ? 'bg-green-600' : 'bg-luxury-black/50'
                }`}
              />
            )}
          </div>
        );
      })}
      <span className="text-white text-sm ml-2 uppercase tracking-wider">{status}</span>
    </div>
  );
};

export default OrderStatusStepper;
