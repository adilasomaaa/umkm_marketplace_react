/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { Loader2 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    action: (payload: any) => Promise<any>; 
    payload: any; // Data yang akan dikirim ke fungsi action
    title: string;
    description: string;
    confirmText: string;
    confirmColor: 'danger' | 'success' | 'warning' | 'primary' | 'default';
    icon: React.ReactNode; // Ikon untuk ditampilkan di modal
    onSuccess?: () => void; 
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    action,
    payload,
    title,
    description,
    confirmText,
    confirmColor,
    icon,
    onSuccess,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await action(payload);
            
            // Panggil callback sukses (misalnya untuk refresh data di halaman induk)
            onSuccess?.(); 
            
            onClose(); // Tutup modal
        } catch (error) {
            console.error('Gagal menjalankan aksi:', error);
            // Anda bisa tambahkan notifikasi error di sini
            alert(`Aksi gagal: ${error instanceof Error ? error.message : 'Terjadi kesalahan.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose}>
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 items-center justify-center text-center">
                    {/* Icon untuk visualisasi aksi */}
                    <div className={`p-3 rounded-full mb-2 ${confirmColor === 'danger' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {icon}
                    </div>
                    <h3 className="font-bold text-xl">{title}</h3>
                </ModalHeader>
                <ModalBody className='text-center'>
                    <p className="text-default-600">
                        {description}
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button 
                        variant="light" 
                        onPress={onClose} 
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button 
                        color={confirmColor} 
                        onPress={handleConfirm} 
                        disabled={isLoading}
                        isLoading={isLoading}
                        startContent={isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : null}
                        className='text-white'
                    >
                        {confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default ConfirmationModal;