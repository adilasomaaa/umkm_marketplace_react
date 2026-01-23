import Loading from '@/components/Dashboard/Loading'
import ProdukCard from '@/components/Landing/ProdukCard'
import type { KategoriShow, Produk } from '@/models'
import { kategoriService } from '@/services/KategoriService'
import { produkService } from '@/services/ProdukService'
import { Divider, Pagination } from '@heroui/react'
import React, { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as LucideIcons from "lucide-react";
import NotFound from '@/components/Landing/NotFound'


const renderIconItem = (name:string, icon:string) => {
    const IconName = icon as keyof typeof LucideIcons;
    const IconComponent = LucideIcons[IconName] as React.ComponentType<{ size: number }>;

    return (
        <div className="flex items-center gap-2  hover:text-primary-600">
            {IconComponent && <IconComponent size={18} />} 
            {name}
        </div>
    );
};

const KategoriPage = () => {
    const {kategoriId} = useParams()
    const [produk, setProduk] = useState<Produk[]>([])
    const [kategori, setKategori] = useState<KategoriShow | null>(null);
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 10,
        totalData: 0,
        totalPages: 1,
    })
    const [isLoading, setIsLoading] = useState(true)
    const [_, setIsLoadingProduk] = useState(true)

    const fetchKategori = useCallback(async (id: number) => {
        setIsLoading(true);
        try {
            const response = await kategoriService.landingShow(id);
            setKategori(response);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        }finally {
            setIsLoading(false);
        }
    }, [kategoriId]);

    const fetchProduk = useCallback(async (page:number) => {
        setIsLoadingProduk(true);
        try {
            const response = await produkService.landing({
                limit:30,
                kategoriId:kategoriId,
                page:page ?? 1
            });
            setProduk(response.data);
            setPaginationInfo(response.meta);
            setIsLoadingProduk(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoadingProduk(false);
        }
    }, [kategoriId]);

    useEffect(() => {
        setKategori(null);
        setProduk([]);
        setIsLoading(true);

        if (!kategoriId) {
            setIsLoading(false);
            return;
        }

        Promise.all([
            fetchKategori(Number(kategoriId)),
            fetchProduk(1)
        ]).finally(() => {
            setIsLoading(false); // Matikan loading setelah keduanya selesai
        });

    }, [kategoriId, fetchKategori, fetchProduk]);

    if(isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loading></Loading>
            </div>
        )
    }

    if(!kategori) {
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
                <div className='flex flex-col my-8 gap-4'>
                    <div className='text-xl font-semibold'>
                        {kategori?.data && kategori.data.nama_kategori && kategori.data.icon && (
                            renderIconItem(kategori.data.nama_kategori, kategori.data.icon)
                        )}
                        <Divider className='my-4' />
                    </div>
                    <div className='grid grid-cols-2 gap-4 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-6'>
                        {produk && produk.length > 0 ? (
                            <>
                                {produk.map((item, index) => (
                                    <ProdukCard item={item} index={index} key={index}></ProdukCard>
                                ))}
                            </>
                        ) : (
                            <div className="grid col-span-12">
                                <p className="text-center text-gray-500">Tidak ada produk</p>
                            </div>
                        )}
                    </div>
                    {produk && produk.length > 0 && (
                        <div className="flex items-center justify-center mt-8">
                            <Pagination onChange={fetchProduk} showControls initialPage={paginationInfo.page} total={paginationInfo.totalPages} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default KategoriPage