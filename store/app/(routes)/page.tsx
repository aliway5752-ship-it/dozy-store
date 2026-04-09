import Container from "@/components/ui/container";
import Billboard from "@/components/billboard";
import getCategories from "@/actions/get-categories";
import getCategory from "@/actions/get-category";
import getProducts from "@/actions/get-products";
import ProductList from "@/components/product-list";

export const revalidate = 0;

const HomePage = async () => {
    const categories = await getCategories();
    const featuredCategory = categories?.[0];
    const categoryWithBillboard = featuredCategory ? await getCategory(featuredCategory.id) : null;
    const billboard = categoryWithBillboard?.billboard || null;
    
    let products = await getProducts({ isFeatured: true });
    if (!products || products.length === 0) {
        products = await getProducts({});
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