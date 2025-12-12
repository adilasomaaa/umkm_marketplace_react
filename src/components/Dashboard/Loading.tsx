import { Card, Skeleton } from '@heroui/react'
import React from 'react'

const Loading = () => {
    const [isLoaded, setIsLoaded] = React.useState(false);

  return (
    <Card className="p-4 w-full max-w-2xl mx-auto animate-pulse">
        <div className="w-full flex items-center gap-3">
        <div>
            <Skeleton className="flex rounded-full w-12 h-12" />
        </div>
        <div className="w-full flex flex-col gap-2">
            <Skeleton className="h-3 w-3/5 rounded-lg" />
            <Skeleton className="h-3 w-4/5 rounded-lg" />
        </div>
        </div>
    </Card>
  )
}
export default Loading