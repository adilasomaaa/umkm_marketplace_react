import DashboardBreadcrumbs from '@/components/Dashboard/Breadcrumbs';
import Loading from '@/components/Dashboard/Loading';
import DrawerUlasan from '@/components/Landing/DrawerUlasan';
import NotFound from '@/components/Landing/NotFound';
import ShareButtons from '@/components/Landing/ShareButton';
import TokoCard from '@/components/Landing/TokoCard';
import { env } from '@/lib/env';
import { currency_format } from '@/lib/number_format';
import type { Produk, ProdukResponse, Toko } from '@/models';
import { produkService } from '@/services/ProdukService';
import { tokoService } from '@/services/TokoService';
import { BreadcrumbItem, Breadcrumbs, Button, Chip, Divider, Image, useDisclosure } from '@heroui/react';
import { Heart, MessageSquareText, ShoppingCart } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom';

const ProdukPage = () => {
    const {tokoSlug, produkSlug} = useParams();
    const [produk, setProduk] = useState<Produk | null>(null)
    const [toko, setToko] = useState<Toko | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const fetchProduk = useCallback(async (slug: string) => {
        setIsLoading(true);
        try {
            const response = await produkService.landingProduk(slug);
            setProduk(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchToko = useCallback(async (slug:string) => {
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
    }, [])

    useEffect(() => {
        setProduk(null); 
        setToko(null);
        setIsLoading(true);

        if (produkSlug) {
            fetchProduk(produkSlug);
        }
        if (tokoSlug) {
            fetchToko(tokoSlug);
        }
    }, [produkSlug, tokoSlug])

    if (isLoading) {
        return (
        <div className="flex justify-center items-center h-64">
            <Loading></Loading>
        </div>
        );
    }

    if(!produk || !toko) {
        return (
            <div className="flex justify-center items-center h-64">
                <NotFound></NotFound>
            </div>
        )
    }
    const productURL = `${window.location.origin}/${toko?.slug}/${produk?.slug}`

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl ">
        <div className='grid col-span-12'>
            <div className='flex flex-col my-8 gap-4'>
                <div className='text-xl font-semibold'>
                    <DashboardBreadcrumbs></DashboardBreadcrumbs>
                </div>
                <div className="grid grid-cols-6 grid-rows-5 gap-4">
                    <div className="col-span-6 md:col-span-2 lg:col-span-2 sm:col-span-6 row-span-5">
                        <div className="shadow-md rounded-md p-4 border border-gray-200">
                            <Image isZoomed  src={produk?.thumbnail ? env.baseUrl + produk.thumbnail : undefined}></Image>
                        </div>
                        <div className="flex mt-4 shadow-md border border-gray-200 p-4 rounded justify-between items-center">
                            <div className='text-xl font-semibold'>
                                Bagikan
                            </div>
                            {produk && (
                                <ShareButtons
                                    url={productURL} 
                                    title={produk?.nama_produk} 
                                />
                            )}
                        </div>
                    </div>
                    <div className="col-span-6 md:col-span-4 lg:col-span-4 sm:col-span-6 row-span-5 lg:col-start-3">
                        <div className="p-4 flex flex-col gap-4">
                            <h1 className='font-semibold'>{produk?.nama_produk}</h1>
                            <p className='text-3xl font-bold'>{currency_format(produk?.harga as number)}</p>
                            <Divider className='my-2'/>
                            <p className='text-sm leading-7 text-justify'>{produk?.deskripsi}</p>
                            <Divider className='my-2'/>
                            <div className="flex justify-between text-md">
                                <strong>Kategori</strong> <Chip color="primary">{produk?.kategori.nama_kategori}</Chip>
                            </div>
                            <div className="flex justify-between text-md">
                                <strong>Tersedia di </strong> 
                                {produk?.produkCabangs.map((cabang, index) => (
                                    <Chip key={index} variant="flat" color="primary">{cabang.cabang.nama_cabang}</Chip>
                                ))}
                            </div>
                            <div className="flex justify-between gap-4">
                                <a href={'https://wa.me/' + produk?.toko.nomor_hp} target='_blank' className='w-full'>
                                    <Button variant="solid" className='w-full' color="primary">
                                        <ShoppingCart /> Beli
                                    </Button>
                                </a>
                                <Button variant="bordered" onPress={onOpen} className='w-full' color="default">
                                    <MessageSquareText /> Lihat Ulasan
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 flex items-center gap-4">
                            {toko && <TokoCard item={toko}></TokoCard>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {produk && (
            <DrawerUlasan isOpen={isOpen} onOpenChange={onOpenChange} produk={produk}></DrawerUlasan>
        )}
    </div>
  )
}

export default ProdukPage