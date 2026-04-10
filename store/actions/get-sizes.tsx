import { Size } from "@/types";

const URL = `https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/sizes`

const getSizes = async (): Promise<Size[]> => {
    try {
        console.log("Fetching sizes from URL:", URL);
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

export default getSizes;