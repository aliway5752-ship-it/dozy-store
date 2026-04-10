"use client"

import { cn } from '@/lib/utils';
import { Category } from '@/types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Heart, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
            isProtected: true
        },
        { 
            href: '/wishlist', 
            label: 'Wishlist', 
            active: pathname === '/wishlist',
            icon: Heart,
            isProtected: true
        }
    ]

    return (
        // إضافة justify-center للتأكد من توسط الأقسام داخل البار
        <nav className='flex items-center space-x-6 lg:space-x-10'>
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
                    {/* خط ذهبي نحيف جداً يظهر تحت العنصر النشط فقط */}
                    {route.active && <div className="h-[1px] w-full bg-luxury-gold mt-1 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />}
                </Link>
            ))}
            {additionalRoutes.map(route => {
                const Icon = route.icon;
                return (
                    <button
                        key={route.href}
                        onClick={(e) => handleProtectedRoute(e, route.href)}
                        className={cn(
                            'flex items-center gap-2 text-[13px] font-bold transition-all uppercase tracking-[0.25em] drop-shadow-md hover:text-luxury-gold',
                            route.active ? 'text-luxury-gold' : 'text-white/90'
                        )}
                    >
                        <Icon className="h-5 w-5" />
                        <span className="hidden lg:inline">{route.label}</span>
                        {route.active && <div className="h-[1px] w-full bg-luxury-gold mt-1 shadow-[0_0_8px_rgba(212,175,55,0.5)]" />}
                    </button>
                );
            })}
        </nav>
    )
}

export default MainNav;