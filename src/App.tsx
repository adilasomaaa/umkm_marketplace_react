import { Route, Routes } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout';
import LandingPage from './pages/landing/LandingPage';
import NotFound from './pages/NotFound';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/dashboard/DashboardPage';
import DashboardLayout from './layouts/DashboardLayout';
import VerifyPage from './pages/auth/VerifyPage';
import ManageUser from './pages/dashboard/ManageUser';
import ManageRole from './pages/dashboard/ManageRole';
import ManagePermissions from './pages/dashboard/ManagePermissions';
import ManagePendaftar from './pages/dashboard/ManagePendaftar';
import ManageToko from './pages/dashboard/Toko/ManageToko';
import ManagePemilikToko from './pages/dashboard/ManagePemilikToko';
import ManageKategori from './pages/dashboard/ManageKategori';
import ManageTokoClient from './pages/dashboard/Toko/ManageTokoClient';
import ManageCabang from './pages/dashboard/ManageCabang';
import ManageFaq from './pages/dashboard/ManageFaq';
import ManageSosialMedia from './pages/dashboard/ManageSosialMedia';
import ManageProduk from './pages/dashboard/Produk/ManageProduk';
import TokoPage from './pages/landing/TokoPage';
import ProdukPage from './pages/landing/ProdukPage';
import DetailProduk from './pages/dashboard/Produk/DetailProduk';
import CreateProduk from './pages/dashboard/Produk/CreateProduk';
import EditProduk from './pages/dashboard/Produk/EditProduk';
import KategoriPage from './pages/landing/KategoriPage';
import SearchPage from './pages/landing/SearchPage';
import ManagePersonil from './pages/dashboard/ManagePersonil';
import AuthLayout from './layouts/AuthLayout';

function App() {
  return (
    <Routes>


        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Route>

        {/* admin-only */}
        <Route
          element={
            <ProtectedRoute roles={["admin"]} redirectTo="/">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/manage-shop" element={<ManageToko />} />
          <Route path="/dashboard/manage-categories" element={<ManageKategori />} />
          <Route path="/dashboard/manage-register" element={<ManagePendaftar />} />
          <Route path="/dashboard/manage-users" element={<ManageUser />} />
          <Route path="/dashboard/manage-owners" element={<ManagePemilikToko />} />
          <Route path="/dashboard/manage-roles" element={<ManageRole />} />
          <Route path="/dashboard/manage-permissions" element={<ManagePermissions />} />
        </Route>

        
        <Route
          element={
            <ProtectedRoute roles={["client"]} redirectTo="/">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard-client" element={<DashboardPage />} />
          <Route path="/dashboard/manage-my-shop" element={<ManageTokoClient />} />
          <Route path="/dashboard/manage-branch" element={<ManageCabang />} />
          <Route path="/dashboard/manage-faq" element={<ManageFaq />} />
          <Route path="/dashboard/manage-sosial-media" element={<ManageSosialMedia />} />
          <Route path="/dashboard/manage-product" element={<ManageProduk />} />
          <Route path="/dashboard/manage-product/create" element={<CreateProduk />} />
          <Route path="/dashboard/manage-product/edit/:id" element={<EditProduk />} />
          <Route path="/dashboard/manage-product/:id" element={<DetailProduk />} />
          <Route path="/dashboard/manage-personels" element={<ManagePersonil />} />
        </Route>

        <Route element={
          <LandingLayout />}
        >
          <Route path="/" element={<LandingPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:kategoriId" element={<KategoriPage />} />
          <Route path="/:tokoSlug/:produkSlug" element={<ProdukPage />} />
          <Route path="/:slug" element={<TokoPage />} />
        </Route>
      
      <Route path="*" element={<NotFound />} /> 
    </Routes>
  )
}

export default App
