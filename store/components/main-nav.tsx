"use client"

import { cn } from '@/lib/utils';
import { Category } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation'

interface MainNavProps {
    data: Category[] | []
}

const MainNav: React.FC<MainNavProps> = ({ data }) => {
    const pathname = usePathname();

    const routes = data.map(route => ({
        href: `/category/${route.id}`,
        label: route.name,
        active: pathname === `/category/${route.id}`
    }))

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
        </nav>
    )
}

export default MainNav;