import type { Kategori } from '@/models';
import { kategoriService } from '@/services/KategoriService';
import { useCallback, useEffect, useState } from 'react'
import * as LucideIcons from "lucide-react";
import Loading from '../Dashboard/Loading';
import { Link } from 'react-router-dom';

const renderIconItem = (name: string, icon: string, id: number) => {
    const IconName = icon as keyof typeof LucideIcons;
    const IconComponent = LucideIcons[IconName] as React.ComponentType<any>;
    const Icon = IconComponent;

    return (
        <Link to={`/category/${id}`} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-white border border-default-100 hover:border-success-300 hover:shadow-md transition-all duration-300 group hover:-translate-y-1 hover-glow w-full h-full">
            <div className="w-12 h-12 rounded-xl bg-success-50 group-hover:bg-success-100 flex items-center justify-center text-success-600 transition-colors duration-300">
                {Icon && <Icon className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />} 
            </div>
            <span className="text-xs sm:text-sm font-bold text-gray-700 group-hover:text-success-700 transition-colors text-center">
                {name}
            </span>
        </Link>
    );
};

const KategoriSection = () => {
    const [items, setItems] = useState<Kategori[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchKategori = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await kategoriService.landing();
            setItems(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchKategori();
    }, [fetchKategori])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loading></Loading>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up w-full">
            <div className="bg-white/80 backdrop-blur-md border border-white/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-success-900/5">
                <div className='flex flex-col gap-1 text-left border-b border-default-100 pb-4 mb-6'>
                    <h2 className='text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900'>
                        Kategori <span className="text-success-600 bg-clip-text bg-gradient-to-r from-success-600 to-emerald-600">Pilihan</span>
                    </h2>
                    <p className='text-xs sm:text-sm text-default-500 font-medium'>
                        Telusuri produk terbaik berdasarkan kategori industri kreatif lokal
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {items.map((item) => (
                        <div key={item.id}>
                            {renderIconItem(item.nama_kategori, item.icon, item.id)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default KategoriSection;