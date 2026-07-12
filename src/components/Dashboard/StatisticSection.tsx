import { useAuth } from '@/context/AuthContext'
import type { DashboardAdmin, DashboardClient } from '@/models'
import { dashboardService } from '@/services/DashboardService'
import { useEffect, useState } from 'react'
import Loading from './Loading'
import StatisticCard from './StatisticCard'
import { Store, MessageSquare, UserCheck, ShoppingBag, MapPin, Users } from 'lucide-react'

const StatisticSection = () => {
    const auth = useAuth()
    const role = auth.user?.roles.name
    const [isClient, isAdmin] = [role === 'client', role === 'admin']
    const [itemAdmin, setItemAdmin] = useState<DashboardAdmin>(null as any)
    const [itemClient, setItemClient] = useState<DashboardClient>(null as any)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                if (isAdmin) {
                    const result = await dashboardService.dashboardAdmin()
                    setItemAdmin(result)
                } else if (isClient) {
                    const result = await dashboardService.dashboardClient()
                    setItemClient(result)
                }
                setIsLoading(false)
            }catch(error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [isAdmin, isClient])

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loading></Loading>
            </div>
        );
    }

  return (
    <div>
        {
            isAdmin ? 
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 my-4 gap-6">
                <StatisticCard 
                    title="Total Toko" 
                    total={itemAdmin.data.totalToko} 
                    icon={<Store className="w-6 h-6" />} 
                    color="primary" 
                    key={1}
                />
                <StatisticCard 
                    title="Total Ulasan" 
                    total={itemAdmin.data.totalUlasan} 
                    icon={<MessageSquare className="w-6 h-6" />} 
                    color="warning" 
                    key={2}
                />
                <StatisticCard 
                    title="Total Pendaftar" 
                    total={itemAdmin.data.totalPendaftar} 
                    icon={<UserCheck className="w-6 h-6" />} 
                    color="success" 
                    key={3}
                />
                <StatisticCard 
                    title="Total Produk" 
                    total={itemAdmin.data.totalProduk} 
                    icon={<ShoppingBag className="w-6 h-6" />} 
                    color="secondary" 
                    key={4}
                />
            </div>
            :
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 my-4 gap-6">
                <StatisticCard 
                    title="Total Cabang" 
                    total={itemClient.data.totalCabang} 
                    icon={<MapPin className="w-6 h-6" />} 
                    color="success" 
                    key={1}
                />
                <StatisticCard 
                    title="Total Produk" 
                    total={itemClient.data.totalProduk} 
                    icon={<ShoppingBag className="w-6 h-6" />} 
                    color="primary" 
                    key={2}
                />
                <StatisticCard 
                    title="Total Pengguna" 
                    total={itemClient.data.totalPengguna} 
                    icon={<Users className="w-6 h-6" />} 
                    color="secondary" 
                    key={3}
                />
                <StatisticCard 
                    title="Total Ulasan" 
                    total={itemClient.data.totalUlasan} 
                    icon={<MessageSquare className="w-6 h-6" />} 
                    color="warning" 
                    key={4}
                />
            </div>
        }
    </div>
  )
}

export default StatisticSection