import { useAuth } from '@/context/AuthContext'
import type { DashboardAdmin, DashboardClient } from '@/models'
import { dashboardService } from '@/services/DashboardService'
import React, { useEffect, useState } from 'react'
import Loading from './Loading'
import StatisticCard from './StatisticCard'

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
            <div className="flex justify-center items-center h-64">
                <Loading></Loading>
            </div>
        );
    }

  return (
    <div>
        {
            isAdmin ? 
            <div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-4 gap-4">
                <StatisticCard title="Total Toko" total={itemAdmin.data.totalToko} key={1}></StatisticCard>
                <StatisticCard title="Total Ulasan" total={itemAdmin.data.totalUlasan} key={1}></StatisticCard>
                <StatisticCard title="Total Pendaftar" total={itemAdmin.data.totalProduk} key={1}></StatisticCard>
                <StatisticCard title="Total Produk" total={itemAdmin.data.totalProduk} key={1}></StatisticCard>
            </div>
            :
            <div className="grid grid-cols-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 my-4 gap-4">
                <StatisticCard title="Total Cabang" total={itemClient.data.totalCabang} key={1}></StatisticCard>
                <StatisticCard title="Total Produk" total={itemClient.data.totalProduk} key={1}></StatisticCard>
                <StatisticCard title="Total Pengguna" total={itemClient.data.totalPengguna} key={1}></StatisticCard>
                <StatisticCard title="Total Ulasan" total={itemClient.data.totalUlasan} key={1}></StatisticCard>
                
            </div>
        }
    </div>
  )
}

export default StatisticSection