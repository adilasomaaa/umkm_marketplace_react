import React from 'react'
import LeftNav from '../components/Landing/LeftNav'
import { Outlet } from 'react-router-dom'
import NavbarComponent from '@/components/Landing/Navbar'
import Jumbotron from '@/components/Landing/Jumbotron'

const LandingLayout = () => {
    
  return (
    <div className="min-h-screen bg-background text-foreground">
        <NavbarComponent />
        <Jumbotron/>
        <div className="mx-auto max-w-[1200px] px-4 lg:px-6 lg:pl-28">
            <div className="grid grid-cols-12 gap-8">
                <Outlet/>

            </div>
        </div>
    </div>
  )
}

export default LandingLayout