"use client";

import Container from "@/components/ui/container";
import Billboard from "@/components/billboard";
import ProductList from "@/components/product-list";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Product, Billboard as BillboardType, Category } from "@/types";

const HomePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [billboard, setBillboard] = useState<BillboardType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                console.log("Client-side fetching products...");

                // Fetch products
                const productsRes = await fetch('https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/products', {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const productsData = await productsRes.json();
                console.log("Client-side products:", productsData);
                setProducts(Array.isArray(productsData) ? productsData : []);

                // Fetch store to get billboardId
                const storeRes = await fetch('https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12', {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const storeData = await storeRes.json();
                console.log("Client-side store:", storeData);

                // Fetch billboard if store has billboardId
                let billboardData = null;
                if (storeData?.billboardId) {
                    const billboardRes = await fetch(`https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/billboards/${storeData.billboardId}`, {
                        cache: 'no-store',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    billboardData = await billboardRes.json();
                    console.log("Client-side billboard:", billboardData);
                    setBillboard(billboardData);
                }

                // Fallback: fetch categories and use first category's billboard
                if (!billboardData) {
                    const categoriesRes = await fetch('https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/categories', {
                        cache: 'no-store',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    const categoriesData = await categoriesRes.json();
                    console.log("Client-side categories:", categoriesData);

                    if (categoriesData && categoriesData.length > 0) {
                        const categoryRes = await fetch(`https://dozy-admin.vercel.app/api/05f25ff6-71b1-4de2-90a8-369b098b1f12/categories/${categoriesData[0].id}`, {
                            cache: 'no-store',
                            headers: {
                                'Content-Type': 'application/json',
                            }
                        });
                        const categoryData = await categoryRes.json();
                        console.log("Client-side category with billboard:", categoryData);
                        if (categoryData?.billboard) {
                            setBillboard(categoryData.billboard);
                        }
                    }
                }
            } catch (error) {
                console.error("Client-side fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col luxury-emerald min-h-screen">
                <Container>
                    <div className="py-12 space-y-12">
                        <Skeleton className="h-96 w-full rounded-3xl" />
                        <div className="flex flex-col px-4 sm:px-6 lg:px-8 mt-12 bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl py-12 shadow-2xl border border-luxury-gold/10">
                            <Skeleton className="h-8 w-48 mb-8" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    return (
        <div className="flex flex-col luxury-emerald min-h-screen">
            {billboard && (
                <Billboard data={billboard} />
            )}
            <Container>
                <div className="pb-10 space-y-12">
                    <div className="flex flex-col px-4 sm:px-6 lg:px-8 mt-12 bg-luxury-emerald/30 backdrop-blur-3xl rounded-3xl py-12 shadow-2xl border border-luxury-gold/10">
                        <ProductList
                            title="Trending Now"
                            items={products}
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default HomePage;