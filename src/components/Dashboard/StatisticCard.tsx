import { Card, CardBody } from '@heroui/react'


interface StatisticCardProps {
    title: string
    total: number
    key: number
}

const StatisticCard = ({ title, total, key}: StatisticCardProps) => {
  return (
    <Card key={key} className="py-4">
      <CardBody className="overflow-visible py-2">
        <p className="text-tiny uppercase font-bold">{title}</p>
        <small className="text-default-500">{total}</small>
      </CardBody>
    </Card>
  )
}

export default StatisticCard