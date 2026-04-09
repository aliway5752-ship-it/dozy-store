import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server'
import prismadb from "@/lib/prismadb";
import { sanitizeText, toPositiveInt, toSafePrice } from "@/lib/input";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { storeId } = await params; 

        const {
            name,
            price,
            categoryId,
            colorId,
            sizeId,
            images,
            isFeatured,
            isArchived,
            description,
            stock
        } = body; 

        const safeName = sanitizeText(name, 120);
        const safeDescription = sanitizeText(description, 2000);
        const safePrice = toSafePrice(price);
        const safeStock = toPositiveInt(stock, 0);
        const safeImages = Array.isArray(images)
          ? images
              .map((image: { url?: string }) => sanitizeText(image?.url, 500))
              .filter((url: string) => /^https?:\/\//.test(url))
              .map((url: string) => ({ url }))
          : [];

        if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        if (!safeName) return NextResponse.json({ error: "Name is required" }, { status: 400 });
        if (!safeImages.length) return NextResponse.json({ error: "Images are required" }, { status: 400 });
        if (!safePrice) return NextResponse.json({ error: "Price must be a valid non-negative number" }, { status: 400 });
        if (!categoryId) return NextResponse.json({ error: "Category id is required" }, { status: 400 });
        if (!colorId) return NextResponse.json({ error: "Color id is required" }, { status: 400 });
        if (!sizeId) return NextResponse.json({ error: "Size id is required" }, { status: 400 });
        if (!safeDescription) return NextResponse.json({ error: "Description is required" }, { status: 400 });
        if (stock === undefined) return NextResponse.json({ error: "Stock is required" }, { status: 400 });

        const storeByUserId = await prismadb.store.findFirst({
            where: { id: storeId, userId }
        });

        if (!storeByUserId) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

        const product = await prismadb.product.create({
            data: {
                name,
                price: safePrice,
                isFeatured,
                isArchived,
                description: safeDescription,
                stock: safeStock,
                categoryId,
                sizeId,
                colorId,
                storeId,
                images: {
                    createMany: {
                        data: safeImages
                    }
                },
            }
        });

        return NextResponse.json(product);
    } catch (err) {
        console.log(`[PRODUCTS_POST]`, err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await params; 
        const { searchParams } = new URL(req.url);
        
        const categoryId = searchParams.get('categoryId') || undefined;
        const sizeId = searchParams.get('sizeId') || undefined;
        const colorId = searchParams.get('colorId') || undefined;
        const isFeatured = searchParams.get('isFeatured');

        if (!storeId) return NextResponse.json({ error: "Store Id is required" }, { status: 400 });

        const products = await prismadb.product.findMany({
            where: {
                storeId,
                categoryId,
                colorId,
                sizeId,
                isFeatured: isFeatured === 'true' ? true : undefined,
                isArchived: false
            },
            include: {
                images: true,
                category: true,
                // التأكد من أن الأسماء مفردة لتطابق الـ Schema الجديد
                color: true,
                size: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(products);
    } catch (err) {
        console.log(`[PRODUCTS_GET]`, err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}