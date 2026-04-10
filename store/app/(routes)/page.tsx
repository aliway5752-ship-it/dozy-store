import Container from "@/components/ui/container";
import Billboard from "@/components/billboard";
import getCategories from "@/actions/get-categories";
import getCategory from "@/actions/get-category";
import getProducts from "@/actions/get-products";
import getStore from "@/actions/get-store";
import getBillboard from "@/actions/get-billboard";
import ProductList from "@/components/product-list";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const HomePage = async () => {
    const store = await getStore();
    const categories = await getCategories();
    
    let billboard = null;
    
    // Try to get the main billboard from store settings
    if (store?.billboardId) {
        billboard = await getBillboard(store.billboardId);
    }
    
    // Fallback to the first category's billboard if no main billboard is set
    if (!billboard) {
        const featuredCategory = categories?.[0];
        const categoryWithBillboard = featuredCategory ? await getCategory(featuredCategory.id) : null;
        billboard = categoryWithBillboard?.billboard || null;
    }
    
    let products = await getProducts({});
    console.log("Products from API in main page:", products);

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