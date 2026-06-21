import { Card, CardBody } from '@heroui/react'
import React from 'react'

interface StatisticCardProps {
    title: string
    total: number
    icon: React.ReactNode // icon is now required
    color?: 'success' | 'primary' | 'warning' | 'secondary' | 'danger'
    key?: number
}

const StatisticCard = ({ title, total, icon, color = 'primary' }: StatisticCardProps) => {
  const colorMap = {
    primary: {
      bg: 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
      border: 'hover:border-primary-300 dark:hover:border-primary-700'
    },
    success: {
      bg: 'bg-success-50 text-success-600 dark:bg-success-950/30 dark:text-success-400',
      border: 'hover:border-success-300 dark:hover:border-success-700'
    },
    warning: {
      bg: 'bg-warning-50 text-warning-600 dark:bg-warning-950/30 dark:text-warning-400',
      border: 'hover:border-warning-300 dark:hover:border-warning-700'
    },
    secondary: {
      bg: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-950/30 dark:text-secondary-400',
      border: 'hover:border-secondary-300 dark:hover:border-secondary-700'
    },
    danger: {
      bg: 'bg-danger-50 text-danger-600 dark:bg-danger-950/30 dark:text-danger-400',
      border: 'hover:border-danger-300 dark:hover:border-danger-700'
    }
  }

  const activeColor = colorMap[color] || colorMap.primary

  return (
    <Card className={`relative border border-default-200 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.02] ${activeColor.border} overflow-hidden bg-white`}>
      <CardBody className="p-5 flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-default-400">{title}</span>
          <span className="text-3xl font-black text-default-900 tracking-tight mt-1">{total}</span>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${activeColor.bg}`}>
          {icon}
        </div>
      </CardBody>
    </Card>
  )
}

export default StatisticCard