import type { Toko } from '@/models';
import { tokoService } from '@/services/TokoService';
import { useCallback, useEffect, useState } from 'react'
import TokoCard from './TokoCard';
import { Pagination } from '@heroui/react';

const TokoSection = () => {
    const [toko, setToko] = useState<Toko[]>([])
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 10,
        totalData: 0,
        totalPages: 1,
    });
    const [_, setIsLoading] = useState(true);

    const fetchToko = useCallback(async (page:number) => {
        setIsLoading(true);
        try {
            const response = await tokoService.landing({
                limit:10,
                page:page ?? 1
            });
            setToko(response.data);
            setPaginationInfo(response.meta);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchToko(1);
    }, [fetchToko])
  return (
    <div className='flex flex-col my-8 gap-4'>
        <div className='text-xl font-semibold'>
            Mitra Afiliasi
        </div>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 sm:grid-cols-2 lg:grid-cols-2'>
            {toko.map((item, index) => (
                <TokoCard item={item} index={index} key={index}></TokoCard>
            ))}
        </div>
        <div className="flex items-center justify-center">
            <Pagination onChange={fetchToko} showControls initialPage={paginationInfo.page} total={paginationInfo.totalPages} />
        </div>
    </div>
  )
}

export default TokoSection