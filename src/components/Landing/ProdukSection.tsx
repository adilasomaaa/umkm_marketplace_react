import type { Produk } from '@/models'
import { produkService } from '@/services/ProdukService';
import { useCallback, useEffect, useRef, useState } from 'react'
import ProdukCard from './ProdukCard';
import { Button, Pagination } from '@heroui/react';
import { ChevronLeft, ChevronRight, Grid, LayoutList } from 'lucide-react';

const ProdukSection = () => {
    const [produk, setProduk] = useState<Produk[]>([])
    const [isExpanded, setIsExpanded] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 12,
        totalData: 0,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fetchProduk = useCallback(async (page: number, useLimit?: number) => {
        setIsLoading(true);
        try {
            const limitVal = useLimit || (isExpanded ? 12 : 10);
            const response = await produkService.landing({
                limit: limitVal,
                page: page ?? 1
            });
            setProduk(response.data);
            setPaginationInfo(response.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isExpanded]);

    useEffect(() => {
        fetchProduk(1, isExpanded ? 12 : 10);
    }, [isExpanded, fetchProduk]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollContainerRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div id="produk-unggulan" className='flex flex-col my-12 gap-6 scroll-mt-24 animate-fade-in-up animation-delay-100'>
            <div className='flex items-center justify-between border-b border-default-100 pb-4'>
                <div className='flex flex-col gap-1 text-left'>
                    <h2 className='text-2xl font-extrabold tracking-tight text-gray-900'>
                        Produk <span className="text-success-600 bg-clip-text bg-gradient-to-r from-success-600 to-emerald-600">Unggulan</span>
                    </h2>
                    <p className='text-xs sm:text-sm text-default-500 font-medium'>
                        Koleksi produk terlaris dengan ulasan terbanyak dari pelaku UMKM lokal
                    </p>
                </div>
                <Button 
                    variant="flat" 
                    color="success" 
                    radius="full" 
                    size="sm"
                    className="font-semibold text-xs transition-all duration-300"
                    onPress={() => setIsExpanded(!isExpanded)}
                    startContent={isExpanded ? <LayoutList className="w-3.5 h-3.5" /> : <Grid className="w-3.5 h-3.5" />}
                >
                    {isExpanded ? 'Lihat Carousel' : 'Lihat Semua'}
                </Button>
            </div>

            {isLoading && produk.length === 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse flex flex-col gap-3 p-3 bg-white rounded-2xl border border-default-100">
                            <div className="w-full h-[150px] bg-default-200 rounded-xl" />
                            <div className="h-4 bg-default-200 rounded w-3/4" />
                            <div className="h-3 bg-default-200 rounded w-1/2" />
                            <div className="h-4 bg-default-200 rounded w-1/3 mt-2" />
                        </div>
                    ))}
                </div>
            ) : isExpanded ? (
                <div className="flex flex-col gap-8">
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
                        {produk.map((item, index) => (
                            <ProdukCard item={item} index={index} key={item.id || index}></ProdukCard>
                        ))}
                    </div>
                    {paginationInfo.totalPages > 1 && (
                        <div className="flex items-center justify-center">
                            <Pagination 
                                color="success"
                                onChange={(page) => fetchProduk(page, 12)} 
                                showControls 
                                page={paginationInfo.page} 
                                total={paginationInfo.totalPages} 
                            />
                        </div>
                    )}
                </div>
            ) : (
                <div className="relative group w-full">
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-[-16px] top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white border border-default-200 hover:border-success-300 shadow-md w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 hidden sm:flex hover:scale-105 active:scale-95"
                        aria-label="Scroll Left"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-700" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 py-2 px-1 scroll-smooth"
                    >
                        {produk.map((item, index) => (
                            <div key={item.id || index} className="w-[180px] sm:w-[220px] shrink-0 snap-start">
                                <ProdukCard item={item} index={index}></ProdukCard>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-[-16px] top-1/2 -translate-y-1/2 z-20 bg-white/95 hover:bg-white border border-default-200 hover:border-success-300 shadow-md w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 md:opacity-0 md:group-hover:opacity-100 hidden sm:flex hover:scale-105 active:scale-95"
                        aria-label="Scroll Right"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-700" />
                    </button>
                </div>
            )}
        </div>
    )
}

export default ProdukSection;