import type { Toko } from '@/models';
import { tokoService } from '@/services/TokoService';
import { useCallback, useEffect, useRef, useState } from 'react'
import TokoCard from './TokoCard';
import { Button, Pagination } from '@heroui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TokoSection = () => {
    const [toko, setToko] = useState<Toko[]>([])
    const [isExpanded, setIsExpanded] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 10,
        totalData: 0,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const fetchToko = useCallback(async (page: number, useLimit?: number) => {
        setIsLoading(true);
        try {
            const limitVal = useLimit || (isExpanded ? 10 : 8);
            const response = await tokoService.landing({
                limit: limitVal,
                page: page ?? 1
            });
            setToko(response.data);
            setPaginationInfo(response.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isExpanded]);

    useEffect(() => {
        fetchToko(1, isExpanded ? 10 : 8);
    }, [isExpanded, fetchToko]);

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
        <div id="toko-unggulan" className='my-16 scroll-mt-24 animate-fade-in-up animation-delay-200'>
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                {/* Left Side: Callout Banner */}
                <div className="w-full lg:w-4/12 flex flex-col justify-between bg-gradient-to-br from-success-500 to-emerald-700 text-white rounded-3xl p-8 shadow-md relative overflow-hidden text-left min-h-[300px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none translate-x-10 translate-y-10" />
                    
                    <div className="relative z-10 flex flex-col gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-success-200 bg-white/10 px-3 py-1 rounded-full w-fit">
                            Mitra Afiliasi
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                            Toko Unggulan Teratas
                        </h2>
                        <p className="text-sm text-success-100 leading-relaxed font-medium">
                            Temui pelaku UMKM terpercaya di Kota Kotamobagu. Toko-toko pilihan dengan rating tertinggi dari masyarakat lokal.
                        </p>
                    </div>

                    <div className="relative z-10 mt-8">
                        <Button
                            variant="flat"
                            className="bg-white text-success-700 hover:bg-success-50 font-bold rounded-xl"
                            onPress={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Lihat Carousel' : 'Lihat Semua Toko'}
                        </Button>
                    </div>
                </div>

                {/* Right Side: Carousel / Grid */}
                <div className="w-full lg:w-8/12 flex flex-col justify-center gap-4">
                    {isExpanded && (
                        <div className="flex items-center justify-between border-b border-default-100 pb-2 mb-2 text-left">
                            <span className="text-xs text-default-500 font-semibold">Menampilkan semua mitra UMKM</span>
                            <Button 
                                variant="flat" 
                                color="success" 
                                radius="full" 
                                size="sm"
                                className="font-semibold text-xs"
                                onPress={() => setIsExpanded(false)}
                            >
                                Kembali ke Carousel
                            </Button>
                        </div>
                    )}

                    {isLoading && toko.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="animate-pulse flex gap-4 p-4 bg-white rounded-2xl border border-default-100">
                                    <div className="w-[70px] h-[70px] bg-default-200 rounded-2xl flex-shrink-0" />
                                    <div className="flex-1 flex flex-col gap-2.5">
                                        <div className="h-4 bg-default-200 rounded w-1/2" />
                                        <div className="h-3 bg-default-200 rounded w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : isExpanded ? (
                        <div className="flex flex-col gap-6">
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                {toko.map((item, index) => (
                                    <TokoCard item={item} key={item.id || index}></TokoCard>
                                ))}
                            </div>
                            {paginationInfo.totalPages > 1 && (
                                <div className="flex items-center justify-center mt-4">
                                    <Pagination 
                                        color="success"
                                        onChange={(page) => fetchToko(page, 10)} 
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
                                {toko.map((item, index) => (
                                    <div key={item.id || index} className="w-[280px] sm:w-[320px] shrink-0 snap-start">
                                        <TokoCard item={item}></TokoCard>
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
            </div>
        </div>
    )
}

export default TokoSection;