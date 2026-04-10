import { Color } from "@/types";

const URL = `${process.env.NEXT_PUBLIC_API_URL}/colors`

const getColors = async (): Promise<Color[]> => {
    try {
        const res = await fetch(URL, { cache: 'no-store' });
        if (!res.ok) {
            return [];
        }
        return res.json();
    } catch (error) {
        return [];
    }
}

export default getColors;