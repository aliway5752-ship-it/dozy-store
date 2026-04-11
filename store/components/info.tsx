"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Minus, Plus, AlertTriangle, CheckCircle, XCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";

import { Product } from "@/types";
import Currency from "@/components/ui/currency";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { API_URL } from "@/lib/config";

interface InfoProps {
  data: Product;
}

const Info: React.FC<InfoProps> = ({ data }) => {
  const cart = useCart();
  const { userId, isSignedIn } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [showFloating, setShowFloating] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);

  const stock = data?.stock ?? 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 10;

  useEffect(() => {
    const handleScroll = () => setShowFloating(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSignedIn && userId) {
      checkWishlist();
    }
  }, [isSignedIn, userId, data.id]);

  const checkWishlist = async () => {
    try {
      const res = await fetch(`${API_URL}/wishlist?userId=${userId}`);
      if (res.ok) {
        const wishlist = await res.json();
        const exists = Array.isArray(wishlist) && wishlist.some((item: Product) => item.id === data.id);
        setIsInWishlist(exists);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!isSignedIn) {
      toast.error('Sign in to save items to your wishlist');
      return;
    }

    setIsLoadingWishlist(true);
    try {
      const method = isInWishlist ? 'DELETE' : 'POST';
      const res = await fetch(`${API_URL}/wishlist`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId: data.id }),
      });

      if (res.ok) {
        setIsInWishlist(!isInWishlist);
        toast.success(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
      } else {
        toast.error('Failed to update wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  const onAddToCart = () => {
    cart.addItem(data, quantity);
  };

  return (
    <div>
      <div className="flex items-start justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleWishlist}
          disabled={isLoadingWishlist}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Heart
            size={24}
            className={isInWishlist ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </motion.button>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="text-2xl text-gray-900 font-bold">
          <Currency value={data?.price} />
        </div>
        
        <div className="flex items-center gap-x-2">
          {isOutOfStock ? (
            <div className="flex items-center text-red-600 font-bold text-sm bg-red-50 px-3 py-1 rounded-full border border-red-200">
              <XCircle size={16} className="mr-1" /> Out of Stock
            </div>
          ) : isLowStock ? (
            <div className="flex items-center text-orange-500 font-bold text-sm bg-orange-50 px-3 py-1 rounded-full border border-orange-200 animate-pulse">
              <AlertTriangle size={16} className="mr-1" /> Low Stock - Only {stock} left!
            </div>
          ) : (
            <div className="flex items-center text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CheckCircle size={16} className="mr-1" /> In Stock
            </div>
          )}
        </div>
      </div>

      <hr className="my-4" />
      
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Size:</h3>
          <div>{data?.size?.value}</div>
        </div>
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Color:</h3>
          <div 
            className="h-6 w-6 rounded-full border border-gray-600" 
            style={{ backgroundColor: data?.color?.value }} 
          />
        </div>

        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Quantity:</h3>
          <div className={`flex items-center border border-gray-300 rounded-full p-1 ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 hover:bg-gray-100 rounded-full transition">
              <Minus size={16} />
            </button>
            <span className="px-4 font-bold">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q < stock ? q + 1 : q)} 
              className="p-1 hover:bg-gray-100 rounded-full transition"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center gap-x-3">
        <Button 
          disabled={isOutOfStock}
          onClick={onAddToCart} 
          className={`flex items-center gap-x-2 w-full py-4 justify-center uppercase font-bold tracking-widest ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : ''}`}
        >
          {isOutOfStock ? "Out of Stock" : "Add To Cart"}
          <ShoppingCart size={20} />
        </Button>
      </div>

      <AnimatePresence>
        {(showFloating && !isOutOfStock) && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-50 px-4 sm:hidden"
          >
            <Button onClick={onAddToCart} className="w-full shadow-2xl bg-black text-white flex items-center justify-between px-8 py-5 rounded-full">
              <span className="font-bold uppercase tracking-widest">Add to Cart</span>
              <ShoppingCart size={24} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Info;