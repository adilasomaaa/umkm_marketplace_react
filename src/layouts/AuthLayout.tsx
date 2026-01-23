import { Button, Image } from '@heroui/react'
import React, { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import RegisterImage from '@/assets/register.jpg'
import LoginImage from '@/assets/login.jpg'
import { ArrowLeft } from 'lucide-react'
import Logo from '@/assets/logo-invert.png'

const AuthLayout = () => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  return (
    <div className='flex justify-center items-center bg-background-auth w-full min-h-screen flex-col py-20 px-8'>
      <Image src={Logo} width={100} className='my-4 saturate-50'></Image>
      <div className="bg-white/20 w-full max-w-4xl h-auto p-8 rounded-[20px] shadow-md my-10 backdrop-blur-lg border border-white/30 transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <div className='relative flex flex-col'>
            <Button as={Link} to="/" variant="solid" color="primary" className="mb-4 absolute top-5 left-5" style={{zIndex:'999'}}>
              <ArrowLeft></ArrowLeft> Kembali
            </Button>
            <div className="w-full h-full min-h-[400px]">
              <Image 
                src={isLogin ? LoginImage : RegisterImage} 
                alt="Auth Illustration" 
                className={`object-cover rounded-xl transition-all duration-500 ${isLogin ? 'h-[400px]' : 'h-[500px]'}`}
                width={400}/>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <Outlet/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout