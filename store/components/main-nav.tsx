"use client"

import { cn } from '@/lib/utils';
import { Category } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Heart, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface MainNavProps {
    data: Category[] | []
}

const MainNav: React.FC<MainNavProps> = ({ data }) => {
    const pathname = usePathname();
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
        }
    };

    const routes = data.map(route => ({
        href: `/category/${route.id}`,
        label: route.name,
        active: pathname === `/category/${route.id}`
    }))

    const additionalRoutes = [
        {
            href: '/my-orders',
            label: 'My Orders',
            active: pathname === '/my-orders',
            icon: Package,
            isProtected: true,
            showLabel: true
        },
        {
            href: '/wishlist',
            label: 'Wishlist',
            active: pathname === '/wishlist',
            icon: Heart,
            isProtected: true,
            showLabel: false
        }
    ]

    return (
        <nav className='flex items-center justify-between w-full'>
            {/* Categories - Centered */}
            <div className='flex-1 flex justify-center'>
                <div className='flex items-center space-x-6 lg:space-x-10'>
                    {routes.map(route => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                'text-[13px] font-bold transition-all uppercase tracking-[0.25em] drop-shadow-md hover:text-luxury-gold',
                                route.active ? 'text-luxury-gold' : 'text-white/90'
                            )}
                        >
                            {route.label}
                            {route.active && <div className="h-[1px] w-full bg-luxury-gold mt-1 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />}
                        </Link>
                    ))}
                </div>
            </div>

            {/* User Icons on the Right - Equal gap */}
            <div className='flex items-center space-x-6'>
                {additionalRoutes.map(route => {
                    const Icon = route.icon;
                    return (
                        <button
                            key={route.href}
                            onClick={(e) => handleProtectedRoute(e, route.href)}
                            className={cn(
                                'flex flex-col items-center gap-0 transition-all drop-shadow-md',
                                route.active ? 'text-luxury-gold' : 'text-white/90'
                            )}
                        >
                            {route.label === 'Wishlist' ? (
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                >
                                    <motion.div
                                        whileHover={{ color: '#e11d48' }}
                                        className={cn(
                                            'transition-colors',
                                            route.active ? 'text-luxury-gold' : 'text-white/90'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </motion.div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 1,
                                    }}
                                >
                                    <Icon className="h-4 w-4" />
                                </motion.div>
                            )}
                            {route.showLabel && (
                                <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">
                                    {route.label}
                                </span>
                            )}
                            {route.active && <div className="h-[1px] w-full bg-luxury-gold mt-1 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />}
                        </button>
                    );
                })}
            </div>
        </nav>
    )
}

export default MainNav;