import Loading from '@/components/Dashboard/Loading'
import NotFound from '@/components/Landing/NotFound'
import ProdukCard from '@/components/Landing/ProdukCard'
import SosialMediaCard from '@/components/Landing/SosialMediaCard'
import TokoCard from '@/components/Landing/TokoCard'
import UlasanCard from '@/components/Landing/UlasanCard'
import type { Faq, Produk, SosialMedia, Toko, Ulasan } from '@/models'
import { faqService } from '@/services/FaqService'
import { produkService } from '@/services/ProdukService'
import { sosialMediaService } from '@/services/SosialMediaService'
import { tokoService } from '@/services/TokoService'
import { ulasanService } from '@/services/UlasanService'
import { Accordion, AccordionItem, Pagination, Tab, Tabs } from '@heroui/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const TokoPage = () => {
    
    const {slug} = useParams()

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
                limit:36,
                page:page,
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

    const fetchUlasan = useCallback(async (tokoId: number, page:number) => {
        try {
            const response = await ulasanService.landing({
                page:page,
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

    if(!toko) {
        return (
            <div className="flex justify-center items-center h-64">
                <NotFound></NotFound>
            </div>
        )
    }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl ">
        <div className='grid col-span-12'>
            <div className='flex flex-col my-8 gap-4'>
                {toko &&
                <>
                    <TokoCard isCtaButton item={toko!}></TokoCard>
                    
                    {sosialMedia && sosialMedia.length > 0 &&
                        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4'>
                            {sosialMedia.map((item, index) => (
                                <SosialMediaCard item={item} key={0}></SosialMediaCard>
                            ))}
                        </div>
                    }
                    
                    <Tabs aria-label="Tabs variants" variant="underlined">
                        <Tab key="product" title="Produk" >
                            {produk.length > 0 &&
                                <>
                                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-6 my-4'>
                                        {produk.map((item, index) => (
                                            <ProdukCard key={index} item={item} index={index}></ProdukCard>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Pagination onChange={(page) => fetchProduk(toko.id, page)} showControls initialPage={paginationProdukInfo.page} total={paginationProdukInfo.totalPages} />
                                    </div>
                                </>
                            }
                        </Tab>
                        <Tab key="ulasan" title="Ulasan">
                            {ulasan.length > 0 &&
                                <>
                                    <div className='grid grid-cols-1 gap-4 md:grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 my-4'>
                                        {ulasan.map((item, index) => (
                                            <div className='grid grid-cols-4 gap-4 md:grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 my-4'>
                                                <ProdukCard key={index} item={item.produk} index={index}></ProdukCard>
                                                <div className="col-span-3">
                                                    <UlasanCard key={index} ulasan={item} ></UlasanCard>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <Pagination onChange={(page) => fetchProduk(toko.id, page)} showControls initialPage={paginationProdukInfo.page} total={paginationProdukInfo.totalPages} />
                                    </div>
                                </>
                            }
                        </Tab>
                        <Tab key="faq" title="FAQ">
                            <Accordion selectionMode="multiple">
                                {faq && faq.map((item, index) => (
                                    <AccordionItem key={index} aria-label={item.pertanyaan} title={item.pertanyaan}>
                                        {item.jawaban}
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </Tab>
                    </Tabs>
                    
                </>
                }

            </div>
        </div>
    </div>
  )
}

export default TokoPage