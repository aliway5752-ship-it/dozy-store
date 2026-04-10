import { Category } from "@/types";

const URL = `https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/categories`

const getCategory = async (id: string): Promise<Category | null> => {
    try {
        console.log("Fetching category from URL:", `${URL}/${id}`);
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