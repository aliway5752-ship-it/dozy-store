"use client";

import Image from "next/image";
import { Trash, Minus, Plus } from "lucide-react";

import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { Product } from "@/types";

interface CartItemProps {
  data: Product & { quantity: number };
}

const CartItem: React.FC<CartItemProps> = ({ data }) => {
  const cart = useCart();

  const onRemove = () => cart.removeItem(data.id);
  const onAddOne = () => cart.addItem(data, 1);
  const onRemoveOne = () => cart.decrementItem(data.id);

  const totalPrice = Number(data.price) * data.quantity;

  return (
    <div className="grid grid-cols-5 items-center gap-4 py-6 border-b border-gray-100">
      {/* 1. صورة وتفاصيل المنتج (واخد مساحة عمودين) */}
      <div className="col-span-2 flex items-center gap-x-4">
        <div className="relative h-24 w-24 rounded-md overflow-hidden bg-gray-100">
          <Image
            fill
            src={data.images[0].url}
            alt={data.name}
            className="object-cover object-center"
          />
        </div>
        <div className="flex flex-col">
          <p className="text-base font-bold text-black">{data.name}</p>
          {/* هنا التفاصيل بالخط الصغير الرمادي زي ما طلبت */}
          <p className="text-sm text-gray-500 mt-1">
            Color: {data.color.name}, Size: {data.size.name}
          </p>
        </div>
      </div>

      {/* 2. السعر للقطعة الواحدة */}
      <div className="col-span-1 text-sm font-medium text-gray-900">
        <Currency value={data.price} />
      </div>

      {/* 3. عداد الكمية وزرار الحذف */}
      <div className="col-span-1 flex items-center gap-x-4">
        <div className="flex items-center border border-gray-300 rounded-full px-2 py-1 bg-white">
          <button onClick={onRemoveOne} className="p-1 hover:bg-gray-100 rounded-full transition">
            <Minus size={14} className="text-gray-600" />
          </button>
          <span className="mx-3 text-sm font-medium">{data.quantity}</span>
          <button onClick={onAddOne} className="p-1 hover:bg-gray-100 rounded-full transition">
            <Plus size={14} className="text-gray-600" />
          </button>
        </div>
        <button onClick={onRemove} className="text-gray-400 hover:text-red-500 transition">
          <Trash size={18} />
        </button>
      </div>

      {/* 4. السعر الإجمالي للمنتج ده */}
      <div className="col-span-1 text-sm font-bold text-gray-900 text-right">
        <Currency value={totalPrice} />
      </div>
    </div>
  );
};

export default CartItem;