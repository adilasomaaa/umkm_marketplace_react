import Jumbotron from '@/components/Landing/Jumbotron'
import KategoriSection from '@/components/Landing/KategoriSection'
import ProdukSection from '@/components/Landing/ProdukSection'
import TokoSection from '@/components/Landing/TokoSection'

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden w-full bg-background pb-12">
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-[25vh] left-[-15%] w-[45vw] h-[45vw] bg-success-300/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-[75vh] right-[-15%] w-[40vw] h-[40vw] bg-primary-300/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10vh] left-[5%] w-[35vw] h-[35vw] bg-emerald-300/5 rounded-full blur-[130px] pointer-events-none" />

      {/* Hero Section */}
      <Jumbotron />
      
      {/* Main Sections */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <main className="flex flex-col gap-8 w-full">
            {/* Floating Category Section with spacing below Jumbotron */}
            <div className="mt-8 sm:mt-12 mb-4 relative z-20">
              <KategoriSection />
            </div>
            
            {/* Featured Products */}
            <div className="w-full">
              <ProdukSection />
            </div>

            {/* Stats & Features Banner */}
            <section className="my-8 py-10 px-6 sm:px-12 rounded-3xl bg-gradient-to-r from-success-600 to-emerald-600 text-white relative overflow-hidden shadow-lg shadow-success-900/10 animate-fade-in-up">
              <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none translate-x-20 -translate-y-20" />
              <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-xl pointer-events-none translate-y-20" />

              <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:divide-x sm:divide-white/20 items-center justify-center">
                <div className="flex flex-col gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">100%</span>
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-success-100">Karya Asli Daerah</span>
                </div>
                <div className="flex flex-col gap-2 sm:px-4">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">50+</span>
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-success-100">UMKM Terbina</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight">24/7</span>
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-success-100">Hubungan WhatsApp</span>
                </div>
              </div>
            </section>

            {/* Featured Stores */}
            <div className="w-full">
              <TokoSection />
            </div>
          </main>
      </div>
    </div>
  )
}

export default LandingPage