import Loading from '@/components/Dashboard/Loading'
import NotFound from '@/components/Landing/NotFound'
import ProdukCard from '@/components/Landing/ProdukCard'
import SosialMediaCard from '@/components/Landing/SosialMediaCard'
import TokoCard from '@/components/Landing/TokoCard'
import UlasanCard from '@/components/Landing/UlasanCard'
import SafeImage from '@/components/SafeImage'
import type { Faq, Produk, SosialMedia, Toko, Ulasan } from '@/models'
import { faqService } from '@/services/FaqService'
import { produkService } from '@/services/ProdukService'
import { sosialMediaService } from '@/services/SosialMediaService'
import { tokoService } from '@/services/TokoService'
import { ulasanService } from '@/services/UlasanService'
import { Accordion, AccordionItem, Pagination } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { env } from '@/lib/env'
import { ShoppingBag, MessageSquare, HelpCircle } from 'lucide-react'

const TokoPage = () => {

    const { slug } = useParams()

    const [toko, setToko] = useState<Toko | null>(null)
    const [produk, setProduk] = useState<Produk[]>([])
    const [faq, setFaq] = useState<Faq[]>([])
    const [ulasan, setUlasan] = useState<Ulasan[]>([])
    const [sosialMedia, setSosialMedia] = useState<SosialMedia[]>([])
    const [paginationProdukInfo, setPaginationProdukInfo] = useState<{
        page: number;
        limit: number;
        totalData: number;
        totalPages: number;
    }>({
        page: 1,
        limit: 36,
        totalData: 0,
        totalPages: 1,
    })
    const [paginationUlasanInfo, setPaginationUlasanInfo] = useState<{
        page: number;
        limit: number;
        totalData: number;
        totalPages: number;
    }>({
        page: 1,
        limit: 36,
        totalData: 0,
        totalPages: 1,
    })
    const [activeTab, setActiveTab] = useState<'produk' | 'ulasan' | 'faq'>('produk')

    const [isLoading, setIsLoading] = useState(true);

    const fetchToko = useCallback(async (slug: string) => {
        setIsLoading(true);
        try {
            const response = await tokoService.landingToko(slug);
            setToko(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchProduk = useCallback(async (tokoId: number, page: number) => {
        try {
            const response = await produkService.landing({
                limit: 36,
                page: page,
                tokoId: tokoId
            });
            setProduk(response.data);
            setPaginationProdukInfo(response.meta);
        } catch (error) {
            console.error("Gagal fetching produk:", error);
            setProduk([]);
        }
    }, [])

    const fetchFaq = useCallback(async (tokoId: number) => {
        try {
            const response = await faqService.landing({
                tokoId: tokoId,
            });
            setFaq(response.data);
        } catch (error) {
            console.error("Gagal fetching produk:", error);
            setFaq([]);
        }
    }, [])

    const fetchUlasan = useCallback(async (tokoId: number, page: number) => {
        try {
            const response = await ulasanService.landing({
                page: page,
                tokoId: tokoId,
                limit: 10
            });
            setUlasan(response.data);
            setPaginationUlasanInfo(response.meta);
        } catch (error) {
            console.error("Gagal fetching produk:", error);
            setFaq([]);
        }
    }, [])

    const fetchSosialMedia = useCallback(async (tokoId: number) => {
        try {
            const response = await sosialMediaService.landing({
                tokoId: tokoId
            });
            setSosialMedia(response.data);
        } catch (error) {
            console.error("Gagal fetching produk:", error);
            setSosialMedia([]);
        }
    }, [])

    useEffect(() => {
        setToko(null);
        setProduk([]);
        setFaq([]);
        setUlasan([]);
        setSosialMedia([]);
        setIsLoading(true);

        if (slug) {
            fetchToko(slug);
        }
    }, [slug, fetchToko]);

    useEffect(() => {
        if (!toko?.id) {
            if (!isLoading) {
                setIsLoading(false);
            }
            return;
        }

        const tokoId = toko.id;

        const promises = [
            fetchProduk(tokoId, 1),
            fetchFaq(tokoId),
            fetchSosialMedia(tokoId),
            fetchUlasan(tokoId, 1)
        ];

        Promise.all(promises)
            .finally(() => {
                setIsLoading(false);
            });

    }, [toko, fetchProduk, fetchFaq, fetchSosialMedia, fetchUlasan]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loading></Loading>
            </div>
        );
    }

    if (!toko) {
        return (
            <div className="flex justify-center items-center h-64">
                <NotFound></NotFound>
            </div>
        )
    }

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 animate-fade-in-up">
            <div className='grid grid-cols-12 gap-6'>
                <div className='col-span-12 flex flex-col gap-6'>
                    {toko && (
                        <>
                            {/* Shop Main Card */}
                            <TokoCard isCtaButton item={toko}></TokoCard>

                            {/* Social Media Grid */}
                            {sosialMedia && sosialMedia.length > 0 && (
                                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4'>
                                    {sosialMedia.map((item, index) => (
                                        <SosialMediaCard item={item} key={index}></SosialMediaCard>
                                    ))}
                                </div>
                            )}

                            {/* Interactive Main Tabs */}
                            <div className="bg-white rounded-3xl p-6 border border-default-100 shadow-sm mt-2 flex flex-col md:flex-row gap-8 items-start w-full">
                                {/* Vertical Tabs Navigation (20% width on md+) */}
                                <div className="w-full md:w-[20%] shrink-0 flex flex-row md:flex-col gap-2 pb-4 md:pb-0 md:pr-4 border-b md:border-b-0 md:border-r border-divider overflow-x-auto scrollbar-none text-left">
                                    <button
                                        onClick={() => setActiveTab('produk')}
                                        className={`w-full px-4 py-3 text-left font-bold rounded transition-all duration-300 flex items-center gap-2 ${activeTab === 'produk'
                                            ? 'bg-success-50 text-success-600 border-l-4 border-success-600'
                                            : 'text-default-500 hover:bg-default-50'
                                            }`}
                                    >
                                        <ShoppingBag className="w-4 h-4" />
                                        Produk
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('ulasan')}
                                        className={`w-full px-4 py-3 text-left font-bold rounded transition-all duration-300 flex items-center gap-2 ${activeTab === 'ulasan'
                                            ? 'bg-success-50 text-success-600 border-l-4 border-success-600'
                                            : 'text-default-500 hover:bg-default-50'
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Ulasan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('faq')}
                                        className={`w-full px-4 py-3 text-left font-bold rounded transition-all duration-300 flex items-center gap-2 ${activeTab === 'faq'
                                            ? 'bg-success-50 text-success-600 border-l-4 border-success-600'
                                            : 'text-default-500 hover:bg-default-50'
                                            }`}
                                    >
                                        <HelpCircle className="w-4 h-4" />
                                        FAQ
                                    </button>
                                </div>

                                {/* Active Tab Panel Content (80% width on md+) */}
                                <div className="w-full md:w-[80%] flex-1">
                                    {activeTab === 'produk' && (
                                        <div className="pt-2">
                                            {produk.length > 0 ? (
                                                <>
                                                    <div className='grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 my-4'>
                                                        {produk.map((item, index) => (
                                                            <ProdukCard key={index} item={item} index={index}></ProdukCard>
                                                        ))}
                                                    </div>
                                                    {paginationProdukInfo.totalPages > 1 && (
                                                        <div className="flex items-center justify-center mt-8">
                                                            <Pagination
                                                                onChange={(page) => fetchProduk(toko.id, page)}
                                                                showControls
                                                                page={paginationProdukInfo.page}
                                                                total={paginationProdukInfo.totalPages}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <ShoppingBag className="w-12 h-12 text-default-300 mb-3" />
                                                    <p className="text-sm font-bold text-gray-700">Belum ada produk</p>
                                                    <p className="text-xs text-default-400 mt-1">Toko ini belum menambahkan produk ke katalog.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'ulasan' && (
                                        <div className="pt-2">
                                            {ulasan.length > 0 ? (
                                                <>
                                                    <div className='flex flex-col gap-6 max-w-4xl mx-auto my-4'>
                                                        {ulasan.map((item, index) => (
                                                            <div key={index} className="flex flex-col md:flex-row gap-4 items-stretch">
                                                                {/* Side-Card for reviewed Product */}
                                                                <div className="w-full md:w-52 shrink-0 flex flex-row md:flex-col gap-3 items-center md:items-start p-4 bg-default-50 rounded-2xl border border-default-100/60 shadow-inner text-left">
                                                                    <SafeImage
                                                                        src={item.produk?.thumbnail ? env.baseUrl + item.produk.thumbnail : undefined}
                                                                        alt={item.produk?.nama_produk}
                                                                        className="w-14 h-14 md:w-full md:h-24 object-cover rounded-xl shadow-sm border border-white"
                                                                        fallbackType="produk"
                                                                    />
                                                                    <div className="flex flex-col text-left">
                                                                        <span className="text-[10px] text-default-400 font-extrabold uppercase tracking-widest">Produk Diulas</span>
                                                                        {item.produk && (
                                                                            <Link
                                                                                to={`/${toko.slug}/${item.produk.slug}`}
                                                                                className="text-sm font-extrabold text-gray-800 hover:text-success-600 line-clamp-2 transition-colors mt-1"
                                                                            >
                                                                                {item.produk.nama_produk}
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Review Card */}
                                                                <div className="flex-1">
                                                                    <UlasanCard key={item.id} ulasan={item}></UlasanCard>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {paginationUlasanInfo.totalPages > 1 && (
                                                        <div className="flex items-center justify-center mt-8">
                                                            <Pagination
                                                                onChange={(page) => fetchUlasan(toko.id, page)}
                                                                showControls
                                                                page={paginationUlasanInfo.page}
                                                                total={paginationUlasanInfo.totalPages}
                                                            />
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <MessageSquare className="w-12 h-12 text-default-300 mb-3" />
                                                    <p className="text-sm font-bold text-gray-700">Belum ada ulasan</p>
                                                    <p className="text-xs text-default-400 mt-1">Ulasan dari pembeli akan ditampilkan di sini.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'faq' && (
                                        <div className="pt-2">
                                            {faq.length > 0 ? (
                                                <Accordion variant="splitted" selectionMode="multiple" className="max-w-4xl mx-auto my-4">
                                                    {faq.map((item, index) => (
                                                        <AccordionItem
                                                            key={index}
                                                            aria-label={item.pertanyaan}
                                                            title={item.pertanyaan}
                                                            className="text-left font-bold text-gray-800 border border-default-100 shadow-sm rounded-2xl"
                                                        >
                                                            <p className="text-sm font-normal text-gray-600 leading-relaxed text-justify whitespace-pre-line px-2 pb-2">
                                                                {item.jawaban}
                                                            </p>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                                    <HelpCircle className="w-12 h-12 text-default-300 mb-3" />
                                                    <p className="text-sm font-bold text-gray-700">FAQ belum diatur</p>
                                                    <p className="text-xs text-default-400 mt-1">Tanya jawab umum belum ditambahkan oleh penjual.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TokoPage