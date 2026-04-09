"use client";

import { motion } from "framer-motion";
import { Product } from "@/types";
import NoResults from "@/components/ui/no-results";
import ProductCard from "@/components/ui/product-card";

interface ProductListProps {
    title: string;
    items: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ title, items }) => {
    const safeItems = Array.isArray(items) ? items : [];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 25, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut" as const
            }
        }
    };

    return ( 
        <div className="space-y-8">
            <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-[0.4em] drop-shadow-md text-center sm:text-left"
            >
                {title}
            </motion.h3>
            {safeItems.length === 0 && <NoResults />}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3"
            >
                {safeItems.map(item => (
                    <motion.div key={item.id} variants={itemVariants}>
                        <ProductCard data={item} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}

export default ProductList;