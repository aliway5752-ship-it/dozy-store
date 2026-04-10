"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { MainNav } from "@/components";

interface MobileNavProps {
  data: {
    id: string;
    name: string;
  }[];
}

const MobileNav: React.FC<MobileNavProps> = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false);

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
              <Link
                href="/my-orders"
                className="block text-xl text-white hover:text-luxury-gold transition-colors py-2"
                onClick={() => setIsOpen(false)}
              >
                My Orders
              </Link>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-8 border-t border-luxury-gold/20">
              <p className="text-white/60 text-sm text-center">
                © 2024 Dozy. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
