import { Category } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/categories`

const getCategory = async (id: string): Promise<Category | null> => {
    try {
        // إضافة cache: 'no-store' عشان Navbar الأقسام يظهر فوراً
        const res = await fetch(`${URL}/${id}`, { cache: 'no-store' });
        if (!res.ok) {
            return null;
        }
        return res.json();
    } catch (error) {
        return null;
    }
}

export default getCategory;