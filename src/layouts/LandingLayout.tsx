import React from 'react'
import LeftNav from '../components/Landing/LeftNav'
import { Outlet } from 'react-router-dom'
import NavbarComponent from '@/components/Landing/Navbar'
import Footer from '@/components/Landing/Footer'

const LandingLayout = () => {
    
  return (
    <div className="min-h-screen bg-background text-foreground">
        <NavbarComponent />
        <Outlet/>
        <Footer></Footer>
    </div>
  )
}

export default LandingLayout