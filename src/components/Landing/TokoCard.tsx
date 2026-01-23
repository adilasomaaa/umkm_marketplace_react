import { env } from '@/lib/env'
import type { Toko } from '@/models'
import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, Image } from '@heroui/react'
import { MessageCircleMore, StarIcon } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

interface TokoCardProps {
    item: Toko,
    index?: number,
    isCtaButton?: boolean,
    isCabangDisplay?: boolean
}

const TokoCard = ({ item, index, isCtaButton }: TokoCardProps) => {
  return (
    <Card className='w-full'>
      <CardHeader className="flex items-center gap-4">
        <Link to={`/${item.slug}`}>
            <Image
            alt="heroui logo"
            radius="sm"
            src={env.baseUrl + item.logo}
            width={80}
            />
        </Link>
        <div className="flex justify-between gap-4 items-center w-full flex-col sm:flex-col md:flex-col lg:flex-row">
            <div className='flex flex-col gap-2'>
                <Link to={`/${item.slug}`}>
                    <p className="text-md">{item.nama_toko}</p>
                </Link>
                <p className="text-small text-default-500">
                    {item.CabangToko && item.CabangToko[0].alamat} 
                </p>
                 <div className="flex gap-2">
                    {item.KategoriToko?.map((item, index) => (
                        <Chip key={index} color="primary">{item.kategori.nama_kategori}</Chip>
                    ))}
                </div>
            </div>
            <div className='flex justify-end gap-2'>
                {isCtaButton &&
                <Button as={Link} color="primary" to={'https://wa.me/' + item.nomor_hp} target={'_blank'} variant="flat" radius="full" className='mr-4' aria-label="Mojies">
                    <MessageCircleMore /> Hubungi Toko
                </Button>
                }
                <div className='flex items-center gap-2'>
                    <StarIcon className='text-warning-400'></StarIcon>
                    <span className='text-warning-400'>
                        {item.rating || 0}
                    </span>
                </div>
            </div>
        </div>
      </CardHeader>
      
    </Card>
  )
}

export default TokoCard