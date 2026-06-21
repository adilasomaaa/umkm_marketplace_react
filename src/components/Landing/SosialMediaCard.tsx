import type { SosialMedia } from '@/models'
import { Button } from '@heroui/button'
import { Facebook, Instagram, Music2, Twitter, Youtube, Globe } from 'lucide-react'
import { Link } from 'react-router-dom'

interface SosialMediaCardProps {
    item: SosialMedia
    key?: number
}

const sosialMediaIcon = [
    {
        tipe: "instagram",
        icon: <Instagram className='w-4 h-4' />,
        color: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600"
    },
    {
        tipe: "twitter",
        icon: <Twitter className='w-4 h-4' />,
        color: "bg-slate-900"
    },
    {
        tipe: "tiktok",
        icon: <Music2 className='w-4 h-4' />,
        color: "bg-black"
    },
    {
        tipe: "youtube",
        icon: <Youtube className='w-4 h-4' />,
        color: "bg-[#FF0000]"
    },
    {
        tipe: "facebook",
        icon: <Facebook className='w-4 h-4' />,
        color: "bg-[#1877F2]"
    },
    {
        tipe: "website",
        icon: <Globe className='w-4 h-4' />,
        color: "bg-success-600"
    }
]

const SosialMediaCard = ({ item, key } : SosialMediaCardProps) => {
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

    const activeSosmed = sosialMediaIcon.find(sm => sm.tipe === tipeSosialMedia) || sosialMediaIcon[5]

    return (
        <Button 
            as={Link} 
            to={item.url} 
            target='_blank' 
            key={key} 
            variant="flat" 
            color="default" 
            className='flex gap-4 items-center font-bold py-6 border border-default-100 hover:border-default-300 shadow-sm transition-all duration-300 hover:scale-[1.02] bg-white rounded-2xl justify-start px-5'
        >
            <div className={`${activeSosmed.color} w-8 h-8 flex items-center justify-center rounded-full text-white shrink-0 shadow-sm`}>
                {activeSosmed.icon}
            </div>
            <span className="text-sm text-gray-700 capitalize">{item.nama}</span>
        </Button>
    )
}

export default SosialMediaCard