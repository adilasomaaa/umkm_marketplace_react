import DashboardBreadcrumbs from '@/components/Dashboard/Breadcrumbs';
import Loading from '@/components/Dashboard/Loading';
import DrawerUlasan from '@/components/Landing/DrawerUlasan';
import NotFound from '@/components/Landing/NotFound';
import ShareButtons from '@/components/Landing/ShareButton';
import TokoCard from '@/components/Landing/TokoCard';
import { env } from '@/lib/env';
import { currency_format } from '@/lib/number_format';
import type { Produk, Toko } from '@/models';
import { produkService } from '@/services/ProdukService';
import { tokoService } from '@/services/TokoService';
import { Button, Chip, Divider, useDisclosure } from '@heroui/react';
import { MessageSquareText, ShoppingCart, Star, Share2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import SafeImage from '@/components/SafeImage';
import { useCart } from '@/context/CartContext';

const ProdukPage = () => {
    const {tokoSlug, produkSlug} = useParams();
    const [produk, setProduk] = useState<Produk | null>(null)
    const [toko, setToko] = useState<Toko | null>(null)
    const [isLoading, setIsLoading] = useState(true);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const { addToCart } = useCart();
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const fetchProduk = useCallback(async (slug: string) => {
        setIsLoading(true);
        try {
            const response = await produkService.landingProduk(slug);
            setProduk(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchToko = useCallback(async (slug:string) => {
        setIsLoading(true);
        try {
            const response = await tokoService.landingToko(slug);
            setToko(response.data);
            setIsLoading(false);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [])

    const handleAddToCart = async () => {
        if (!produk || !toko) return;
        setIsAddingToCart(true);
        try {
            await addToCart(toko.id, produk.id, 1);
        } catch (error) {
            console.error('Gagal menambahkan ke keranjang:', error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    useEffect(() => {
        setProduk(null); 
        setToko(null);
        setIsLoading(true);

        if (produkSlug) {
            fetchProduk(produkSlug);
        }
        if (tokoSlug) {
            fetchToko(tokoSlug);
        }
    }, [produkSlug, tokoSlug])

    if (isLoading) {
        return (
        <div className="flex justify-center items-center h-64">
            <Loading></Loading>
        </div>
        );
    }

    if(!produk || !toko) {
        return (
            <div className="flex justify-center items-center h-64">
                <NotFound></NotFound>
            </div>
        )
    }
    const productURL = `${window.location.origin}/${toko?.slug}/${produk?.slug}`

  const isAvailable = produk?.produkCabangs && produk.produkCabangs.length > 0
      ? produk.produkCabangs.some((pc: any) => pc.status === 'tersedia')
      : true;

  const totalReviews = (produk as any)?.ulasans ? (produk as any).ulasans.length : 0;
  const avgRating = totalReviews > 0 
      ? ((produk as any).ulasans.reduce((sum: number, u: any) => sum + u.nilai, 0) / totalReviews).toFixed(1)
      : '0.0';

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 animate-fade-in-up">
        <div className='flex flex-col gap-6 text-left'>
            {/* Breadcrumbs */}
            <div className='text-sm text-default-500 font-medium py-2 border-b border-default-100'>
                <DashboardBreadcrumbs />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Image & Share */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* Image Wrapper */}
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-default-100 p-4 shadow-sm flex items-center justify-center">
                        {/* Stock status overlay badge */}
                        <div className="absolute top-6 left-6 z-10">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-md select-none ${
                                isAvailable 
                                    ? 'bg-success-500 text-white' 
                                    : 'bg-danger-500 text-white'
                            }`}>
                                {isAvailable ? 'Tersedia' : 'Stok Habis'}
                            </span>
                        </div>
                        
                        <SafeImage 
                            isZoomed 
                            alt={produk?.nama_produk}
                            className="w-full object-cover rounded-2xl max-h-[420px]" 
                            src={produk?.thumbnail ? env.baseUrl + produk.thumbnail : undefined}
                            width="100%"
                            fallbackType="produk"
                        />
                    </div>

                    {/* Share Card */}
                    <div className="flex bg-white border border-default-100 p-4 rounded-3xl justify-between items-center shadow-sm">
                        <div className='flex items-center gap-2 text-sm font-extrabold text-gray-800'>
                            <Share2 className="w-4 h-4 text-success-600" />
                            Bagikan Produk
                        </div>
                        {produk && (
                            <ShareButtons
                                url={productURL} 
                                title={produk?.nama_produk} 
                            />
                        )}
                    </div>
                </div>

                {/* Right Column: Product Info & Store Profile */}
                <div className="lg:col-span-7 flex flex-col gap-6 text-left">
                    {/* Core Info */}
                    <div className="bg-white border border-default-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                        {/* Category & Rating */}
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Chip color="success" variant="flat" size="sm" className="font-bold">
                                {produk?.kategori.nama_kategori}
                            </Chip>
                            
                            {/* Star Rating Badge */}
                            <div className="flex items-center gap-1.5 bg-warning-50 border border-warning-100 px-3 py-1 rounded-full select-none">
                                <Star className="w-4 h-4 fill-warning-400 stroke-warning-400" />
                                <span className="text-xs font-bold text-warning-700">
                                    {avgRating} ({totalReviews} Ulasan)
                                </span>
                            </div>
                        </div>

                        {/* Hashtags */}
                        {produk?.hashtags && produk.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {produk.hashtags.map((ph: any, index: number) => (
                                    <Chip key={index} variant="flat" color="primary" size="sm" className="font-medium text-xs">
                                        #{ph.hashtag.nama}
                                    </Chip>
                                ))}
                            </div>
                        )}

                        <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mt-1'>
                            {produk?.nama_produk}
                        </h1>
                        
                        <p className='text-3xl font-black text-success-600 mt-1'>
                            {currency_format(produk?.harga as number)}
                        </p>

                        <Divider className='my-2'/>
                        
                        {/* Description */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Deskripsi Produk</h3>
                            <p className='text-sm leading-relaxed text-gray-600 text-justify whitespace-pre-line'>
                                {produk?.deskripsi}
                            </p>
                        </div>

                        <Divider className='my-2'/>

                        {/* Branches Availability */}
                        <div className="flex flex-col gap-2">
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Tersedia Di Cabang</h3>
                            <div className="flex flex-wrap gap-2">
                                {produk?.produkCabangs.map((pc: any, index: number) => (
                                    <Chip 
                                        key={index} 
                                        variant="flat" 
                                        color={pc.status === 'tersedia' ? 'success' : 'danger'}
                                        size="sm"
                                        className="font-bold"
                                    >
                                        {pc.cabang.nama_cabang} ({pc.status === 'tersedia' ? 'Tersedia' : 'Habis'})
                                    </Chip>
                                ))}
                            </div>
                        </div>

                        <Divider className='my-2'/>

                        {/* CTA Action Buttons */}
                        <div className="flex flex-col gap-3 mt-2">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href={'https://wa.me/' + produk?.toko.nomor_hp} target='_blank' className='w-full'>
                                    <Button 
                                        variant="solid" 
                                        className='w-full font-bold text-sm bg-gradient-to-r from-success-600 to-emerald-600 hover:from-success-700 hover:to-emerald-700 text-white shadow-md shadow-success-500/20 py-6' 
                                        radius="lg"
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-1" /> Hubungi WA & Beli
                                    </Button>
                                </a>
                                <Button 
                                    variant="bordered" 
                                    color="success"
                                    onPress={handleAddToCart}
                                    isLoading={isAddingToCart}
                                    className='w-full font-bold text-sm border-success-600 text-success-700 hover:bg-success-50 py-6' 
                                    radius="lg"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-1" /> Tambah ke Keranjang
                                </Button>
                            </div>
                            <Button 
                                variant="bordered" 
                                onPress={onOpen} 
                                className='w-full font-bold text-sm border-default-200 text-default-700 hover:bg-default-50 py-6' 
                                color="default"
                                radius="lg"
                            >
                                <MessageSquareText className="w-5 h-5 mr-1 text-success-600" /> Lihat Ulasan Pembeli
                            </Button>
                        </div>
                    </div>

                    {/* Store Panel */}
                    <div className="bg-white border border-default-100 rounded-3xl p-5 shadow-sm flex flex-col gap-3">
                        <h4 className="text-xs font-extrabold text-default-400 uppercase tracking-widest">Penjual</h4>
                        {toko && <TokoCard item={toko}></TokoCard>}
                    </div>
                </div>
            </div>
        </div>
        {produk && (
            <DrawerUlasan isOpen={isOpen} onOpenChange={onOpenChange} produk={produk}></DrawerUlasan>
        )}
    </div>
  )
}

export default ProdukPage