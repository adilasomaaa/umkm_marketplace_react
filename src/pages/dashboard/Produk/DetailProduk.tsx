import DashboardBreadcrumbs from '@/components/Dashboard/Breadcrumbs';
import ShareButtons from '@/components/Landing/ShareButton';
import UlasanCard from '@/components/Landing/UlasanCard';
import { env } from '@/lib/env';
import { currency_format } from '@/lib/number_format';
import type { Produk, Ulasan } from '@/models';
import { produkService } from '@/services/ProdukService';
import { ulasanService } from '@/services/UlasanService';
import { Button, Chip, Divider, Image, Pagination } from '@heroui/react';
import { ArrowLeft, ChevronLeft, Eye } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

const DetailProduk = () => {
    const {id} = useParams();

    const [produk, setProduk] = useState<Produk | null>(null)
    const [ulasan, setUlasan] = useState<Ulasan[]>([])
    const [isLoading, setIsLoading] = useState(true);
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 10,
        totalData: 0,
        totalPages: 1,
    });

    const fetchProduk = useCallback(async (id: number) => {
        setIsLoading(true);
        try {
            const response = await produkService.show(id);
            setProduk(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const fetchUlasan = useCallback(async (id: number | string) => {
        setIsLoading(true);
        try {
            const response = await ulasanService.index({
                limit: 10,
                produkId: id
            });
            setUlasan(response.data);
            setPaginationInfo(response.meta);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchProduk(Number(id));
    }, [fetchProduk, id]);

    useEffect(() => {
        fetchUlasan(Number(id));
    }, [fetchUlasan, id]);

  return (
    <div>
        <div className="flex-col flex gap-4 my-4">
            <Button color="default" className='w-fit' variant="ghost" onPress={() => window.history.back()}>
                <ChevronLeft /> Kembali
            </Button>
            <DashboardBreadcrumbs />
        </div>
        <div className="grid grid-cols-6 grid-rows-5 gap-4">
            <div className="col-span-6 md:col-span-2 lg:col-span-2 sm:col-span-6 row-span-5">
                <div className="shadow-md rounded-md p-4 border border-gray-200">
                    <Image isZoomed  src={env.baseUrl + produk?.thumbnail}></Image>
                </div>
                <a href={`/${produk?.toko.slug}/${produk?.slug}`} target='_blank'>
                    <Button color="primary" className='w-full mt-4' variant="solid">
                        <Eye></Eye> Lihat Produk
                    </Button>
                </a>
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
                    <Divider/>
                </div>
                <div className="p-4 flex flex-col gap-4">
                    <h2 className='font-semibold text-md'>Ulasan</h2>
                    {ulasan && ulasan.length === 0 && (
                        <p className="text-default-400 text-center">Belum ada ulasan</p>
                    )}
    
                    {ulasan && id && ulasan.length > 0 && (
                        <>
                            {ulasan.map((ulasan, index) => (
                                <UlasanCard 
                                    isEditable={ulasan.status === "menunggu"} 
                                    isDeletable={ulasan.status !== "menunggu"} 
                                    isStatus={true} 
                                    key={index} 
                                    ulasan={ulasan} 
                                    onActionSuccess={() => fetchUlasan(id)} />
                            ))}
                            <div className="flex items-center justify-center">
                                <Pagination onChange={fetchUlasan} showControls initialPage={paginationInfo.page} total={paginationInfo.totalPages} />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default DetailProduk