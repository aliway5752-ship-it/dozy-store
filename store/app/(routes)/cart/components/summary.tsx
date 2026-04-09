"use client";

import Image from "next/image";
import Currency from "@/components/ui/currency";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { useAuth, SignInButton } from "@clerk/nextjs";

interface SummaryProps {
  onProceed?: () => void;
  shippingPrice: number;
}

const Summary: React.FC<SummaryProps> = ({ onProceed, shippingPrice }) => {
  const items = useCart((state) => state.items);
  const { isSignedIn } = useAuth();
  
  const subtotal = items.reduce((total, item) => {
    return total + Number(item.price) * item.quantity;
  }, 0);

  const shipping = items.length > 0 ? shippingPrice : 0; 
  const total = subtotal + shipping;

  return (
    <div className="bg-[#fcfcf9] rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-10">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
      
      <div className="flex flex-col gap-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-x-4">
            <div className="relative h-16 w-16 rounded-md bg-white border border-gray-100">
              <span className="absolute -top-2 -right-2 bg-[#1b4332] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center z-10">
                {item.quantity}
              </span>
              <Image fill src={item.images[0].url} alt="" className="object-cover rounded-md" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-black truncate w-32">{item.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                {item.color.name} / {item.size.name}
              </p>
            </div>
            <div className="text-sm font-medium">
              <Currency value={Number(item.price) * item.quantity} />
            </div>
          </div>
        ))}
      </div>

      <hr className="border-gray-200 mb-4" />

      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-500">SUBTOTAL</span>
          <Currency value={subtotal} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-500">SHIPPING</span>
          <Currency value={shipping} />
        </div>
        <div className="flex items-center justify-between font-bold text-lg pt-2 border-t border-gray-100">
          <span>TOTAL</span>
          <Currency value={total} />
        </div>
      </div>

      {isSignedIn ? (
        <Button 
          disabled={items.length === 0}
          onClick={onProceed} 
          className="w-full bg-[#1b4332] text-white hover:bg-[#143326] rounded-full py-4 font-bold text-sm transition-all"
        >
          Proceed to Payment
        </Button>
      ) : (
        <SignInButton mode="modal">
          <Button 
            disabled={items.length === 0}
            className="w-full bg-[#1b4332] text-white hover:bg-[#143326] rounded-full py-4 font-bold text-sm transition-all"
          >
            Sign In to Checkout
          </Button>
        </SignInButton>
      )}
    </div>
  );
};

export default Summary;