"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Container from "@/components/ui/container";
import ProductCard from "@/components/ui/product-card";
import NoResults from "@/components/ui/no-results";
import { Product } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Button from "@/components/ui/button";
import { API_URL } from "@/lib/config";
import { ArrowLeft } from "lucide-react";

const WishlistPage = () => {
  const { userId } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${API_URL}/wishlist?userId=${userId}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const data = await res.json();
        setWishlist(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [userId]);

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen luxury-emerald">
        <div className="text-center">
          <div className="text-[#d4af37] text-2xl font-bold mb-6">Please log in to view your wishlist</div>
          <Link
            href="/sign-in"
            className="inline-block bg-[#d4af37] text-black px-6 py-3 rounded-full font-medium hover:bg-[#d4af37]/90 transition-colors"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-black hover:text-gray-600 transition-colors mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </Link>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black">Wishlist</h1>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-80 w-full" />
              ))}
            </div>
          ) : wishlist.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
              <Link
                href="/"
                className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Go Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map((item) => (
                <ProductCard key={item.id} data={item} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default WishlistPage;
