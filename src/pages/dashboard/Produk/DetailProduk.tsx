import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardBreadcrumbs from '@/components/Dashboard/Breadcrumbs';
import { env } from '@/lib/env';
import { currency_format } from '@/lib/number_format';
import type { Produk, Ulasan } from '@/models';
import { produkService } from '@/services/ProdukService';
import { ulasanService } from '@/services/UlasanService';
import { 
  Button, 
  Chip, 
  Divider, 
  Pagination, 
  Textarea, 
  Select, 
  SelectItem, 
  Spinner, 
  Avatar, 
  ButtonGroup, 
  useDisclosure 
} from '@heroui/react';
import { 
  ChevronLeft, 
  Eye, 
  Star, 
  MessageSquare, 
  Check, 
  X, 
  Trash, 
  CornerDownRight, 
  Reply 
} from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import ConfirmationModal from '@/components/Dashboard/ConfirmationModal';

const DetailProduk = () => {
    const { id } = useParams();

    const [produk, setProduk] = useState<Produk | null>(null);
    const [ulasan, setUlasan] = useState<Ulasan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUlasanLoading, setIsUlasanLoading] = useState(false);
    
    // Filters and Pagination
    const [statusFilter, setStatusFilter] = useState<string>('semua');
    const [ratingFilter, setRatingFilter] = useState<string>('semua');
    const [currentPage, setCurrentPage] = useState<number>(1);
    
    const [paginationInfo, setPaginationInfo] = useState({
        page: 1,
        limit: 10,
        totalData: 0,
        totalPages: 1,
    });

    // Replying State
    const [replyingToId, setReplyingToId] = useState<number | null>(null);
    const [replyText, setReplyText] = useState<string>('');
    const [isSubmittingReply, setIsSubmittingReply] = useState<boolean>(false);

    // Confirmation Modal State
    const { isOpen: isConfirmOpen, onOpen: onConfirmOpen, onClose: onConfirmClose } = useDisclosure();
    const [confirmConfig, setConfirmConfig] = useState<{
        actionType: 'terima' | 'tolak' | 'hapus';
        ulasanId: number;
        reviewerName: string;
    } | null>(null);

    const fetchProduk = useCallback(async (productId: number) => {
        setIsLoading(true);
        try {
            const response = await produkService.show(productId);
            setProduk(response.data);
        } catch (error) {
            console.error("Gagal mengambil data produk:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUlasan = useCallback(async (productId: number, page: number, status: string, rating: string) => {
        setIsUlasanLoading(true);
        try {
            const params: any = {
                limit: 10,
                page: page,
                produkId: productId
            };
            if (status !== 'semua') {
                params.status = status;
            }
            if (rating !== 'semua') {
                params.nilai = Number(rating);
            }
            const response = await ulasanService.index(params);
            setUlasan(response.data);
            setPaginationInfo(response.meta);
        } catch (error) {
            console.error("Gagal mengambil data ulasan:", error);
        } finally {
            setIsUlasanLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            fetchProduk(Number(id));
        }
    }, [fetchProduk, id]);

    useEffect(() => {
        if (id) {
            fetchUlasan(Number(id), currentPage, statusFilter, ratingFilter);
        }
    }, [id, currentPage, statusFilter, ratingFilter, fetchUlasan]);

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        setCurrentPage(1);
    };

    const handleRatingFilterChange = (val: string) => {
        setRatingFilter(val);
        setCurrentPage(1);
    };

    // Reply handlers
    const handleOpenReply = (ulasanId: number, currentReply?: string) => {
        setReplyingToId(ulasanId);
        setReplyText(currentReply || '');
    };

    const handleCancelReply = () => {
        setReplyingToId(null);
        setReplyText('');
    };

    const handleSubmitReply = async (ulasanId: number) => {
        if (!replyText.trim()) return;
        setIsSubmittingReply(true);
        try {
            await ulasanService.update(ulasanId, {
                balasan: replyText.trim()
            });
            setReplyingToId(null);
            setReplyText('');
            if (id) {
                fetchUlasan(Number(id), currentPage, statusFilter, ratingFilter);
            }
        } catch (error) {
            console.error("Gagal mengirim balasan:", error);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    // Moderation handlers
    const openConfirmation = (actionType: 'terima' | 'tolak' | 'hapus', ulasanId: number, reviewerName: string) => {
        setConfirmConfig({ actionType, ulasanId, reviewerName });
        onConfirmOpen();
    };

    const getApiAction = () => {
        if (!confirmConfig) return () => Promise.resolve();
        const { actionType, ulasanId } = confirmConfig;
        if (actionType === 'terima') {
            return () => ulasanService.update(ulasanId, { status: 'terima' });
        } else if (actionType === 'tolak') {
            return () => ulasanService.update(ulasanId, { status: 'tolak' });
        } else {
            return () => ulasanService.delete(ulasanId);
        }
    };

    const handleConfirmSuccess = () => {
        onConfirmClose();
        if (id) {
            fetchUlasan(Number(id), currentPage, statusFilter, ratingFilter);
            fetchProduk(Number(id));
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner color="success" size="lg" label="Memuat produk..." />
            </div>
        );
    }

    return (
        <div>
            <div className="flex-col flex gap-4 my-4">
                <Button color="default" className='w-fit font-bold' variant="ghost" onPress={() => window.history.back()}>
                    <ChevronLeft className="w-4 h-4" /> Kembali
                </Button>
                <DashboardBreadcrumbs />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                {/* Column Kiri (1/3 width): Product Info & Thumbnail */}
                <div className="md:col-span-1 flex flex-col gap-6">
                    <div className="bg-white rounded-3xl p-5 border border-default-100 shadow-sm flex flex-col gap-4 text-left">
                        <div className="overflow-hidden rounded-2xl border border-default-100 bg-default-50 flex items-center justify-center p-2 relative">
                            <SafeImage 
                                isZoomed 
                                src={produk?.thumbnail ? env.baseUrl + produk.thumbnail : undefined} 
                                fallbackType="produk"
                                className="w-full object-cover max-h-[300px] rounded-xl"
                            />
                        </div>
                        <a href={`/${produk?.toko.slug}/${produk?.slug}`} target='_blank' rel="noopener noreferrer" className="w-full">
                            <Button color="success" className='w-full font-bold text-white bg-gradient-to-r from-success-600 to-emerald-600 shadow-sm' variant="solid">
                                <Eye className="w-4 h-4" /> Lihat Produk di Landing
                            </Button>
                        </a>
                        
                        <Divider className="my-1"/>
                        
                        <div className="flex flex-col gap-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 font-medium">Kategori</span> 
                                <Chip color="success" variant="flat" size="sm" className="font-bold">
                                    {produk?.kategori?.nama_kategori}
                                </Chip>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-default-500 font-medium">Visibilitas</span> 
                                <Chip color={produk?.status === 'tampilkan' ? 'primary' : 'warning'} variant="flat" size="sm" className="font-bold">
                                    {produk?.status}
                                </Chip>
                            </div>
                            <div className="flex flex-col gap-1.5 mt-1">
                                <span className="text-default-500 font-medium">Tersedia di Cabang:</span>
                                <div className="flex flex-wrap gap-1">
                                    {produk?.produkCabangs?.map((pc, index) => (
                                        <Chip key={index} variant="flat" color={pc.status === 'tersedia' ? 'success' : 'danger'} size="sm" className="font-semibold text-[10px]">
                                            {pc.cabang?.nama_cabang || "Cabang"}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column Kanan (2/3 width): Product Details & Interactive Moderation Reviews */}
                <div className="md:col-span-2 flex flex-col gap-6">
                    {/* Product Detail Card */}
                    <div className="bg-white rounded-3xl p-6 border border-default-100 shadow-sm text-left flex flex-col gap-4">
                        <div>
                            <span className="text-[10px] text-success-600 font-extrabold uppercase tracking-widest">Detail Produk</span>
                            <h1 className='text-2xl font-black text-gray-900 mt-1'>{produk?.nama_produk}</h1>
                        </div>
                        <p className='text-3xl font-black text-success-600'>{currency_format(produk?.harga as number)}</p>
                        <Divider />
                        <div className="flex flex-col gap-2">
                            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Deskripsi</h4>
                            <p className='text-sm leading-relaxed text-gray-600 text-justify whitespace-pre-line'>{produk?.deskripsi}</p>
                        </div>
                    </div>

                    {/* Interactive Reviews Card */}
                    <div className="bg-white rounded-3xl p-6 border border-default-100 shadow-sm text-left flex flex-col gap-6">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-success-50 rounded-xl text-success-600">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className='text-lg font-extrabold text-gray-900'>Moderasi Ulasan</h2>
                                    <p className="text-xs text-default-400 font-medium">Total: {paginationInfo.totalData} ulasan</p>
                                </div>
                            </div>

                            {/* Interactive Dropdown Filters */}
                            <div className="flex flex-row gap-3 w-full lg:w-auto">
                                <Select 
                                    label="Status" 
                                    size="sm" 
                                    variant="bordered"
                                    className="w-1/2 lg:w-[150px]"
                                    selectedKeys={statusFilter ? [statusFilter] : []}
                                    onChange={(e) => handleStatusFilterChange(e.target.value)}
                                    classNames={{
                                        trigger: "border-default-200"
                                    }}
                                >
                                    <SelectItem key="semua">Semua Status</SelectItem>
                                    <SelectItem key="menunggu">Menunggu</SelectItem>
                                    <SelectItem key="terima">Diterima</SelectItem>
                                    <SelectItem key="tolak">Ditolak</SelectItem>
                                </Select>

                                <Select 
                                    label="Rating" 
                                    size="sm" 
                                    variant="bordered"
                                    className="w-1/2 lg:w-[130px]"
                                    selectedKeys={ratingFilter ? [ratingFilter] : []}
                                    onChange={(e) => handleRatingFilterChange(e.target.value)}
                                    classNames={{
                                        trigger: "border-default-200"
                                    }}
                                >
                                    <SelectItem key="semua">Semua Rating</SelectItem>
                                    <SelectItem key="5">5 Bintang</SelectItem>
                                    <SelectItem key="4">4 Bintang</SelectItem>
                                    <SelectItem key="3">3 Bintang</SelectItem>
                                    <SelectItem key="2">2 Bintang</SelectItem>
                                    <SelectItem key="1">1 Bintang</SelectItem>
                                </Select>
                            </div>
                        </div>

                        <Divider />

                        {/* Ulasan List */}
                        {isUlasanLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <Spinner color="success" size="lg" label="Memuat ulasan..." />
                            </div>
                        ) : ulasan.length === 0 ? (
                            <div className="text-center py-12 flex flex-col items-center gap-2">
                                <div className="w-12 h-12 rounded-full bg-default-50 flex items-center justify-center text-default-400">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-gray-700 text-sm">Tidak Ada Ulasan</h3>
                                <p className="text-xs text-default-400">Belum ada ulasan yang sesuai dengan kriteria filter Anda.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {ulasan.map((item) => {
                                    const isReplying = replyingToId === item.id;
                                    let chipColor: 'warning' | 'success' | 'danger' = 'warning';
                                    if (item.status === 'terima') chipColor = 'success';
                                    if (item.status === 'tolak') chipColor = 'danger';

                                    return (
                                        <div 
                                            key={item.id} 
                                            className="bg-white border border-default-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3 hover:shadow-md hover:border-default-200 transition-all duration-300"
                                        >
                                            {/* Ulasan Header */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
                                                <div className="flex items-center gap-3">
                                                    <Avatar radius="full" size="md" className="bg-success-100 text-success-700 font-bold shrink-0" name={item.nama.slice(0,2).toUpperCase()} />
                                                    <div className="flex flex-col text-left">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <span className="font-extrabold text-sm text-gray-800">{item.nama}</span>
                                                            <span className="text-[10px] bg-warning-50 text-warning-600 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 border border-warning-100 select-none">
                                                                <Star className="w-2.5 h-2.5 fill-warning-500 stroke-warning-500" />
                                                                {item.nilai}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] text-default-400 font-medium">
                                                            {item.createdAt && new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Moderation Actions */}
                                                <div className="flex items-center gap-2 self-end sm:self-center">
                                                    <Chip 
                                                        color={chipColor} 
                                                        variant="flat" 
                                                        size="sm" 
                                                        className="font-bold text-[10px] px-2 capitalize"
                                                    >
                                                        {item.status}
                                                    </Chip>
                                                    
                                                    <ButtonGroup size="sm" variant="flat" radius="full" className="ml-1 border border-default-100 p-0.5 bg-default-50 shadow-inner">
                                                        {item.status === 'menunggu' && (
                                                            <>
                                                                <Button isIconOnly color="success" size="sm" className="rounded-full text-success-600" onPress={() => openConfirmation('terima', item.id, item.nama)}>
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                <Button isIconOnly color="danger" size="sm" className="rounded-full text-danger-600" onPress={() => openConfirmation('tolak', item.id, item.nama)}>
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button isIconOnly color="danger" variant="light" size="sm" className="rounded-full text-danger-500" onPress={() => openConfirmation('hapus', item.id, item.nama)}>
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </ButtonGroup>
                                                </div>
                                            </div>

                                            {/* Ulasan Comment */}
                                            <div className="pl-0 sm:pl-12 text-sm text-gray-700 leading-relaxed text-left">
                                                {item.komentar || <span className="text-default-400 italic">Tidak ada komentar tertulis.</span>}
                                            </div>

                                            {/* Reply Box Section */}
                                            {item.status === 'terima' && (
                                                <div className="pl-0 sm:pl-12 flex flex-col gap-2 w-full">
                                                    {/* Existing Reply */}
                                                    {item.balasan && !isReplying && (
                                                        <div className="bg-default-50/80 rounded-xl p-3 border-l-4 border-success-500 flex flex-col gap-2 relative">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1.5 text-xs font-bold text-success-600">
                                                                    <CornerDownRight className="w-3.5 h-3.5" />
                                                                    Balasan Toko
                                                                </div>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="light" 
                                                                    color="success" 
                                                                    className="h-6 min-w-0 px-2 font-bold text-[10px]"
                                                                    onPress={() => handleOpenReply(item.id, item.balasan)}
                                                                >
                                                                    Ubah Balasan
                                                                </Button>
                                                            </div>
                                                            <p className="text-xs text-gray-600 text-justify leading-relaxed">{item.balasan}</p>
                                                        </div>
                                                    )}

                                                    {/* No Reply Yet */}
                                                    {!item.balasan && !isReplying && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="light" 
                                                            color="success" 
                                                            className="w-fit h-7 font-bold text-xs bg-success-50 hover:bg-success-100 px-3 rounded-lg flex items-center gap-1.5 transition-all self-start"
                                                            onPress={() => handleOpenReply(item.id, '')}
                                                        >
                                                            <Reply className="w-3.5 h-3.5" /> Balas Ulasan
                                                        </Button>
                                                    )}

                                                    {/* Reply Editor Form */}
                                                    {isReplying && (
                                                        <div className="flex flex-col gap-2.5 p-3 bg-success-50/20 rounded-xl border border-success-100">
                                                            <span className="text-[10px] text-success-600 font-extrabold uppercase tracking-wider flex items-center gap-1">
                                                                <Reply className="w-3 h-3" /> 
                                                                {item.balasan ? 'Ubah Balasan Toko' : 'Tulis Balasan Toko'}
                                                            </span>
                                                            <Textarea
                                                                placeholder="Tulis tanggapan atau ucapan terima kasih kepada pelanggan..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                size="sm"
                                                                variant="bordered"
                                                                color="success"
                                                                minRows={2}
                                                                className="w-full text-xs"
                                                                classNames={{
                                                                    input: "text-xs text-gray-700",
                                                                    inputWrapper: "bg-white border-default-200"
                                                                }}
                                                            />
                                                            <div className="flex items-center gap-2 justify-end">
                                                                <Button size="sm" variant="light" className="font-semibold text-xs h-8" onPress={handleCancelReply} disabled={isSubmittingReply}>
                                                                    Batal
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    color="success" 
                                                                    className="font-bold text-xs h-8 text-white bg-gradient-to-r from-success-600 to-emerald-600 shadow-sm" 
                                                                    onPress={() => handleSubmitReply(item.id)} 
                                                                    isLoading={isSubmittingReply}
                                                                    disabled={!replyText.trim() || isSubmittingReply}
                                                                >
                                                                    Kirim Balasan
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {/* Pagination Controls */}
                                {paginationInfo.totalPages > 1 && (
                                    <div className="flex items-center justify-center mt-4">
                                        <Pagination 
                                            onChange={(page) => setCurrentPage(page)} 
                                            showControls 
                                            color="success"
                                            page={currentPage} 
                                            total={paginationInfo.totalPages} 
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Moderation Modal */}
            {confirmConfig && (
                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={onConfirmClose}
                    action={getApiAction()}
                    payload={{ id: confirmConfig.ulasanId }}
                    title={confirmConfig.actionType === 'terima' ? 'Terima Ulasan' : confirmConfig.actionType === 'tolak' ? 'Tolak Ulasan' : 'Hapus Ulasan'}
                    description={
                        confirmConfig.actionType === 'terima' 
                            ? `Apakah Anda yakin ingin menerima dan mempublikasikan ulasan dari ${confirmConfig.reviewerName}?` 
                            : confirmConfig.actionType === 'tolak' 
                            ? `Apakah Anda yakin ingin menolak ulasan dari ${confirmConfig.reviewerName}? Ulasan tidak akan dipublikasikan.` 
                            : `Apakah Anda yakin ingin menghapus permanen ulasan dari ${confirmConfig.reviewerName}?`
                    }
                    confirmText={confirmConfig.actionType === 'terima' ? 'Terima' : confirmConfig.actionType === 'tolak' ? 'Tolak' : 'Hapus'}
                    confirmColor={confirmConfig.actionType === 'terima' ? 'success' : 'danger'}
                    icon={confirmConfig.actionType === 'terima' ? <Check className="h-6 w-6" /> : confirmConfig.actionType === 'tolak' ? <X className="h-6 w-6" /> : <Trash className="h-6 w-6" />}
                    onSuccess={handleConfirmSuccess}
                />
            )}
        </div>
    );
};

export default DetailProduk;