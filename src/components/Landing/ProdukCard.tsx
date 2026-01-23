import { env } from '@/lib/env';
import { currency_format } from '@/lib/number_format';
import type { Produk } from '@/models'
import { Card, CardBody, CardFooter, Image } from '@heroui/react'

import { Link } from 'react-router-dom';

interface ProdukCardProps {
    item: Produk;
    index: number;
}

const ProdukCard = ({ item, index }: ProdukCardProps) => {
  return (
    <Card key={index} isPressable shadow="sm" className='p-2'>
        <CardBody className="overflow-visible p-0">
            <Link to={`/${item.toko.slug}/${item.slug}`}>
                <Image
                    alt={item.nama_produk}
                    className="w-full object-cover h-[140px]"
                    radius="lg"
                    src={env.baseUrl + item.thumbnail}
                    width="100%"
                />
            </Link>
        </CardBody>
        <CardFooter className="text-small flex flex-col gap-2 justify-start text-left items-start">
            <div>
                <Link to={`/${item.toko.slug}/${item.slug}`}>
                    {item.nama_produk}
                </Link>
            </div>
            <div className='flex items-center gap-2'>
                <Image alt={item.toko.nama_toko} className="w-4 h-4" src={env.baseUrl + item.toko.logo}></Image>
                {item.toko.nama_toko}
            </div>
            <p className="font-semibold">{currency_format(item.harga)}</p>
        </CardFooter>
    </Card>
  )
}

export default ProdukCard