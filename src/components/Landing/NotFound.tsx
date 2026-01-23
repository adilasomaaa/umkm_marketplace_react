import { Button } from '@heroui/button'
import { Home } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-2">
        <Home size={40} className="" />
        <h1 className="text-3xl font-bold ">Halaman tidak ditemukan</h1>
      </div>
      <Link to="/">
        <Button className="mt-8" variant="solid" color="primary">
          Kembali ke Beranda
        </Button>
      </Link>
    </div>
  )
}

export default NotFound