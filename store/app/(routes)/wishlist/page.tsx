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
        <div className="text-white text-2xl font-bold">Please log in to view your wishlist</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-black">Wishlist</h1>
            <Link
              href="/"
              className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Continue Shopping
            </Link>
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
