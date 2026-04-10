import { Billboard as BillboardType } from '@/types';
import Image from "next/image";

interface BillboardProps {
    data: BillboardType | null
};

const Billboard: React.FC<BillboardProps> = ({ data }) => {
    if (!data) {
        return null;
    }

    return (
        <div className='p-0 overflow-hidden'>
            <div className='relative aspect-[1.8/1] md:aspect-[3/1] overflow-hidden'>
                <Image 
                    fill
                    src={data?.imageUrl}
                    alt={data?.label}
                    className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className='absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4 backdrop-blur-[2px]'>
                    <div className="flex flex-col items-center justify-center gap-y-4">
                        <h1 className="font-black text-6xl sm:text-8xl lg:text-9xl uppercase tracking-[0.4em] 
                            text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-200 to-yellow-700
                            drop-shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-1000">
                            Dozy
                        </h1>
                        <div className="h-[2px] w-32 sm:w-64 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-60 shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                        <p className="text-white/90 font-bold tracking-[0.8em] uppercase text-[10px] sm:text-xs mt-4 drop-shadow-md">
                            Premium Boutique Store
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Billboard;