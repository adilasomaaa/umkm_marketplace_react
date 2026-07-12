import { useLocation, useNavigate } from 'react-router-dom';
import { currency_format } from '@/lib/number_format';
import { Card, CardBody, Button, Divider } from '@heroui/react';
import { Store, MessageCircle, ArrowLeft, ClipboardList } from 'lucide-react';
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

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedItems } = (location.state as { selectedItems: CartItem[] }) || { selectedItems: [] };

  if (selectedItems.length === 0) {
    return (
      <div className="mx-auto px-4 max-w-7xl py-16 text-center">
        <div className="bg-white border border-default-100 rounded-3xl p-8 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 bg-danger-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-danger-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Produk untuk Dicheckout</h2>
          <p className="text-default-500 text-sm mb-6">
            Silakan pilih produk dari keranjang belanja Anda terlebih dahulu untuk diproses.
          </p>
          <Button
            color="success"
            className="font-bold text-white shadow-md shadow-success-500/20"
            radius="lg"
            onPress={() => navigate('/keranjang')}
          >
            Kembali ke Keranjang
          </Button>
        </div>
      </div>
    );
  }

  const toko = selectedItems[0].toko;
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.totalHarga, 0);
  const totalQty = selectedItems.reduce((sum, item) => sum + item.quantiti, 0);

  const formatPhoneNumber = (num: string) => {
    let cleaned = num.replace(/\D/g, ''); // Remove all non-digits
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.slice(1);
    }
    return cleaned;
  };

  const handleWhatsAppCheckout = () => {
    if (!toko.nomor_hp) {
      alert('Toko ini belum menambahkan nomor HP.');
      return;
    }

    const phone = formatPhoneNumber(toko.nomor_hp);
    
    // Format message
    let message = `Halo *${toko.nama_toko}*,\nSaya ingin memesan produk berikut melalui InBiz:\n\n*Daftar Pesanan:*\n`;
    selectedItems.forEach((item, index) => {
      message += `${index + 1}. *${item.produk.nama_produk}* (x${item.quantiti}) - ${currency_format(item.totalHarga)}\n`;
    });
    message += `\n*Total Item:* ${totalQty}\n`;
    message += `*Total Pembayaran:* *${currency_format(totalPrice)}*\n\nMohon segera diproses. Terima kasih!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8 animate-fade-in-up">
      <div className="flex flex-col gap-6 text-left">
        {/* Back navigation */}
        <div>
          <Button
            variant="light"
            size="sm"
            className="text-default-500 font-bold hover:text-success-600 gap-1 pl-0"
            onPress={() => navigate('/keranjang')}
            startContent={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali ke Keranjang
          </Button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Checkout Pesanan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Details */}
          <div className="md:col-span-8 flex flex-col gap-6">
            {/* Store Information */}
            <Card className="border border-default-100 shadow-sm" radius="lg">
              <CardBody className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2 font-bold text-gray-800 border-b border-default-100 pb-2">
                  <Store className="w-5 h-5 text-success-600" />
                  <span>Dipesan Dari: {toko.nama_toko}</span>
                </div>

                <div className="flex flex-col gap-4">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="w-16 h-16 bg-default-50 rounded-xl overflow-hidden flex-shrink-0 border border-default-100 flex items-center justify-center">
                        <SafeImage
                          alt={item.produk.nama_produk}
                          className="w-full h-full object-cover"
                          src={item.produk.thumbnail ? env.baseUrl + item.produk.thumbnail : undefined}
                          fallbackType="produk"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm truncate">
                          {item.produk.nama_produk}
                        </h4>
                        <p className="text-xs text-default-500 mt-0.5">
                          {item.quantiti}x {currency_format(item.produk.harga)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-gray-800">
                          {currency_format(item.totalHarga)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column: Checkout CTA */}
          <div className="md:col-span-4">
            <Card className="border border-default-100 shadow-sm p-6 bg-gradient-to-br from-white to-default-50" radius="lg">
              <h3 className="text-base font-bold text-gray-800 mb-4">Rincian Pembayaran</h3>

              <div className="flex flex-col gap-2 text-sm text-default-600 mb-4">
                <div className="flex justify-between">
                  <span>Total Produk</span>
                  <span>{totalQty} Item</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{currency_format(totalPrice)}</span>
                </div>
              </div>

              <Divider className="my-3" />

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-gray-800">Total Harga</span>
                <span className="font-extrabold text-lg text-success-600">
                  {currency_format(totalPrice)}
                </span>
              </div>

              <Button
                color="success"
                className="w-full font-bold text-white bg-gradient-to-r from-success-500 to-emerald-600 hover:from-success-600 hover:to-emerald-700 shadow-md shadow-success-500/20 py-6"
                radius="lg"
                endContent={<MessageCircle className="w-5 h-5" />}
                onPress={handleWhatsAppCheckout}
              >
                Kirim via WhatsApp
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
