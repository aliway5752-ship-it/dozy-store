import getProduct from "@/actions/get-product";
import getProducts from "@/actions/get-products";
import Gallery from "@/components/gallery";
import Info from "@/components/info";
import ProductList from "@/components/product-list";
import Container from "@/components/ui/container";

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

const ProductPage = async ({ params }: ProductPageProps) => {
    const { productId } = await params;
    const product = await getProduct(productId);
    
    // تأكد إن المنتج موجود عشان ميرميش إيرور
    if (!product) return null;

    const suggestProducts = await getProducts({ categoryId: product?.category?.id });

    return ( 
        <div className="bg-white">
            <Container>
                <div className="px-4 py-10 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
                        {/* إرسال مصفوفة الصور */}
                        <Gallery images={product.images} />
                        <div className="px-4 mt-10 sm:mt-16 sm:px-0 lg:mt-0">
                            {/* إرسال كائن المنتج كاملاً */}
                            <Info data={product} />
                        </div>
                    </div>
                    <hr className="my-10"/>
                    <ProductList title="Related Items" items={suggestProducts} />
                </div>
            </Container>
        </div>
     );
}
 
export default ProductPage;