import { Category } from "@/types";

const URL = `https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/categories`

const getCategories = async (): Promise<Category[]> => {
    try {
        console.log("Fetching categories from URL:", URL);
        const res = await fetch(URL, { 
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (!res.ok) {
            return [];
        }
        return res.json();
    } catch (error) {
        return [];
    }
}

export default getCategories;