import Loading from '@/components/Dashboard/Loading'
import ProdukCard from '@/components/Landing/ProdukCard'
import type { Produk } from '@/models'
import { produkService } from '@/services/ProdukService'
import { Divider, Pagination } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SearchIcon } from 'lucide-react'

const SearchPage = () => {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''
    
    const [produk, setProduk] = useState<Produk[]>([])
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 10,
        totalData: 0,
        totalPages: 1,
    })
    const [isLoading, setIsLoading] = useState(true)

    const fetchProduk = useCallback(async (page:number, searchQuery: string) => {
        setIsLoading(true);
        try {
            const response = await produkService.landing({
                limit: 30,
                search: searchQuery,
                page: page ?? 1
            });
            setProduk(response.data);
            setPaginationInfo(response.meta);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        setProduk([]);
        if (query) {
            fetchProduk(1, query);
        } else {
            setIsLoading(false);
        }
    }, [query, fetchProduk]);

    if(isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loading></Loading>
            </div>
        )
    }

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl min-h-[50vh]">
        <div className='grid col-span-12'>
            <div className='flex flex-col my-8 gap-4'>
                <div className='flex flex-col my-8 gap-4'>
                    <div className='text-xl font-semibold'>
                        <div className="flex items-center gap-2 hover:text-primary-600">
                            <SearchIcon size={24} />
                            Hasil pencarian untuk "{query}"
                        </div>
                        <Divider className='my-4' />
                    </div>
                    
                    {produk && produk.length > 0 ? (
                        <>
                            <div className='grid grid-cols-2 gap-4 md:grid-cols-4 sm:grid-cols-2 lg:grid-cols-6'>
                                {produk.map((item, index) => (
                                    <ProdukCard item={item} index={index} key={index}></ProdukCard>
                                ))}
                            </div>
                            <div className="flex items-center justify-center mt-8">
                                <Pagination 
                                    onChange={(page) => fetchProduk(page, query)} 
                                    showControls 
                                    initialPage={paginationInfo.page} 
                                    total={paginationInfo.totalPages} 
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <SearchIcon size={48} className="text-default-300 mb-4" />
                            <p className="text-lg font-semibold text-gray-700">Produk tidak ditemukan</p>
                            <p className="text-gray-500 text-sm mt-1">Coba gunakan kata kunci atau hashtag lain.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default SearchPage
