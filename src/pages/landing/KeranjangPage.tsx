import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { keranjangService } from '@/services/KeranjangService';
import { currency_format } from '@/lib/number_format';
import { Card, CardBody, Button, Checkbox, Divider } from '@heroui/react';
import { Trash2, ShoppingBag, Store, AlertCircle, Plus, Minus, ArrowRight } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { env } from '@/lib/env';

interface CartItem {
    id: number;
    ipAdress: string;
    tokenSession: string;
    sessionExpired: string;
    tokoId: number;
    produkId: number;
    totalHarga: number;
    quantiti: number;
    produk: {
        nama_produk: string;
        harga: number;
        thumbnail: string | null;
        slug: string;
    };
    toko: {
        nama_toko: string;
        slug: string;
        nomor_hp: string;
    };
}

const KeranjangPage = () => {
    const navigate = useNavigate();
    const { removeFromCart, updateCartQty } = useCart();
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<Record<number, boolean>>({});

    const fetchCartItems = async () => {
        setIsLoading(true);
        try {
            const data = await keranjangService.index();
            setItems(data);
        } catch (error) {
            console.error('Error fetching cart items:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const handleQtyChange = async (id: number, currentQty: number, change: number) => {
        const newQty = currentQty + change;
        if (newQty < 1) return;
        try {
            await updateCartQty(id, newQty);
            // Update local state to reflect change immediately
            setItems((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, quantiti: newQty, totalHarga: newQty * item.produk.harga }
                        : item
                )
            );
        } catch (error) {
            console.error('Error updating quantity:', error);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await removeFromCart(id);
            setItems((prev) => prev.filter((item) => item.id !== id));
            // Remove from selected items if selected
            setSelectedItems((prev) => {
                const next = { ...prev };
                delete next[id];
                return next;
            });
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    // Group items by tokoId
    const groupedItems = items.reduce((groups: Record<number, { toko: CartItem['toko']; items: CartItem[] }>, item) => {
        if (!groups[item.tokoId]) {
            groups[item.tokoId] = {
                toko: item.toko,
                items: [],
            };
        }
        groups[item.tokoId].items.push(item);
        return groups;
    }, {});

    // Determine active Toko ID based on selected items
    const activeTokoId = Object.keys(selectedItems)
        .map((id) => items.find((item) => item.id === parseInt(id, 10)))
        .filter((item): item is CartItem => !!item && selectedItems[item.id])
        .map((item) => item.tokoId)[0]; // Get the first active tokoId

    const handleCheckboxChange = (id: number, checked: boolean) => {
        setSelectedItems((prev) => ({
            ...prev,
            [id]: checked,
        }));
    };

    // Calculate totals
    const selectedCartItems = items.filter((item) => selectedItems[item.id]);
    const totalItemsCount = selectedCartItems.reduce((sum, item) => sum + item.quantiti, 0);
    const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.totalHarga, 0);

    const handleCheckoutTrigger = () => {
        if (selectedCartItems.length === 0) return;
        navigate('/checkout', { state: { selectedItems: selectedCartItems } });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[500px]">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full border-4 border-success-600 border-t-transparent animate-spin"></div>
                    <p className="text-default-500 font-medium">Memuat keranjang Anda...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="mx-auto px-4 max-w-7xl py-16 text-center">
                <div className="bg-white border border-default-100 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
                    <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-8 h-8 text-success-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Keranjang Belanja Kosong</h2>
                    <p className="text-default-500 text-sm mb-6">
                        Anda belum menambahkan produk apa pun ke dalam keranjang. Mulai jelajahi produk lokal terbaik kami!
                    </p>
                    <Button
                        color="success"
                        className="font-bold text-white shadow-md shadow-success-500/20"
                        radius="lg"
                        onPress={() => navigate('/')}
                    >
                        Mulai Belanja
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8 animate-fade-in-up">
            <div className="flex flex-col gap-6 text-left">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    Keranjang Belanja
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Grouped Items */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        {Object.entries(groupedItems).map(([tokoIdStr, group]) => {
                            const tokoId = parseInt(tokoIdStr, 10);
                            const isDisabledGroup = activeTokoId !== undefined && activeTokoId !== tokoId;

                            return (
                                <div key={tokoId} className={`flex flex-col gap-3 transition-all duration-300 ${isDisabledGroup ? 'opacity-50' : ''}`}>
                                    {/* Store Header */}
                                    <div className="flex items-center gap-2 px-2 py-1 font-bold text-gray-800 border-b border-default-100">
                                        <Store className="w-5 h-5 text-success-600" />
                                        <Link to={'/' + group.toko.slug} className='cursor-pointer hover:text-green-600'>{group.toko.nama_toko}</Link>
                                        {isDisabledGroup && (
                                            <span className="text-xs font-normal text-danger-500 flex items-center gap-1 ml-auto">
                                                <AlertCircle className="w-3.5 h-3.5" /> Hanya bisa checkout dari 1 toko
                                            </span>
                                        )}
                                    </div>

                                    {/* Store Items List */}
                                    <div className="flex flex-col gap-4">
                                        {group.items.map((item) => {
                                            const isDisabledCheckbox = activeTokoId !== undefined && activeTokoId !== item.tokoId && !selectedItems[item.id];

                                            return (
                                                <Card key={item.id} className="border border-default-100 shadow-sm overflow-hidden" radius="lg">
                                                    <CardBody className="p-4 flex flex-row items-center gap-4">
                                                        {/* Checkbox */}
                                                        <Checkbox
                                                            isSelected={!!selectedItems[item.id]}
                                                            isDisabled={isDisabledCheckbox}
                                                            onValueChange={(checked) => handleCheckboxChange(item.id, checked)}
                                                            color="success"
                                                        />

                                                        {/* Product Image */}
                                                        <div className="w-20 h-20 bg-default-50 rounded-xl overflow-hidden flex-shrink-0 border border-default-100 flex items-center justify-center">
                                                            <SafeImage
                                                                alt={item.produk.nama_produk}
                                                                className="w-full h-full object-cover"
                                                                src={item.produk.thumbnail ? env.baseUrl + item.produk.thumbnail : undefined}
                                                                fallbackType="produk"
                                                            />
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="flex-grow min-w-0">
                                                            <Link to={'/' + item.toko.slug + '/' + item.produk.slug} className='cursor-pointer '>
                                                                <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate hover:text-green-600">
                                                                    {item.produk.nama_produk}
                                                                </h3>
                                                            </Link>
                                                            <p className="text-success-600 font-extrabold text-sm mt-1">
                                                                {currency_format(item.produk.harga)}
                                                            </p>
                                                        </div>

                                                        {/* Action Controls */}
                                                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                                                            {/* Quantity Counter */}
                                                            <div className="flex items-center border border-default-200 rounded-full p-1 bg-default-50">
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    className="h-8 w-8 min-w-8 rounded-full"
                                                                    onPress={() => handleQtyChange(item.id, item.quantiti, -1)}
                                                                    isDisabled={item.quantiti <= 1}
                                                                >
                                                                    <Minus className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <span className="w-8 text-center text-xs font-bold text-gray-700">
                                                                    {item.quantiti}
                                                                </span>
                                                                <Button
                                                                    isIconOnly
                                                                    size="sm"
                                                                    variant="light"
                                                                    className="h-8 w-8 min-w-8 rounded-full"
                                                                    onPress={() => handleQtyChange(item.id, item.quantiti, 1)}
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </div>

                                                            {/* Delete Button */}
                                                            <Button
                                                                isIconOnly
                                                                color="danger"
                                                                variant="light"
                                                                className="rounded-full hover:bg-danger-50 text-danger-500"
                                                                onPress={() => handleDelete(item.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right Column: Checkout Summary */}
                    <div className="lg:col-span-4 sticky top-6">
                        <Card className="border border-default-100 shadow-sm p-6" radius="lg">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Belanja</h2>

                            <div className="flex justify-between items-center text-sm text-default-500 mb-2">
                                <span>Total Barang ({totalItemsCount})</span>
                                <span>{currency_format(totalPrice)}</span>
                            </div>

                            <Divider className="my-4" />

                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold text-gray-800">Total Harga</span>
                                <span className="font-extrabold text-xl text-success-600">
                                    {currency_format(totalPrice)}
                                </span>
                            </div>

                            <Button
                                color="success"
                                className="w-full font-bold text-white shadow-md shadow-success-500/20 py-6"
                                radius="lg"
                                endContent={<ArrowRight className="w-4 h-4" />}
                                isDisabled={selectedCartItems.length === 0}
                                onPress={handleCheckoutTrigger}
                            >
                                Lanjut ke Checkout
                            </Button>

                            {selectedCartItems.length === 0 && (
                                <p className="text-xs text-default-400 text-center mt-3 flex items-center justify-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" /> Pilih produk terlebih dahulu
                                </p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeranjangPage;