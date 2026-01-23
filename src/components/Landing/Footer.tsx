import { Image } from '@heroui/react'
import React from 'react'
import LogoInvert from '@/assets/logo.png'
import LogoDinas from '@/assets/ktg.png'

const Footer = () => {

  return (
    <footer className="bg-gray-100  px-28 p-8">
      <div className="container mx-auto grid grid-cols-3 gap-4">
        <div className="col-span-1">
          <div className=" rounded-lg p-4">
            <div className="flex justify-around items-center gap-4">
              <Image src={LogoInvert} alt="Logo" width={300}></Image>
              <p>
                InBiz adalah platform untuk menampilkan dan memasarkan produk-produk dari Usaha Mikro, Kecil, dan Menengah yang ada di Kota Kotamobagu.
              </p>
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <h5 className="text-xl font-bold mb-2">Dinas Terkait</h5>
          <ul className="list-none">
            <li className="mb-2 flex items-center my-4">
              <img src={LogoDinas} width={40} alt="" /> <span className='ml-2'>Dinas Koperasi dan UMKM Kota Kotamobagu</span>
            </li>
          </ul>
        </div>
        <div className="col-span-1">
          <h5 className="text-xl font-bold mb-2">Menu Terkait</h5>
          <ul className="list-none">
            <li className="mb-2">
              <a href="#" className="text-gray-500 hover:text-primary-600">Tentang InBiz</a>
            </li>
            <li className="mb-2">
              <a href="#" className="text-gray-500 hover:text-primary-600">Kontak</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto text-center text-gray-500 mt-4">
        Copyright 2025 - All Right Reserved
      </div>
    </footer>
  )
}

export default Footer