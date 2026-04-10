"use client";

import Container from "@/components/ui/container";
import Billboard from "@/components/billboard";
import ProductList from "@/components/product-list";
import { useState, useEffect } from "react";
import { Product, Billboard as BillboardType } from "@/types";

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
                const productsRes = await fetch('https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/products', {
                    cache: 'no-store',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                const productsData = await productsRes.json();
                console.log("Client-side products:", productsData);
                setProducts(Array.isArray(productsData) ? productsData : []);

                // Fetch store to get billboardId
                const storeRes = await fetch('https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b', {
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
                    const billboardRes = await fetch(`https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/billboards/${storeData.billboardId}`, {
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
                    const categoriesRes = await fetch('https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/categories', {
                        cache: 'no-store',
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });
                    const categoriesData = await categoriesRes.json();
                    console.log("Client-side categories:", categoriesData);

                    if (categoriesData && categoriesData.length > 0) {
                        const categoryRes = await fetch(`https://dozy-admin.vercel.app/api/e20f258c-b623-41e1-ab41-d381b626da2b/categories/${categoriesData[0].id}`, {
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
            <div className="flex items-center justify-center min-h-screen luxury-emerald">
                <div className="text-white text-2xl font-bold">Loading...</div>
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