import type { Ulasan } from '@/models'
import { ulasanService } from '@/services/UlasanService'
import { Avatar, Button, ButtonGroup, Card, CardBody, CardFooter, CardHeader, Chip, useDisclosure } from '@heroui/react'
import { Check, CheckLine, StarIcon, Trash, X } from 'lucide-react'
import React, { useState } from 'react'
import ConfirmationModal from '../Dashboard/ConfirmationModal'

interface UlasanCardProps {
    ulasan: Ulasan
    key: number,
    isStatus?: boolean
    isEditable?: boolean
    isDeletable?: boolean
    onActionSuccess?: () => void
}

const UlasanCard = ({ulasan, key, isStatus, isEditable, isDeletable, onActionSuccess}: UlasanCardProps) => {
    const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure();
    const [modalConfig, setModalConfig] = useState<{
        action: 'terima' | 'tolak' | 'hapus' | null;
        title: string;
        description: string;
        confirmText: string;
        confirmColor: 'danger' | 'success';
        icon: React.ReactNode;
    }>({
        action: null,
        title: '',
        description: '',
        confirmText: '',
        confirmColor: 'success',
        icon: null,
    });

    let chipColor: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' = 'default'
    switch(ulasan.status) {
        case 'menunggu':
            chipColor = 'warning'
            break;
        case 'terima':
            chipColor = 'success'
            break;
        case 'tolak':
            chipColor = 'danger'
            break;
    }

    const openConfirmation = (actionType: 'terima' | 'tolak' | 'hapus') => {
        let config;

        if (actionType === 'terima') {
            config = {
                action: 'terima' as const,
                title: 'Konfirmasi Terima Ulasan',
                description: `Apakah Anda yakin ingin Menerima ulasan dari ${ulasan.nama} (ID: ${ulasan.id})?`,
                confirmText: 'Terima Ulasan',
                confirmColor: 'success' as const,
                icon: <Check className='h-6 w-6' />,
            };
        } else if (actionType === 'tolak') {
            config = {
                action: 'tolak' as const,
                title: 'Konfirmasi Tolak Ulasan',
                description: `Apakah Anda yakin ingin Menolak ulasan dari ${ulasan.nama}? Ini tidak dapat dibatalkan.`,
                confirmText: 'Tolak Ulasan',
                confirmColor: 'danger' as const,
                icon: <X className='h-6 w-6' />,
            };
        } else { // hapus
             config = {
                action: 'hapus' as const,
                title: 'Konfirmasi Hapus Ulasan',
                description: `Apakah Anda yakin ingin Menghapus ulasan dari ${ulasan.nama}? Tindakan ini permanen.`,
                confirmText: 'Hapus Permanen',
                confirmColor: 'danger' as const,
                icon: <Trash className='h-6 w-6' />,
            };
        }
        
        setModalConfig(config);
        onModalOpen();
    };

    const getApiAction = () => {
        if (modalConfig.action === 'terima') {
            return () => ulasanService.update(ulasan.id, {status: 'terima'}); 
        } else if (modalConfig.action === 'tolak') {
            return () => ulasanService.update(ulasan.id, {status: 'tolak'}); 
        } else if (modalConfig.action === 'hapus') {
            return () => ulasanService.delete(ulasan.id);
        }
        return () => Promise.resolve(); 
    };

  return (
      <>
        <Card key={key}>
        <CardHeader className="justify-between p-2 px-4">
            <div className="flex gap-5">
            <Avatar
                radius="full"
                size="md"
            />
            <div className="flex gap-2 items-center justify-center">
                <h4 className="text-small font-semibold leading-none text-default-600">{ulasan.nama}</h4>
                <span className='text-small text-default-400'>(
                    {ulasan.createdAt && new Date(ulasan.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    )
                </span>
                {isStatus && 
                    <Chip color={chipColor} size="sm" className='text-white'>
                        {ulasan.status}
                    </Chip>
                }
            </div>
            </div>
            <div className='flex items-center'>
                <ButtonGroup size='sm'>
                    {
                        isEditable && (
                            <>
                                <Button color='success' className='text-white' onPress={() => openConfirmation('terima')}>
                                    <Check className='h-4' />
                                </Button>
                                <Button color='danger' className='text-white' onPress={() => openConfirmation('tolak')}>
                                    <X className='h-4' />
                                </Button>
                            </>
                        )
                    }
                    {isDeletable &&
                        <Button color='danger' className='text-white' onPress={() => openConfirmation('hapus')}>
                            <Trash className='h-4' />
                        </Button>
                    }
                </ButtonGroup>
                <Button
                className="bg-transparent text-foreground border-default-200"
                color="primary"
                radius="full"
                size="sm"
                >
                    <StarIcon className='text-warning-400'></StarIcon>
                {ulasan.nilai}
                </Button>
            </div>
        </CardHeader>
        <CardBody className="px-4 py-2 text-small text-default-400">
            <p>{ulasan.komentar}</p>
        </CardBody>
        </Card>
        <ConfirmationModal
            isOpen={isModalOpen}
            onClose={onModalClose}
            action={getApiAction()} // Fungsi API yang akan dieksekusi
            payload={{ id: ulasan.id }} // Payload yang dikirim (hanya id ulasan)
            title={modalConfig.title}
            description={modalConfig.description}
            confirmText={modalConfig.confirmText}
            confirmColor={modalConfig.confirmColor}
            icon={modalConfig.icon}
            onSuccess={onActionSuccess} // Panggil fungsi refresh setelah sukses
        />
    </>
  )
}

export default UlasanCard