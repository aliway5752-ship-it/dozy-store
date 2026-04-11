"use client";

import { useState } from "react";
import { Menu, X, Heart, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { motion } from 'framer-motion';

interface MobileNavProps {
  data: {
    id: string;
    name: string;
  }[];
}

const MobileNav: React.FC<MobileNavProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleProtectedRoute = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Sign in to access your personalized features', {
        duration: 3000,
        style: {
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }
      });
      setTimeout(() => {
        router.push('/sign-in');
      }, 1500);
    } else {
      router.push(href);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Burger Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-white hover:text-luxury-gold transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-luxury-emerald/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col h-full p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/"
                className="text-2xl font-serif italic text-luxury-gold uppercase tracking-wider"
                onClick={() => setIsOpen(false)}
              >
                Dozy
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white hover:text-luxury-gold transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 space-y-4">
              {data.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="block text-xl text-white hover:text-luxury-gold transition-colors py-2"
                  onClick={() => setIsOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <button
                onClick={(e) => handleProtectedRoute(e, '/my-orders')}
                className="flex flex-col items-center gap-1 text-xl text-white hover:text-luxury-gold transition-colors py-2 w-full text-left"
              >
                <Package size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">My Orders</span>
              </button>
              <button
                onClick={(e) => handleProtectedRoute(e, '/wishlist')}
                className="flex flex-col items-center gap-1 text-xl text-white hover:text-luxury-gold transition-colors py-2 w-full text-left"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <motion.div
                    whileHover={{ color: '#e11d48' }}
                    className="transition-colors"
                  >
                    <Heart size={16} />
                  </motion.div>
                </motion.div>
              </button>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-luxury-gold/20">
              <p className="text-white/60 text-sm text-center">
                © 2026 Dozy. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
