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

  if (loading) {
    return (
      <div className="flex flex-col luxury-emerald min-h-screen">
        <Container>
          <div className="py-12 space-y-6">
            <Skeleton className="h-12 w-48" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-96 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="flex flex-col luxury-emerald min-h-screen">
      <Container>
        <div className="py-12">
          <h1 className="text-4xl font-bold text-white mb-8 uppercase tracking-wider">
            My Wishlist
          </h1>

          {wishlist.length === 0 ? (
            <div className="bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl p-12 shadow-2xl border border-luxury-gold/10 text-center">
              <p className="text-white text-2xl mb-6">Your wishlist is empty</p>
              <Link href="/">
                <Button className="bg-luxury-gold text-black hover:bg-luxury-gold/90">
                  Go Shopping
                </Button>
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
