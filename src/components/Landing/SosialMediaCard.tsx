import type { SosialMedia } from '@/models'
import { Button } from '@heroui/button'
import { Facebook, Instagram, Music2, Twitter, Youtube } from 'lucide-react'

import { Link } from 'react-router-dom'

interface SosialMediaCardProps {
    item: SosialMedia
    key: number
}

const sosialMediaIcon = [
    {
        tipe: "instagram",
        icon: <Instagram className='w-4 h-4' />,
        color: "bg-pink-500"
    },
    {
        tipe: "twitter",
        icon: <Twitter className='w-4 h-4' />,
        color: "bg-blue-500"
    },
    {
        tipe: "tiktok",
        icon: <Music2 className='w-4 h-4' />,
        color: "bg-red-500"
    },
    {
        tipe: "youtube",
        icon: <Youtube className='w-4 h-4' />,
        color: "bg-red-500"
    },
    {
        tipe: "facebook",
        icon: <Facebook className='w-4 h-4' />,
        color: "blue-500"
    }
]

const SosialMediaCard = ({ item, key} : SosialMediaCardProps) => {
    let tipeSosialMedia: 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'facebook' | 'website'
    switch(item.tipe) {
        case "instagram":
            tipeSosialMedia = "instagram"
            break;
        case "twitter":
            tipeSosialMedia = "twitter"
            break;
        case "tiktok":
            tipeSosialMedia = "tiktok"
            break;
        case "youtube":
            tipeSosialMedia = "youtube"
            break;
        case "facebook":
            tipeSosialMedia = "facebook"
            break;
        default:
            tipeSosialMedia = "website"
            break;
    }


  return (
        <Button as={Link} to={item.url} target='_blank' key={key} variant="ghost" color="default" className='flex gap-4 items-center font-semibold py-6 shadow-sm'>
            {sosialMediaIcon &&
            <>
                <div className={`${sosialMediaIcon.find(sosialMedia => sosialMedia.tipe === tipeSosialMedia)?.color} w-8 h-8 flex items-center justify-center rounded-full text-background`}>
                    {sosialMediaIcon.find(sosialMedia => sosialMedia.tipe === tipeSosialMedia)?.icon}
                </div>
                    <p className="text-sm">{item.nama}</p>
            </>
            }
        </Button>
  )
}

export default SosialMediaCard