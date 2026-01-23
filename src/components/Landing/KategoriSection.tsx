import type { Kategori } from '@/models';
import { kategoriService } from '@/services/KategoriService';
import { Card, CardBody, CardHeader } from '@heroui/react'
import { set } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react'
import * as LucideIcons from "lucide-react";
import Loading from '../Dashboard/Loading';
import { Link } from 'react-router-dom';

const renderIconItem = (name:string, icon:string, id: number) => {
    const IconName = icon as keyof typeof LucideIcons;
    const IconComponent = LucideIcons[IconName];
    const Icon = IconComponent;

    return (
        <Link to={`/category/${id}`}>
            <div className="flex items-center gap-2  hover:text-primary-600">
                {Icon && <Icon size={18} />} 
                {name}
            </div>
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
            setIsLoading(false);
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
        <div className="flex justify-center items-center h-64">
            <Loading></Loading>
        </div>
        );
    }
  return (
    <div className='my-8'>
        <Card className='p-4'>
            <CardHeader>
                <span className='text-xl font-semibold'>
                    Kategori Pilihan
                </span>
            </CardHeader>
            <CardBody>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className='border border-gray-200 rounded p-2 cursor-pointer hover:border-primary-200'>
                            {renderIconItem(item.nama_kategori, item.icon, item.id)}
                        </div>
                    ))}
                </div>
            </CardBody>
        </Card>
    </div>
  )
}

export default KategoriSection