import React from 'react';
import Image from '@/assets/header.png'
import LogoKtg from '@/assets/ktg.png'
import { Link } from 'react-router-dom';
import { Handbag, Handshake } from 'lucide-react';


const Jumbotron = () => {
  return (
        <div 
        className="relative w-full bg-gray-50 overflow-hidden min-h-screen" 
        >
            <div className="absolute inset-0 w-full bg-gradient-to-l from-primary-600 to-transparent opacity-20" />
        
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                
                <div className="w-full flex flex-col-reverse md:flex-row items-center justify-between py-28 md:py-28">
                
                <div className="w-full md:w-1/2 lg:w-5/12 mt-10 md:mt-0 text-center md:text-left z-10">
                    <div className="flex items-center gap-2 bg-primary-50 py-2 px-4 w-fit rounded text-sm font-semibold uppercase text-primary-600 mb-4">
                        <img src={LogoKtg} alt="" width={30} /> <span>Dinas UMKM Kota Kotamobagu</span>
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-wider text-primary-600">
                    Penawaran Eksklusif
                    </span>
                    <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900">
                    Dari Kotamobagu, Untuk Indonesia
                    </h1>
                    <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mx-0">
                    Temukan keunikan dan kualitas produk asli UMKM pilihan Kota Kotamobagu dalam satu genggaman. Dukung karya lokal, majukan ekonomi daerah
                    </p>
                    
                    <div className="mt-8 flex justify-center md:justify-start gap-4">
                        <a 
                            href="#"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-lg transform transition duration-300 ease-in-out hover:scale-105"
                        >
                            <Handbag className='mr-2' />
                            Jelajahi Produk
                        </a>
                        <Link
                            to="/register"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-default-600 hover:bg-default-700 shadow-lg transform transition duration-300 ease-in-out hover:scale-105"
                        >
                            <Handshake className='mr-2' />
                            Gabung UMKM
                        </Link>
                    </div>
                </div>
                
                <div className="w-full md:w-1/2 lg:w-7/12 md:mt-0">
                    <div className="relative overflow-hidden transform transition duration-500 ease-in-out hover:shadow-primary-500/50 hover:scale-[1.02]">
                        <img 
                            className="w-auto h-[500px] float-right" 
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