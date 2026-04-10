import { Size } from "@/types";

const URL = `https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/sizes`

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