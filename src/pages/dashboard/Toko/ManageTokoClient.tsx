import { useCallback, useEffect, useState } from "react";
import {
  Card,
  Button,
  CardHeader,
  Divider,
  CardBody,
  Chip,
} from "@heroui/react";
import {
  type Kategori,
  type TokoClient,
  type TokoUpdateClientPayload,
  type Ulasan,
} from "@/models";
import { tokoService } from "@/services/TokoService";
import { useAuth } from "@/context/AuthContext";
import { ArrowRightCircle, PencilIcon, ShoppingBagIcon, StarIcon, MapPin, Info, Store, Tag, Phone, Calendar } from "lucide-react";
import SafeImage from "@/components/SafeImage";
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

const getFormFields = (_mode: "create" | "update", categories: Kategori[], initialData: TokoClient): FormFieldConfig[] => {
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
  const [_, setIsLoadingUlasan] = useState(true);
  const [__, setIsLoadingKategori] = useState(true);
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
        await fetchTokoSayaCallback(true);
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

  const fetchTokoSayaCallback = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const toko = await tokoService.client(user?.toko?.id || 0);
      setTokoSaya(toko.data);
    } catch (error) {
      console.error("Gagal mengambil data toko saya:", error);
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [user]);

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
        <Card className="max-w-2xl mx-auto border border-default-100 shadow-lg bg-white rounded-3xl overflow-hidden animate-fade-in-up">
            <div className="h-4 bg-gradient-to-r from-success-500 to-emerald-600" />
            <CardHeader className="flex flex-col items-center justify-center p-8 pb-4">
                <div className="w-16 h-16 rounded-full bg-success-50 flex items-center justify-center mb-4 border border-success-100 shadow-inner animate-pulse">
                    <ShoppingBagIcon className="h-8 w-8 text-success-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Toko Belum Terdaftar</h3>
            </CardHeader>
            <CardBody className="px-8 pb-8 text-center flex flex-col items-center gap-4">
                <p className="text-default-500 font-medium text-sm max-w-md">
                    Anda belum memiliki toko yang terdaftar sebagai klien. Silakan hubungi admin atau daftarkan toko Anda untuk mulai mengelola cabang, produk, dan melihat ulasan.
                </p>
                <div className="w-full h-px bg-default-100 my-2" />
                <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
                    <Link to="/">
                      <Button color="success" className="font-bold text-white bg-gradient-to-r from-success-600 to-emerald-600" radius="lg">
                        Kembali ke Beranda
                      </Button>
                    </Link>
                </div>
            </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StatisticSection/>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column: Store Profile & Details */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card className="shadow-sm border border-default-100 overflow-hidden">
            {/* Cover Banner */}
            <div className="h-32 bg-gradient-to-r from-success-500/20 via-emerald-500/20 to-teal-500/10 rounded-t-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5" />
              <div className="absolute right-6 top-6 z-10 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm font-semibold select-none">
                <StarIcon className="h-4 w-4 fill-warning-400 stroke-warning-400" />
                <span className="text-sm text-gray-800">{tokoSaya.rating || "0.0"}</span>
              </div>
            </div>

            {/* Profile Logo & Title */}
            <div className="px-6 pb-6 relative flex flex-col sm:flex-row gap-4 items-start sm:items-end -mt-10">
              <div className="relative group shrink-0">
                <SafeImage
                  alt={tokoSaya.nama_toko}
                  className="object-cover border-4 border-white bg-white shadow-md rounded-2xl w-24 h-24 sm:w-28 sm:h-28"
                  src={tokoSaya.logo ? env.baseUrl + tokoSaya.logo : undefined}
                  fallbackType="toko"
                />
              </div>
              <div className="flex-1 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 w-full">
                <div className="flex flex-col gap-1 text-left">
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{tokoSaya.nama_toko}</h2>
                  <div className="flex items-center gap-1 text-sm text-default-500 font-medium">
                    <MapPin className="w-4 h-4 text-success-600 shrink-0" />
                    <span>
                      {tokoSaya.CabangToko && tokoSaya.CabangToko.length > 0 && tokoSaya.CabangToko[0].alamat
                        ? tokoSaya.CabangToko[0].alamat
                        : "Alamat Toko belum diatur"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    color="default"
                    size="sm"
                    variant="flat"
                    className="font-bold border border-default-200"
                    onPress={() => handleOpenEditModal(tokoSaya)}
                    startContent={<PencilIcon className="h-4 w-4" />}
                    radius="md"
                  >
                    Perbarui Toko
                  </Button>
                  <Link to={`/${tokoSaya.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button
                      color="success"
                      size="sm"
                      className="font-bold text-white bg-gradient-to-r from-success-600 to-emerald-600"
                      startContent={<ArrowRightCircle className="h-4 w-4" />}
                      radius="md"
                    >
                      Lihat Toko
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <Divider />

            {/* Store Information Grid */}
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Description */}
                <div className="col-span-1 md:col-span-2 bg-default-50/50 p-5 rounded-2xl border border-default-100/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-5 h-5 text-success-600" />
                    <h3 className="text-md font-bold text-gray-800">Deskripsi Toko</h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed text-justify whitespace-pre-line">
                    {tokoSaya.deskripsi || "Deskripsi Toko belum diatur"}
                  </p>
                </div>

                {/* Cabang Toko */}
                <div className="bg-default-50/50 p-5 rounded-2xl border border-default-100/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Store className="w-5 h-5 text-success-600" />
                    <h3 className="text-md font-bold text-gray-800">Cabang Toko</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tokoSaya.CabangToko && tokoSaya.CabangToko.length > 0 ? (
                      tokoSaya.CabangToko.map((c) => (
                        <Chip key={c.id} color="success" variant="flat" size="sm" className="font-bold">
                          {c.nama_cabang}
                        </Chip>
                      ))
                    ) : (
                      <span className="text-sm text-default-400 font-medium">Cabang belum diatur</span>
                    )}
                  </div>
                </div>

                {/* Kategori Toko */}
                <div className="bg-default-50/50 p-5 rounded-2xl border border-default-100/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-5 h-5 text-success-600" />
                    <h3 className="text-md font-bold text-gray-800">Kategori Toko</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tokoSaya.KategoriToko && tokoSaya.KategoriToko.length > 0 ? (
                      tokoSaya.KategoriToko.map((kt) => (
                        <Chip key={kt.id} color="primary" variant="flat" size="sm" className="font-bold">
                          {kt.kategori.nama_kategori}
                        </Chip>
                      ))
                    ) : (
                      <span className="text-sm text-default-400 font-medium">Kategori belum diatur</span>
                    )}
                  </div>
                </div>

                {/* Kontak Toko */}
                <div className="bg-default-50/50 p-5 rounded-2xl border border-default-100/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-5 h-5 text-success-600" />
                    <h3 className="text-md font-bold text-gray-800">Kontak Toko</h3>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {tokoSaya.nomor_hp || "Kontak Toko belum diatur"}
                  </span>
                </div>

                {/* Mulai Bergabung */}
                <div className="bg-default-50/50 p-5 rounded-2xl border border-default-100/60 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-success-600" />
                    <h3 className="text-md font-bold text-gray-800">Mulai Bergabung</h3>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {tokoSaya.createdAt ? parseDate(tokoSaya.createdAt) : "Tanggal tidak diketahui"}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Store Reviews */}
        <div className="lg:col-span-2 flex flex-col gap-6 text-left">
          <Card className="shadow-sm border border-default-100">
            <CardHeader className="flex flex-col gap-3 items-start pb-2">
              <h3 className="text-lg font-extrabold text-gray-900 tracking-tight">Ulasan Toko</h3>
              
              {/* Rating Summary Banner */}
              <div className="w-full bg-gradient-to-r from-warning-50 to-amber-50/50 border border-warning-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-warning-700 uppercase tracking-wider">Rating Toko</span>
                  <span className="text-3xl font-black text-warning-600 mt-1">{tokoSaya.rating || "0.0"}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const rating = parseFloat(tokoSaya.rating || "0.0");
                      const isFilled = starValue <= rating;
                      return (
                        <StarIcon 
                          key={i} 
                          className={`w-4 h-4 ${
                            isFilled 
                              ? 'fill-warning-400 stroke-warning-400' 
                              : 'text-default-300 stroke-default-300'
                          }`} 
                        />
                      );
                    })}
                  </div>
                  <span className="text-xs font-semibold text-warning-700 mt-1">Ulasan Pelanggan</span>
                </div>
              </div>
            </CardHeader>
            <Divider className="my-2" />
            <CardBody className="pt-2">
              <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {ulasan && ulasan.length > 0 ? (
                  ulasan.map((item) => (
                    <div key={item.id} className="transition-all duration-300 hover:scale-[1.01]">
                      <UlasanCard key={item.id} ulasan={item}></UlasanCard>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <StarIcon className="w-12 h-12 text-default-300 mb-3" />
                    <p className="text-sm font-bold text-gray-700">Belum ada ulasan</p>
                    <p className="text-xs text-default-400 mt-1">Ulasan dari pelanggan akan ditampilkan di sini.</p>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <InputModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Toko" : "Tambah Toko Baru"}
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
