"use client"

import Image from 'next/image';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageType } from '@/types' 
import GalleryTab from './gallery-tab'; // استيراد التاب من نفس الفولدر

interface GalleryProps {
    images: ImageType[];
}

const Gallery: React.FC<GalleryProps> = ({ images = [] }) => {
    return ( 
        <Tab.Group as="div" className="flex flex-col-reverse">
            <div className='hidden w-full max-w-2xl mx-auto mt-6 sm:block lg:max-w-none'>
                <Tab.List className="grid grid-cols-4 gap-6">
                    {images.map(image => (
                        <GalleryTab key={image.id} image={image} />
                    ))}
                </Tab.List>
            </div>
            <Tab.Panels className="w-full aspect-square">
                {images.map((image) => (
                    <Tab.Panel key={image.id}>
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={image.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className='relative w-full h-full overflow-hidden aspect-square sm:rounded-3xl cursor-zoom-in group'
                            >
                                <Image 
                                    fill 
                                    src={image.url} 
                                    alt='Product Image' 
                                    className='object-cover object-center transition-transform duration-1000 group-hover:scale-125' 
                                />
                            </motion.div>
                        </AnimatePresence>
                    </Tab.Panel>
                ))}
            </Tab.Panels>
        </Tab.Group>
    );
}

export default Gallery;