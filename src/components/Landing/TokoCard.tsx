import { env } from '@/lib/env'
import type { Toko } from '@/models'
import { Button, Card, Chip } from '@heroui/react'
import { MessageCircleMore, Star, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import SafeImage from '@/components/SafeImage'

interface TokoCardProps {
    item: Toko,
    index?: number,
    isCtaButton?: boolean,
    isCabangDisplay?: boolean
}

const TokoCard = ({ item, isCtaButton = true }: TokoCardProps) => {
    return (
        <Card className="group relative overflow-hidden rounded-2xl border border-default-100 bg-white p-4 shadow-none transition-all duration-300 hover:-translate-y-1.5 hover:border-success-200/80  w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full justify-between">
                <div className="flex items-center gap-4">
                    {/* Logo Wrapper */}
                    <Link to={`/${item.slug}`} className="w-[70px] h-[70px] flex-shrink-0 flex items-center justify-center bg-white rounded-2xl border border-default-100 overflow-hidden shadow-sm">
                        <SafeImage
                            alt={item.nama_toko}
                            radius="none"
                            src={env.baseUrl + item.logo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            fallbackType="toko"
                        />
                    </Link>

                    <div className="flex flex-col gap-1.5 text-left">
                        <Link to={`/${item.slug}`} className="font-extrabold text-gray-800 group-hover:text-success-600 transition-colors text-base line-clamp-1">
                            {item.nama_toko}
                        </Link>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                            <div className="flex items-center text-warning-400">
                                <Star className="w-4 h-4 fill-warning-400 stroke-warning-400 transition-transform duration-500 group-hover:rotate-[360deg]" />
                            </div>
                            <span className="text-xs font-bold text-gray-600">
                                {item.rating ? Number(item.rating).toFixed(1) : '0.0'}
                            </span>
                        </div>

                        {/* Categories */}
                        <div className="flex flex-wrap gap-1 mt-0.5">
                            {item.KategoriToko?.map((kt, idx) => (
                                <Chip
                                    key={idx}
                                    color="success"
                                    variant="flat"
                                    size="sm"
                                    className="font-bold text-[9px] h-5 py-0 px-1.5 rounded"
                                >
                                    {kt.kategori.nama_kategori}
                                </Chip>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-col md:flex-row items-center gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-default-50 sm:border-0">
                    {isCtaButton && item.nomor_hp && (
                        <Button
                            as={Link}
                            color="success"
                            to={`https://wa.me/${item.nomor_hp}`}
                            target="_blank"
                            variant="flat"
                            radius="full"
                            size="sm"
                            className="font-semibold text-xs flex-1 sm:flex-initial"
                        >
                            <MessageCircleMore className="w-4 h-4" /> Hubungi
                        </Button>
                    )}
                    <Button
                        as={Link}
                        color="success"
                        to={`/${item.slug}`}
                        variant="solid"
                        radius="full"
                        size="sm"
                        className="font-bold text-xs flex-1 sm:flex-initial bg-gradient-to-r from-success-600 to-emerald-600 hover:from-success-700 hover:to-emerald-700 shadow-sm text-white"
                    >
                        <Store className="w-4 h-4" /> Kunjungi Toko
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default TokoCard;