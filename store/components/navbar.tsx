"use client";

import { usePathname } from "next/navigation";
import Container from "@/components/ui/container";
import Link from "next/link";
import { MainNav } from "@/components";
import getCategories from "@/actions/get-categories";
import { NavbarActions } from "./navbar-actions";
import Image from "next/image";
import MobileNav from "./mobile-nav";
import { useEffect, useState } from "react";

const Navbar = () => {
    const pathname = usePathname();
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getCategories();
            setCategories(data || []);
        };
        fetchCategories();
    }, []);

    // Hide navbar on checkout and wishlist pages
    const isHiddenRoute = pathname.startsWith('/checkout') || pathname.startsWith('/wishlist');

    if (isHiddenRoute) {
        return null;
    }

    return (
        // جعل البار شفاف تماماً ومثبت فوق الـ Billboard بدون أي خلفية بيضاء
        <div className="absolute top-0 inset-x-0 z-50 flex justify-center px-4 sm:px-8 py-4 sm:py-8">
            <div className="w-full max-w-7xl flex items-center justify-between transition-all duration-300">

                {/* الجزء الأيسر: اللوجو واسم الماركة باللون الأبيض */}
                <Link href="/" className="flex items-center gap-x-4 transition-all duration-300 hover:opacity-80 group">
                    <div className="relative h-10 w-10 sm:h-14 sm:w-14 transition-transform duration-500 group-hover:scale-110">
                        <Image
                            src="/logo-final.png"
                            alt="Dozy Signature"
                            fill
                            priority
                            className="object-contain filter drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]"
                        />
                    </div>
                    <p className="font-serif italic text-2xl sm:text-4xl uppercase tracking-[0.5em] hidden md:block text-[#d4af37] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all duration-500 group-hover:tracking-[0.6em]">
                        Dozy
                    </p>
                </Link>

                {/* الجزء الأوسط: المنيو (تأكد أن نصوص الـ MainNav لونها أبيض من ملفها الخاص) */}
                <div className="flex-1 hidden md:flex justify-center">
                    <MainNav data={categories} />
                </div>

                {/* الجزء الأيمن: أيقونات العربة والحساب */}
                <div className="flex items-center gap-x-4">
                    <MobileNav data={categories} />
                    <NavbarActions />
                </div>
            </div>
        </div>
    )
}
export default Navbar;