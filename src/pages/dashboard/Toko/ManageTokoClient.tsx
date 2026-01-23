import React, { use, useCallback, useEffect, useState } from "react";
import {
  Card,
  Image,
  Button,
  CardHeader,
  Divider,
  CardBody,
  Chip,
  User
} from "@heroui/react";
import {
  type Kategori,
  type TokoClient,
  type TokoUpdateClientPayload,
  type Ulasan,
} from "@/models";
import { tokoService } from "@/services/TokoService";
import { useAuth } from "@/context/AuthContext";
import { ArrowRightCircle, PencilIcon,ShoppingBagIcon, StarIcon } from "lucide-react";
import DefaultShop from '@/assets/default_shop.png';
import InputModal from "@/components/Dashboard/InputModal";
import type { FormFieldConfig } from "@/types";
import { kategoriService } from "@/services/KategoriService";
import { useForm } from "react-hook-form";
import { tokoUpdateClientSchema, type TokoUpdateClientSchema } from "@/schemas/TokoSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { env } from "@/lib/env";
import Loading from "@/components/Dashboard/Loading";
import { ulasanService } from "@/services/UlasanService";
import UlasanCard from "@/components/Landing/UlasanCard";
import { Link } from "react-router-dom";
import { parseDate } from "@/lib/parse_date";
import StatisticSection from "@/components/Dashboard/StatisticSection";

const getFormFields = (mode: "create" | "update", categories: Kategori[], initialData: TokoClient): FormFieldConfig[] => {
  const allFields = {
    nama_toko: { key: "nama_toko", label: "Nama Toko", type: "text", placeholder: "Masukkan nama toko..." },
    nomor_hp: { key: "nomor_hp", label: "Kontak Toko", type: "text", placeholder: "Masukkan kontak toko..." },
    nib: { key: "nib", label: "Nomor Induk Berusaha (NIB)", type: "text", placeholder: "Masukkan NIB..." },
    kategori_id: {
      key: "kategori_id",
      label: "Kategori",
      type: "multi-select",
      placeholder: "Pilih kategori...",
      options: categories.map(category => ({
        label: category.nama_kategori,
        value: category.id,
      })),
    },
    logo: { 
      key: "logo",
      label: "Upload Logo Toko",
      type: "upload",
      placeholder: "Pilih file logo (PNG, JPG)",
      maxSize: 5 * 1024 * 1024,
      allowedExtensions: ['.png', '.jpg', '.jpeg'],
      previewUrl: env.baseUrl + initialData?.logo,
    },
    deskripsi: { key: "deskripsi", label: "Deskripsi", type: "text", placeholder: "Masukkan deskripsi..." },
  } as const;

  return [
    allFields.nama_toko,
    allFields.nomor_hp,
    allFields.nib,
    allFields.kategori_id,
    allFields.deskripsi,
    allFields.logo,
  ];
};

