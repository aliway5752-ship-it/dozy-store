import prismadb from "@/lib/prismadb";
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from "next/server"
import { sanitizeText, toPositiveInt, toSafePrice } from "@/lib/input";

export async function GET (
    req: Request,
    { params }: { params: Promise<{ productId: string }>}
) {
    try {
        const { productId } = await params; 

        if(!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const product = await prismadb.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                images: true,
                category: true,
                size: true,
                color: true
            }
        })

        return NextResponse.json(product, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            }
        });
    } catch (err) {
        console.log('[PRODUCT_GET]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function PATCH (
    req: Request,
    { params }: { params: Promise<{ storeId: string, productId: string }>}
) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { storeId, productId } = await params; 

        const {
            name,
            price,
            categoryId,
            colorId,
            sizeId,
            images,
            isFeatured,
            isArchived,
            description, // الحقل الجديد
            stock        // الحقل الجديد
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

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        // فحص البيانات الأساسية
        if (!safeName) return new NextResponse("Name is required", { status: 400});
        if (!safePrice) return new NextResponse("Price must be valid", { status: 400});
        if (!categoryId) return new NextResponse("Category id is required", { status: 400});
        if (!colorId) return new NextResponse("Color id is required", { status: 400});
        if (!sizeId) return new NextResponse("Size id is required", { status: 400});
        if (!safeDescription) return new NextResponse("Description is required", { status: 400});
        if (stock === undefined) return new NextResponse("Stock is required", { status: 400});
        if (!safeImages.length) return new NextResponse("Images are required", { status: 400});

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        // التعديل الأساسي هنا لحفظ الوصف والاستوك
        await prismadb.product.update({
            where: {
                id: productId
            },
            data : {
                name: safeName,
                price: safePrice,
                isFeatured,
                isArchived,
                categoryId,
                sizeId,
                colorId,
                description: safeDescription,
                stock: safeStock,
                images: {
                    deleteMany: {}
                },
            }
        })

        const product = await prismadb.product.update({
            where: {
                id: productId
            },
            data: {
                images: {
                    createMany: {
                        data: [
                            ...safeImages
                        ]
                    }
                }
            }
        })

        return NextResponse.json(product);
    } catch (err) {
        console.log('[PRODUCT_PATCH]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}

export async function DELETE (
    req: Request,
    { params }: { params: Promise<{ storeId: string, productId: string }>}
) {
    try {
        const { userId } = await auth();
        const { storeId, productId } = await params; 

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 })
        }

        if(!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        })

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const product = await prismadb.product.deleteMany({
            where: {
                id: productId,
            }
        })

        return NextResponse.json(product);
    } catch (err) {
        console.log('[PRODUCT_DELETE]', err)
        return new NextResponse('Internal error', { status: 500 })
    }
}