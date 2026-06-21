import { Image } from '@heroui/react'
import LogoInvert from '@/assets/logo.png'
import LogoDinas from '@/assets/ktg.png'

const Footer = () => {
  return (
    <footer className="bg-default-50 border-t border-default-100 text-default-600 px-4 sm:px-6 lg:px-8 py-12 mt-12 w-full">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* About InBiz */}
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-2">
            <Image src={LogoInvert} alt="Logo" width={180} className="object-contain" />
          </div>
          <p className="text-sm text-default-500 leading-relaxed max-w-sm">
            InBiz adalah platform terintegrasi untuk menampilkan, mempromosikan, dan memasarkan produk-produk unggulan dari Usaha Mikro, Kecil, dan Menengah (UMKM) pilihan di Kota Kotamobagu.
          </p>
        </div>

        {/* Dinas Terkait */}
        <div className="flex flex-col gap-4 text-left">
          <h5 className="text-md font-bold text-default-800 uppercase tracking-wider">Dinas Terkait</h5>
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-default-100 shadow-sm w-fit max-w-full">
            <img src={LogoDinas} className="w-10 h-10 object-contain flex-shrink-0" alt="Logo Dinas" /> 
            <span className="text-xs sm:text-sm font-bold text-default-700 leading-tight">
              Dinas Koperasi dan UMKM<br/>Kota Kotamobagu
            </span>
          </div>
        </div>

        {/* Menu Terkait */}
        <div className="flex flex-col gap-4 text-left">
          <h5 className="text-md font-bold text-default-800 uppercase tracking-wider">Navigasi</h5>
          <ul className="flex flex-col gap-2 text-sm font-medium">
            <li>
              <a href="#" className="hover:text-success-600 transition-colors duration-200">Tentang InBiz</a>
            </li>
            <li>
              <a href="#" className="hover:text-success-600 transition-colors duration-200">Kontak Kami</a>
            </li>
            <li>
              <a href="#produk-unggulan" className="hover:text-success-600 transition-colors duration-200">Produk Pilihan</a>
            </li>
            <li>
              <a href="#toko-unggulan" className="hover:text-success-600 transition-colors duration-200">Toko Mitra</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="max-w-7xl mx-auto border-t border-default-100 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-default-400 font-medium">
        <p>© {new Date().getFullYear()} InBiz Kota Kotamobagu. All Rights Reserved.</p>
        <p className="flex items-center gap-1">
          Dukacipta untuk kemajuan ekonomi daerah.
        </p>
      </div>
    </footer>
  )
}

export default Footer;