const ManageTokoClient = () => {
  const [tokoSaya, setTokoSaya] = useState<TokoClient | null>(null);
  const [kategori, setKategori] = useState<Kategori[]>([]);
  const [ulasan, setUlasan] = useState<Ulasan[]>([]);
  const [isLoadingUlasan, setIsLoadingUlasan] = useState(true);
  const [isLoadingKategori, setIsLoadingKategori] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TokoClient | null>(null);
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const activeFormFields = getFormFields("update", kategori, tokoSaya!);

  const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
      setValue,
      watch,
    } = useForm<TokoUpdateClientSchema>({
      resolver: zodResolver(tokoUpdateClientSchema),
      mode: 'onChange',
    });

  const handleOpenEditModal = (item: TokoClient) => {
      setEditingItem(item);
      setIsModalOpen(true);
    };

  const onSubmit = async (formData: Record<string, any>) => {
      setIsSubmitting(true);
      try {
        if (editingItem) {
          await tokoService.updateClient(
            Number(editingItem.id),
            formData as TokoUpdateClientPayload
          );
        }
        handleCloseModal();
        await fetchTokoSayaCallback();
      } catch (error) {
        console.error("Gagal menyimpan data:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

  useEffect(() => {
      const fetchKategori = async () => {
        try {
          const response = await kategoriService.index({
            limit: 100,
            tipe: "toko"
          });
          setKategori(response.data);
        } catch (error) {
          console.error("Gagal mengambil data kategori:", error);
        } finally {
          setIsLoadingKategori(false);
        }
      };

      const fetchUlasan = async () => {
        setIsLoadingUlasan(true)
        try {
          const response = await ulasanService.index({
            limit: 3,
            tokoId: user?.toko?.id
          })
          setUlasan(response.data)
          setIsLoadingUlasan(false)
        }catch(error){
          console.error("Gagal mengambil data ulasan:", error)
        }finally {
          setIsLoadingUlasan(false)
        }
      }
  
      fetchKategori();
      fetchUlasan();
    }, []);

  useEffect(() => {
    if (editingItem) {
        setValue("nama_toko", editingItem.nama_toko);
        setValue("nib", editingItem.nib || ""); 
        setValue("deskripsi", editingItem.deskripsi || "");
        setValue("nomor_hp", editingItem.nomor_hp || "");
        if (editingItem.KategoriToko) {
            const selectedKategoriIds = editingItem.KategoriToko.map(
                kt => kt.kategoriId
            );
            setValue("kategori_id", selectedKategoriIds);
        }
    } else {
        reset();
    }
}, [editingItem, setValue, reset]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const fetchTokoSayaCallback = useCallback(async () => {
    setLoading(true);
    try {
      const toko = await tokoService.client(user?.toko?.id || 0);
      setTokoSaya(toko.data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data toko saya:", error);
      setLoading(false);
    }
  }, [user, tokoService]);

  useEffect(() => {
    fetchTokoSayaCallback();
  }, [fetchTokoSayaCallback]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading></Loading>
      </div>
    );
  }

  if (!tokoSaya) {
    return (
      <div className="p-6">
        <Card className="max-w-xl mx-auto border-dashed border-2 border-default-300 bg-default-50 ">
            <CardHeader className="flex flex-col items-center justify-center p-6 pb-2">
                <ShoppingBagIcon className="h-10 w-10 text-primary-500 mb-3" />
                <h3 className="text-xl font-bold text-default-800">Toko Belum Terdaftar</h3>
            </CardHeader>
            <CardBody className="pt-0 text-center">
                <p className="text-default-600 mb-4">
                    Anda belum memiliki toko yang terdaftar sebagai klien. Silakan buat pendaftaran toko Anda terlebih dahulu.
                </p>
            </CardBody>
        </Card>
      
      </div>
    );
  }

  return (
    <div>
      <StatisticSection/>
      {tokoSaya ? (
        <div className="grid grid-cols-5 grid-rows-1 gap-4">
          <div className="col-span-3">
            <Card>
              <CardHeader className="flex gap-3">
                 <Image
                  alt="Woman listing to music"
                  className="object-cover"
                  height={100}
                  src={env.baseUrl + tokoSaya.logo || DefaultShop}
                  width={100}
                />
                <div className="flex flex-col gap-2 ">
                  <p className="text-lg font-semibold">{tokoSaya.nama_toko}</p>
                  <p className="text-small text-default-500">
                    {tokoSaya.CabangToko[0].alamat && tokoSaya.CabangToko[0].alamat || "Alamat Toko belum diatur"}
                    </p>
                  <div className="flex gap-4">
                    <Button
                      color="default"
                      size="sm"
                      variant="flat"
                      className="ml-auto"
                      onPress={() => handleOpenEditModal(tokoSaya)}
                    >
                      <PencilIcon className="h-4 w-4"></PencilIcon> Perbarui Toko
                    </Button>
                    <Link to={`/${tokoSaya.slug}`} target="_blank" rel="noopener noreferrer">
                      <Button
                        color="primary"
                        size="sm"
                        variant="flat"
                        className="ml-auto"
                      >
                        <ArrowRightCircle className="h-4 w-4"></ArrowRightCircle> Lihat Toko
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="flex ml-auto items-center gap-1 text-yellow-500 font-semibold">
                  <StarIcon className="h-6 w-6 inline-block"></StarIcon>
                  <span className="inline-block text-[30px]">{tokoSaya.rating || "0.0"}</span>
                </div>
              </CardHeader>
              <Divider />
              <CardBody>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Deskripsi Toko</h3>
                  <p className="text-default-700 mb-4">
                    {tokoSaya.deskripsi && tokoSaya.deskripsi || "Deskripsi Toko belum diatur"}
                  </p>
                </div>
                <Divider/>
                <div className="my-4 grid gap-4 grid-cols-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Cabang Toko</h3>
                    {tokoSaya.CabangToko && tokoSaya.CabangToko.length > 0 ? (
                        tokoSaya.CabangToko.map((kt) => (
                          <Chip key={kt.id} color="primary" variant="flat" size="sm">
                            {kt.nama_cabang}
                          </Chip>
                        ))
                      ) : (
                        <p className="text-small text-default-500">Kategori belum diatur</p>
                      )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Kategori Toko</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tokoSaya.KategoriToko && tokoSaya.KategoriToko.length > 0 ? (
                        tokoSaya.KategoriToko.map((kt) => (
                          <Chip key={kt.id} color="primary" variant="flat" size="sm">
                            {kt.kategori.nama_kategori}
                          </Chip>
                        ))
                      ) : (
                        <p className="text-small text-default-500">Kategori belum diatur</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Kontak Toko</h3>
                    <p className="text-default-700 mb-4">
                      {tokoSaya.nomor_hp && tokoSaya.nomor_hp || "Kontak Toko belum diatur"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Mulai Bergabung</h3>
                    <p className="text-default-700 mb-4">
                      {tokoSaya.createdAt && parseDate(tokoSaya.createdAt) || "Kontak Toko belum diatur"}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
          <div className="col-span-2">
            <Card>
              <CardHeader className="flex gap-3">
                <h3 className="text-lg font-semibold">Ulasan Toko</h3>
              </CardHeader> 
              <Divider/>
              <CardBody>
                <div className="flex flex-col gap-4">
                  {ulasan && ulasan.length > 0 ? (
                    ulasan.map((ulasan) => (
                      <UlasanCard key={ulasan.id} ulasan={ulasan}></UlasanCard>
                      
                    ))
                  ) : (
                    <p className="text-small text-default-500">Belum ada ulasan</p>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
      </div>
      ) : (
        <div className="border p-4 rounded-lg shadow-sm">
          <p>Anda belum memiliki toko. Silakan buat toko terlebih dahulu.</p>
          
        </div>
      )}
    <InputModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingItem ? "Edit Toko" : "Tambah Toko Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageTokoClient;
