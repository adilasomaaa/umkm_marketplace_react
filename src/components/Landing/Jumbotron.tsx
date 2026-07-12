
import Image from '@/assets/header.png'
import LogoKtg from '@/assets/ktg.png'
import { Link } from 'react-router-dom';
import { Handbag, Handshake } from 'lucide-react';


const Jumbotron = () => {
    return (
        <div
            className="relative w-full bg-gradient-to-br from-success-50/20 via-background to-primary-50/30 overflow-hidden min-h-[85vh] flex items-center"
        >
            <div className="absolute inset-0 w-full bg-gradient-to-tr from-success-500/5 via-transparent to-primary-500/5 opacity-60 animate-pulse-glow" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full w-full flex items-center">

                <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between py-12 md:py-20">

                    <div className="w-full md:w-1/2 lg:w-5/12 mt-10 md:mt-0 text-center md:text-left z-10">
                        <div className="flex items-center gap-2 bg-success-50 border border-success-100 py-1.5 px-3.5 w-fit rounded-full text-xs sm:text-sm font-semibold uppercase text-success-700 mb-4 mx-auto md:mx-0 animate-fade-in-up">
                            <img src={LogoKtg} alt="Logo Kotamobagu" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" /> <span>Dinas UMKM Kota Kotamobagu</span>
                        </div>
                        <span className="block text-xs sm:text-sm font-bold uppercase tracking-widest text-primary-600 animate-fade-in-up animation-delay-100">
                            Penawaran Eksklusif
                        </span>
                        <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight animate-fade-in-up animation-delay-200">
                            Dari Kotamobagu,<br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-success-600 to-primary-600">Untuk Indonesia</span>
                        </h1>
                        <p className="mt-4 text-sm sm:text-base text-gray-600 sm:max-w-xl sm:mx-auto md:mx-0 leading-relaxed animate-fade-in-up animation-delay-300">
                            Temukan keunikan dan kualitas produk asli UMKM pilihan Kota Kotamobagu dalam satu genggaman. Dukung karya lokal, majukan ekonomi daerah.
                        </p>

                        <div className="mt-8 flex flex-col sm:flex-row justify-center md:justify-start gap-4 animate-fade-in-up animation-delay-500">
                            <a
                                href="#produk-unggulan"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-success-600 to-emerald-600 hover:from-success-700 hover:to-emerald-700 shadow-md hover:shadow-success-500/25 transform transition duration-300 ease-in-out hover:scale-[1.03]"
                            >
                                <Handbag className='mr-2 w-5 h-5' />
                                Jelajahi Produk
                            </a>
                            <Link
                                to="/register"
                                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-default-200 text-base font-semibold rounded-xl text-gray-700 bg-white/80 hover:bg-white hover:border-gray-300 shadow-sm hover:shadow-md transform transition duration-300 ease-in-out hover:scale-[1.03] backdrop-blur-sm"
                            >
                                <Handshake className='mr-2 w-5 h-5 text-success-600' />
                                Gabung UMKM
                            </Link>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 lg:w-6/12 md:mt-0 flex justify-center md:justify-end">
                        <div className="relative overflow-visible animate-fade-in-right">
                            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-success-500 to-primary-500 opacity-15 blur-2xl" />
                            <img
                                className="relative w-auto max-h-[350px] sm:max-h-[400px] md:max-h-[460px] object-contain animate-float"
                                src={Image}
                                alt="Model Mengenakan Produk Terbaik"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Jumbotron;