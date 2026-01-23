import type { Produk } from '@/models'
import { produkService } from '@/services/ProdukService';
import React, { useCallback, useEffect, useState } from 'react'
import Loading from '../Dashboard/Loading';
import ProdukCard from './ProdukCard';
import { Pagination } from '@heroui/react';
import { Link } from 'react-router-dom';

const ProdukSection = () => {
    const [produk, setProduk] = useState<Produk[]>([])
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 10,
        totalData: 0,
        totalPages: 1,
    });
    const [isLoading, setIsLoading] = useState(true);

    const fetchProduk = useCallback(async (page:number) => {
        setIsLoading(true);
        try {
            const response = await produkService.landing({
                limit:30,
                page:page ?? 1
            });
            setProduk(response.data);
            setPaginationInfo(response.meta);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProduk(1);
    }, [fetchProduk])

  return (
    <div className='flex flex-col my-8 gap-4'>
        <div className='text-xl font-semibold'>
            Untuk Anda
        </div>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-6'>
            {produk.map((item, index) => (
                <ProdukCard item={item} index={index} key={index}></ProdukCard>
            ))}
        </div>
        <div className="flex items-center justify-center">
            <Pagination onChange={fetchProduk} showControls initialPage={paginationInfo.page} total={paginationInfo.totalPages} />
        </div>
    </div>
  )
}

export default ProdukSection