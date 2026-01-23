import Jumbotron from '@/components/Landing/Jumbotron'
import KategoriSection from '@/components/Landing/KategoriSection'
import ProdukSection from '@/components/Landing/ProdukSection'
import TokoSection from '@/components/Landing/TokoSection'
const LandingPage = () => {
  return (
    <>
      <Jumbotron/>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl ">
          <main className='grid col-span-12'>
            <KategoriSection/>
            <ProdukSection/>
            <TokoSection/>
          </main>
      </div>
    </>
  )
}

export default LandingPage