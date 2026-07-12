import { env } from '@/lib/env';
import { currency_format } from '@/lib/number_format';
import type { Produk } from '@/models'
import { Card, CardBody, CardFooter } from '@heroui/react'
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import SafeImage from '@/components/SafeImage';

interface ProdukCardProps {
    item: Produk;
    index: number;
}

const ProdukCard = ({ item, index }: ProdukCardProps) => {
  const isAvailable = item.produkCabangs && item.produkCabangs.length > 0
    ? item.produkCabangs.some(pc => pc.status === 'tersedia')
    : true;

  return (
    <Card 
      key={index} 
      isPressable 
      shadow="none" 
      className="group relative overflow-hidden rounded-2xl border border-default-100 bg-white p-2 transition-all duration-300 hover:-translate-y-1.5 hover:border-success-200/80 hover:shadow-md hover-glow w-full"
    >
        <CardBody className="overflow-visible p-0 relative">
            {/* Status Stok Badge */}
            <div className="absolute top-2 left-2 z-10">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm select-none ${
                    isAvailable 
                        ? 'bg-success-500/90 backdrop-blur-sm text-white' 
                        : 'bg-danger-500/90 backdrop-blur-sm text-white'
                }`}>
                    {isAvailable ? 'Tersedia' : 'Habis'}
                </span>
            </div>

            {/* Total Ulasan Badge */}
            {item.totalUlasan > 0 && (
                <div className="absolute top-2 right-2 z-10">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-sm text-warning-600 shadow-sm flex items-center gap-0.5 select-none border border-warning-100">
                        <Star className="w-2.5 h-2.5 fill-warning-500 stroke-warning-500" /> 
                        {item.totalUlasan}
                    </span>
                </div>
            )}

            <Link to={`/${item.toko.slug}/${item.slug}`} className="block w-full overflow-hidden rounded-xl bg-default-100">
                <SafeImage
                    alt={item.nama_produk}
                    className="w-full object-cover h-[150px] group-hover:scale-105 transition-transform duration-500"
                    radius="none"
                    src={env.baseUrl + item.thumbnail}
                    width="100%"
                    fallbackType="produk"
                />
            </Link>
        </CardBody>
        <CardFooter className="text-small flex flex-col gap-2 justify-start text-left items-start px-1.5 py-3">
            <div className="w-full">
                <Link to={`/${item.toko.slug}/${item.slug}`} className="font-bold text-gray-800 line-clamp-1 group-hover:text-success-600 transition-colors text-sm">
                    {item.nama_produk}
                </Link>
            </div>
            
            {/* Toko Info */}
            <div className='flex items-center gap-1.5 w-full text-xs text-default-500 font-medium'>
                <SafeImage alt={item.toko.nama_toko} className="w-4 h-4 rounded-full border border-default-200" src={env.baseUrl + item.toko.logo} fallbackType="toko"></SafeImage>
                <Link to={`/${item.toko.slug}`} className="hover:underline line-clamp-1 hover:text-primary-500">
                    {item.toko.nama_toko}
                </Link>
            </div>

            {/* Hashtags */}
            {item.hashtags && item.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1 w-full">
                    {item.hashtags.slice(0, 2).map((ph, idx) => (
                        <span key={idx} className="text-[9px] bg-success-50 text-success-700 px-1.5 py-0.5 rounded font-semibold tracking-wide">
                            #{ph.hashtag.nama}
                        </span>
                    ))}
                </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between w-full mt-1 border-t border-default-50 pt-2">
                <p className="font-extrabold text-sm text-success-600">{currency_format(item.harga)}</p>
            </div>
        </CardFooter>
    </Card>
  )
}

export default ProdukCard;