import type { Produk, Ulasan, UlasanCreatePayload } from '@/models'
import { ulasanService } from '@/services/UlasanService'
import { Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Pagination, Textarea } from '@heroui/react'
import { useCallback, useEffect, useState } from 'react'
import UlasanCard from './UlasanCard'
import { Send } from 'lucide-react'
import RatingInput from './RatingInput'

interface DrawerUlasanProps {
    isOpen: boolean
    onOpenChange: () => void,
    produk: Produk
}

const DrawerUlasan = ({ isOpen, onOpenChange, produk }: DrawerUlasanProps) => {
    const [ulasan, setUlasan] = useState<Ulasan[]>([]);
    const [_, setIsLoading] = useState(true);

    const [userName, setUserName] = useState('');
    const [userComment, setUserComment] = useState('');
    const [userRating, setUserRating] = useState(0); 
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paginationInfo, setPaginationInfo] = useState({
            page: 1,
            limit: 10,
            totalData: 0,
            totalPages: 1,
        });

    const handleRatingChange = (newRating: number) => {
        setUserRating(newRating);
    };

    const fetchUlasan = useCallback(async (page: number) => {
        setIsLoading(true);
        try {
            const response = await ulasanService.landing({
                page: page,
                limit: 3,
                produkId: produk.id
            });
            setUlasan(response.data);
            setPaginationInfo(response.meta);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching ulasan:', error);
        } finally {
            setIsLoading(false);
        }
    }, [produk])

    const isFormIncomplete = userRating === 0 || !userName.trim() || !userComment.trim();

    const handleSubmitUlasan = async () => {
        if (userRating === 0 || !userName.trim() || !userComment.trim()) {
            alert('Mohon lengkapi Nama, Rating, dan Komentar Anda.');
            return;
        }
        setIsSubmitting(true);

        const payload = {
            produkId: produk.id,
            nama: userName,
            nilai: userRating,
            komentar: userComment,
        };

        try {
            await ulasanService.create(payload as UlasanCreatePayload);
            
            setUserName('');
            setUserComment('');
            setUserRating(0);
            
            await fetchUlasan(1);
            onOpenChange();
        } catch (error) {
            console.error('Gagal mengirim ulasan:', error);
            alert('Gagal mengirim ulasan. Coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        fetchUlasan(1);
        setIsLoading(false);
    }, [produk, fetchUlasan]);

  return (
    <div>
        <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(_) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">
                <span className='font-normal'>Ulasan terkait</span> 
                <span className='font-semibold'>
                    {produk.nama_produk}
                </span>
                </DrawerHeader>
              <DrawerBody>
                {ulasan && ulasan.length === 0 && (
                    <p className="text-default-400 text-center">Belum ada ulasan</p>
                )}

                {ulasan && ulasan.length > 0 && (
                    <>
                        {ulasan.map((ulasan, index) => (
                            <UlasanCard key={index} ulasan={ulasan} />
                        ))}
                        <div className="flex items-center justify-center">
                            <Pagination onChange={fetchUlasan} showControls initialPage={paginationInfo.page} total={paginationInfo.totalPages} />
                        </div>
                    </>
                )}
              </DrawerBody>
              <DrawerFooter>
                <div className="flex flex-col flex-1 gap-4">
                    <Input
                        isRequired
                        placeholder="Masukkan Nama Anda ..."
                        label="Nama"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        />
                    <div className="bg-gray-100 rounded-xl flex justify-between p-2 items-center">
                        <span className='text-default-500 text-sm'>Pilih Rating :</span>
                        <RatingInput 
                            initialRating={userRating}
                            onRatingChange={handleRatingChange}
                        />
                    </div>
                    <Textarea 
                        label="Komentar" 
                        value={userComment} 
                        onChange={(e) => setUserComment(e.target.value)} 
                        placeholder="Masukkan Komentar anda ..." />

                    <Button color="primary" 
                            onPress={handleSubmitUlasan} // Panggil handler submit
                            isDisabled={isFormIncomplete || isSubmitting}
                            isLoading={isSubmitting}>
                        <Send /> Kirim
                    </Button>
                </div>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}

export default DrawerUlasan