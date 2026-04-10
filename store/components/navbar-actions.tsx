"use client"
import Button from '@/components/ui/button';
import useCart from '@/hooks/use-cart';
import { ShoppingBag, Instagram } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth, useUser } from "@clerk/nextjs";
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export const NavbarActions = () => {
    const [isMounted, setIsMounted] = useState(false);
    const { userId, isSignedIn } = useAuth();
    const { user } = useUser();
    const cart = useCart();
    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleCartClick = () => {
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
            router.push('/cart');
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex items-center ml-auto gap-x-4">
            {/* Any Custom Links / Icons */}
            <button
                onClick={() => window.open("https://www.instagram.com/dozy.boutique?igsh=MTB6Z2I4YTU0YWd1cA==", "_blank")}
                className="hover:text-luxury-gold transition-all duration-300 p-2 hidden sm:block text-white drop-shadow-md"
            >
                <Instagram size={22} className="hover:scale-110 transition-transform" />
            </button>

            {/* Clerk User Management via useAuth hook */}
            <div className="flex items-center text-white drop-shadow-md">
                {userId ? (
                    <Link href="/profile">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 hover:scale-110 transition-transform cursor-pointer shadow-lg">
                            <img
                                src={user?.imageUrl}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                    </Link>
                ) : (
                    <button
                        onClick={() => router.push("/sign-in")}
                        className="hover:text-luxury-gold transition-all duration-300 font-bold uppercase tracking-widest text-xs bg-white/10 px-4 py-2 rounded-full border border-white/20 hover:border-luxury-gold"
                    >
                        Login
                    </button>
                )}
            </div>

            {/* زرار السلة */}
            <Button
                className='flex items-center px-6 py-2.5 glass-gold hover:bg-luxury-gold/20 hover:scale-105 transition-all duration-500 rounded-full'
                onClick={handleCartClick}
            >
                <ShoppingBag size={20} className='text-white' />
                {isSignedIn && (
                    <span className='ml-2 text-sm font-bold text-white tracking-widest'>
                        {cart?.items?.length}
                    </span>
                )}
            </Button>
        </div>
    );
};
