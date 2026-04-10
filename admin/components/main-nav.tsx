"use client"

import { cn } from "@/lib/utils"
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function MainNav({ className, ...props } : React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname();
    const params = useParams();

    const routes = [
        { href: `/${params.storeId}`, label: 'Overview', active: pathname === `/${params.storeId}` },
        { href: `/${params.storeId}/billboards`, label: 'Billboards', active: pathname === `/${params.storeId}/billboards` },
        { href: `/${params.storeId}/categories`, label: 'Categories', active: pathname === `/${params.storeId}/categories` },
        { href: `/${params.storeId}/sizes`, label: 'Sizes', active: pathname === `/${params.storeId}/sizes` },
        { href: `/${params.storeId}/colors`, label: 'Colors', active: pathname === `/${params.storeId}/colors` },
        { href: `/${params.storeId}/products`, label: 'Products', active: pathname === `/${params.storeId}/products` },
        { href: `/${params.storeId}/orders`, label: 'Orders', active: pathname === `/${params.storeId}/orders` },
        { href: `/${params.storeId}/customers`, label: 'Customers', active: pathname === `/${params.storeId}/customers` },
        { href: `/${params.storeId}/settings`, label: 'Settings', active: pathname === `/${params.storeId}/settings` },
    ];

    return (
        <nav className={cn("flex items-center space-x-4 lg:space-x-8 justify-center", className)}>
           {routes.map((route) => (
            <Link 
                key={route.href} 
                href={route.href} 
                className={cn(
                    "text-sm font-medium transition-colors uppercase tracking-widest", 
                    // هنا اللون الذهبي عند الـ Hover
                    "hover:text-[#C5A059]", 
                    route.active ? "text-black border-b-2 border-[#C5A059]" : "text-neutral-500"
                )}
            >
                {route.label}
            </Link>
           ))} 
        </nav>
    )
}