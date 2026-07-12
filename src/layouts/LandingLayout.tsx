

import { Outlet } from 'react-router-dom'
import NavbarComponent from '@/components/Landing/Navbar'
import Footer from '@/components/Landing/Footer'
import { CartProvider } from '@/context/CartContext'

const LandingLayout = () => {
    
  return (
    <CartProvider>
      <div className="min-h-screen bg-background text-foreground">
          <NavbarComponent />
          <Outlet/>
          <Footer></Footer>
      </div>
    </CartProvider>
  )
}

export default LandingLayout