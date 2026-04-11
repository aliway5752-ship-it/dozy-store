"use client"

import { Product } from "@/types";
import Image from "next/image";
import { ShoppingCart, Lock } from "lucide-react";
import Currency from "@/components/ui/currency";
import { useRouter } from "next/navigation";
import { MouseEventHandler } from 'react';
import useCart from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

interface ProductCardProps {
    data: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
    const cart = useCart();
    const router = useRouter();
    const stock = data?.stock ?? 0;
    const isOutOfStock = stock === 0;

    const handleClick = () => {
        router.push(`/product/${data?.id}`)
    }

    const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
        event.stopPropagation();
        if (!isOutOfStock) cart.addItem(data);
    }

    return ( 
        <div className="luxury-card hover-gold-glow group cursor-pointer rounded-[32px] p-5 space-y-6 relative overflow-hidden transition-all duration-700 h-full flex flex-col">
            {/* الجزء القابل للنقر بالكامل - يوجه لصفحة المنتج */}
            <div onClick={handleClick} className="flex-1 space-y-6">
                <div className="aspect-[4/5] rounded-[24px] bg-luxury-black relative overflow-hidden border border-white/5 shadow-2xl">
                    {/* الصورة الأساسية */}
                    <Image
                        fill
                        src={data?.images?.[0]?.url}
                        alt={data.name}
                        className={cn(
                            "aspect-square object-contain rounded-2xl transition-all duration-700",
                            "group-hover:opacity-0 group-hover:scale-110",
                            isOutOfStock && "grayscale opacity-60"
                        )} 
                    />
                    
                    {/* الصورة البديلة تظهر عند الـ Hover */}
                    {data?.images?.[1] && (
                        <Image
                            fill
                            src={data?.images?.[1]?.url}
                            alt={`${data.name} variant`}
                            className={cn(
                                "aspect-square object-contain rounded-2xl transition-all duration-700 absolute inset-0 opacity-0 scale-100",
                                "group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-1"
                            )}
                        />
                    )}
                    
                    {isOutOfStock && (
                      <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-xl text-white text-[11px] font-black px-4 py-2 rounded-full uppercase z-20 border border-white/20 tracking-widest">
                        Sold Out
                      </div>
                    )}
                </div>

                <div className="px-2 space-y-2">
                    <p className="font-black text-2xl sm:text-3xl truncate text-white tracking-tight group-hover:text-luxury-gold transition-colors duration-500">
                        {data?.name}
                    </p>
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] text-yellow-300 uppercase tracking-[0.3em] font-black opacity-90">
                            {data.category.name}
                        </p>
                        <div className="text-xl font-bold text-yellow-400">
                            <Currency value={data?.price} />
                        </div>
                    </div>
                </div>
            </div>

            {/* زر الإضافة للسلة - Glassmorphic وعريض */}
            <div className="px-1 pb-1">
                <button 
                    onClick={onAddToCart}
                    disabled={isOutOfStock}
                    className={cn(
                        "w-full py-4 rounded-2xl flex items-center justify-center gap-x-3 transition-all duration-500 font-black uppercase tracking-[0.2em] text-xs",
                        "glass-gold hover:bg-luxury-gold/30 hover:scale-[1.02] active:scale-95 text-white shadow-xl",
                        isOutOfStock && "opacity-50 cursor-not-allowed grayscale"
                    )}
                >
                    {isOutOfStock ? (
                        <>
                            <Lock size={18} />
                            <span>Out of Stock</span>
                        </>
                    ) : (
                        <>
                            <ShoppingCart size={18} className="group-hover:animate-bounce" />
                            <span>Add to Collection</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

export default ProductCard;