import { Button, Card, CardBody, CardFooter, CardHeader, Checkbox, Input } from '@heroui/react'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from '@/context/AuthContext';
import { Link, Links, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { pendaftarSchema, type PendaftarSchema } from '@/schemas/PendaftarSchema';
import { pendaftarService } from '@/services/PendaftarService';


const LoginPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PendaftarSchema>({
        resolver: zodResolver(pendaftarSchema)
    });


    const onSubmit = async (values: PendaftarSchema) => {
        try {
            await pendaftarService.create(values);
            navigate("/login");
        } catch (e) {
            console.error(e);
            // tampilkan toast error
        }
    };
  return (
    <div className="min-h-dvh grid place-items-center bg-background">
        <Card className="w-full md:w-[400px] sm:w-full p-4 shadow-none">
            <CardHeader className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold">Buat Akun</h1>
                <p className="text-sm text-foreground-500">
                    Daftar akun Anda untuk memulai aplikasi
                </p>
            </CardHeader>

            <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody className="flex flex-col gap-4">
                <Input
                    key="nib"
                    label="Nomor Induk Berusaha (NIB)"
                    type="text"
                    variant="bordered"
                    isInvalid={!!errors.nib}
                    errorMessage={errors.nib?.message}
                    {...register("nib")}
                />

                <Input
                    key="nama_toko"
                    label="Nama Toko"
                    type="text"
                    variant="bordered"
                    isInvalid={!!errors.nama_toko}
                    errorMessage={errors.nama_toko?.message}
                    {...register("nama_toko")}
                />

                <Input
                    key="nama_pemilik"
                    label="Nama Pemilik"
                    type="text"
                    variant="bordered"
                    isInvalid={!!errors.nama_pemilik}
                    errorMessage={errors.nama_pemilik?.message}
                    {...register("nama_pemilik")}
                />

                <Input
                    key="email"
                    label="Email"
                    type="email"
                    variant="bordered"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    {...register("email")}
                />
                

            </CardBody>

            <CardFooter className="flex flex-col gap-3">
                <Button
                    type="submit"
                    color="primary"
                    fullWidth
                    isLoading={isSubmitting}
                >
                    Daftar
                </Button>
                <p className="text-center text-sm text-foreground-500">
                    Sudah punya akun?{" "}
                    <Link to="/login" className='text-primary'>
                        Masuk
                    </Link>
                </p>
            </CardFooter>
            </form>
        </Card>
    </div>
  )
}

export default LoginPage