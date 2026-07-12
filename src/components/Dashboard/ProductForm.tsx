import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { ChevronLeft, Save, X, Tag, MapPin, Layers } from "lucide-react";
import { useFilter } from "@react-aria/i18n";
import { useAuth } from "@/context/AuthContext";
import { cabangService } from "@/services/CabangService";
import { kategoriService } from "@/services/KategoriService";
import { hashtagService } from "@/services/HashtagService";
import { produkSchema, type ProdukSchema } from "@/schemas/ProdukSchema";
import ImageUploadField from "./ImageUploadField";
import type { UploadFieldProps } from "./ImageUploadField";
import type { Cabang, Kategori, Hashtag, Produk } from "@/models";
import { env } from "@/lib/env";

interface ProductFormProps {
  mode: "create" | "update";
  initialData?: Produk | null;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  isLoading: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  mode,
  initialData,
  onSubmit,
  isLoading,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tokoId = user?.toko?.id;

  const [categories, setCategories] = useState<Kategori[]>([]);
  const [branch, setBranch] = useState<Cabang[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);

  // Category controlled Autocomplete states
  const [categoryInputValue, setCategoryInputValue] = useState("");
  const { startsWith } = useFilter({ sensitivity: "base" });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProdukSchema>({
    resolver: zodResolver(produkSchema),
    mode: "onChange",
  });

  // Fetch lists
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await kategoriService.index({ limit: 100, tipe: "produk" });
        setCategories(res.data);
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    };
    const fetchBranchs = async () => {
      if (!tokoId) return;
      try {
        const res = await cabangService.index({ limit: 100, tokoId });
        setBranch(res.data);
      } catch (error) {
        console.error("Gagal mengambil cabang:", error);
      }
    };
    const fetchHashtags = async () => {
      if (!tokoId) return;
      try {
        const res = await hashtagService.index({ tokoId, limit: 100 });
        setHashtags(res.data);
      } catch (error) {
        console.error("Gagal mengambil hashtag:", error);
      }
    };

    fetchCategories();
    fetchBranchs();
    fetchHashtags();
  }, [tokoId]);

  // Set category options
  const fullCategoryOptions = useMemo(() => {
    return categories.map((kategori) => ({
      label: kategori.nama_kategori,
      value: kategori.id as number,
    }));
  }, [categories]);

  const [filteredCategoryItems, setFilteredCategoryItems] = useState(fullCategoryOptions);

  useEffect(() => {
    setFilteredCategoryItems(fullCategoryOptions);
  }, [fullCategoryOptions]);

  useEffect(() => {
    if (categoryInputValue === "") {
      setFilteredCategoryItems(fullCategoryOptions);
    } else {
      const filtered = fullCategoryOptions.filter((item) =>
        startsWith(item.label, categoryInputValue)
      );
      setFilteredCategoryItems(filtered);
    }
  }, [categoryInputValue, startsWith, fullCategoryOptions]);

  const handleCategorySelectionChange = useCallback(
    (key: React.Key | null) => {
      if (key !== null) {
        setValue("kategoriId", key, { shouldValidate: true });
        const selectedItem = fullCategoryOptions.find(
          (item) => String(item.value) === String(key)
        );
        if (selectedItem) {
          setCategoryInputValue(selectedItem.label);
        }
      }
    },
    [setValue, fullCategoryOptions]
  );

  // Pre-populate data in Edit Mode
  useEffect(() => {
    if (initialData) {
      const cabangData = initialData.produkCabangs?.map((pc) => ({
        cabangId: pc.cabang.id as number,
        status: pc.status,
      })) || [];
      const hashtagIds = initialData.hashtags?.map((ph) => ph.hashtag.id as number) || [];

      reset({
        nama_produk: initialData.nama_produk,
        harga: initialData.harga,
        deskripsi: initialData.deskripsi || "",
        kategoriId: initialData.kategoriId,
        cabangData: cabangData,
        hashtagIds: hashtagIds,
        thumbnail: "",
      });

      if (initialData.kategori) {
        setCategoryInputValue(initialData.kategori.nama_kategori);
      }
    } else {
      reset({
        nama_produk: "",
        harga: "",
        deskripsi: "",
        kategoriId: "",
        cabangData: [],
        hashtagIds: [],
        thumbnail: "",
      });
      setCategoryInputValue("");
    }
  }, [initialData, reset]);

  // Thumbnail field config
  const uploadFieldConfig: UploadFieldProps = {
    key: "thumbnail",
    label: "Foto Produk",
    type: "upload",
    placeholder: "Pilih file thumbnail (PNG, JPG)",
    maxSize: 5 * 1024 * 1024,
    allowedExtensions: [".png", ".jpg", ".jpeg"],
    previewUrl: mode === "update" && initialData?.thumbnail ? env.baseUrl + initialData.thumbnail : "",
  };

  const onCancel = () => {
    navigate("/dashboard/manage-product");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header & Back Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button
            color="default"
            variant="flat"
            isIconOnly
            onPress={onCancel}
            aria-label="Kembali"
            className="rounded-xl border border-gray-200/80 dark:border-zinc-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {mode === "create" ? "Tambah Produk Baru" : "Edit Produk"}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {mode === "create"
                ? "Buat produk baru dan tautkan ke cabang serta hashtag."
                : `Perbarui informasi untuk ${initialData?.nama_produk || "produk Anda"}.`}
            </p>
          </div>
        </div>

        {/* Top actions for desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <Button
            color="default"
            variant="flat"
            onPress={onCancel}
            startContent={<X className="w-4 h-4" />}
            className="rounded-xl font-medium"
          >
            Batal
          </Button>
          <Button
            color="primary"
            type="submit"
            isLoading={isLoading}
            startContent={<Save className="w-4 h-4" />}
            className="rounded-xl font-medium bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
          >
            {mode === "create" ? "Simpan Produk" : "Perbarui Produk"}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Input fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Informasi Utama */}
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-zinc-800 pb-3">
              <Layers className="w-4 h-4 text-primary" />
              <span>Informasi Utama</span>
            </h2>

            <div className="space-y-4">
              <Input
                label="Nama Produk"
                placeholder="Masukkan nama produk..."
                variant="bordered"
                classNames={{
                  inputWrapper: "border-gray-200 dark:border-zinc-800",
                }}
                {...register("nama_produk")}
                isInvalid={!!errors.nama_produk}
                errorMessage={errors.nama_produk?.message as string}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Harga"
                  placeholder="Masukkan harga..."
                  variant="bordered"
                  classNames={{
                    inputWrapper: "border-gray-200 dark:border-zinc-800",
                  }}
                  {...register("harga")}
                  isInvalid={!!errors.harga}
                  errorMessage={errors.harga?.message as string}
                />

                <Select
                  label="Status Tampilkan"
                  placeholder="Pilih status..."
                  variant="bordered"
                  classNames={{
                    trigger: "border-gray-200 dark:border-zinc-800",
                  }}
                  selectedKeys={watch("status") ? [watch("status") as string] : []}
                  onChange={(e) =>
                    setValue("status", e.target.value as any, { shouldValidate: true })
                  }
                  isInvalid={!!errors.status}
                  errorMessage={errors.status?.message as string}
                >
                  <SelectItem key="tampilkan">tampilkan</SelectItem>
                  <SelectItem key="sembunyikan">sembunyikan</SelectItem>
                </Select>
              </div>

              <Textarea
                label="Deskripsi Produk"
                placeholder="Masukkan deskripsi detail..."
                variant="bordered"
                classNames={{
                  inputWrapper: "border-gray-200 dark:border-zinc-800",
                }}
                minRows={4}
                {...register("deskripsi")}
                isInvalid={!!errors.deskripsi}
                errorMessage={errors.deskripsi?.message as string}
              />
            </div>
          </div>

          {/* Card: Kategori, Cabang & Hashtag */}
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-50 dark:border-zinc-800 pb-3">
              <Tag className="w-4 h-4 text-primary" />
              <span>Relasi & Klasifikasi</span>
            </h2>

            <div className="space-y-4">
              <Autocomplete
                label="Kategori"
                placeholder="Pilih kategori..."
                variant="bordered"
                items={filteredCategoryItems}
                inputValue={categoryInputValue}
                onInputChange={setCategoryInputValue}
                selectedKey={watch("kategoriId")}
                onSelectionChange={handleCategorySelectionChange}
                isInvalid={!!errors.kategoriId}
                errorMessage={errors.kategoriId?.message as string}
              >
                {(item) => (
                  <AutocompleteItem key={String(item.value)} textValue={item.label}>
                    {item.label}
                  </AutocompleteItem>
                )}
              </Autocomplete>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cabang Multi-select */}
                <div className="flex flex-col gap-2">
                  <Select
                    label="Cabang"
                    placeholder="Pilih cabang..."
                    variant="bordered"
                    classNames={{
                      trigger: "border-gray-200 dark:border-zinc-800",
                    }}
                    selectionMode="multiple"
                    selectedKeys={((watch("cabangData") || []).map((c) => String(c.cabangId)))}
                    onSelectionChange={(keys) => {
                      const selectedIds = Array.from(keys).map(Number);
                      const currentCabangData = watch("cabangData") || [];
                      const newCabangData = selectedIds.map((id) => {
                        const existingItem = currentCabangData.find((cd) => cd.cabangId === id);
                        return {
                          cabangId: id,
                          status: existingItem ? existingItem.status : ("tersedia" as const),
                        };
                      });
                      setValue("cabangData", newCabangData, { shouldValidate: true });
                    }}
                    isInvalid={!!errors.cabangData}
                    errorMessage={errors.cabangData?.message as string}
                    startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                  >
                    {branch.map((b) => (
                      <SelectItem key={String(b.id)}>{b.nama_cabang}</SelectItem>
                    ))}
                  </Select>

                  {/* Per-branch Stock Status Management */}
                  {((watch("cabangData") || [])).length > 0 && (
                    <div className="mt-2 p-3 rounded-xl border border-gray-150 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-950/20 space-y-2">
                      <h3 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Status Stok per Cabang
                      </h3>
                      <div className="space-y-1.5">
                        {((watch("cabangData") || [])).map((item, index) => {
                          const branchInfo = branch.find((b) => b.id === item.cabangId);
                          if (!branchInfo) return null;
                          return (
                            <div key={item.cabangId} className="flex items-center justify-between gap-4 p-2 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100 dark:border-zinc-800/80 shadow-sm">
                              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                                {branchInfo.nama_cabang}
                              </span>
                              <Select
                                size="sm"
                                aria-label={`Status stok untuk ${branchInfo.nama_cabang}`}
                                selectedKeys={[item.status]}
                                onChange={(e) => {
                                  const updated = [...(watch("cabangData") || [])];
                                  updated[index] = {
                                    ...updated[index],
                                    status: e.target.value as "tersedia" | "habis",
                                  };
                                  setValue("cabangData", updated, { shouldValidate: true });
                                }}
                                className="max-w-[120px]"
                                classNames={{
                                  trigger: "border-gray-200 dark:border-zinc-800 h-8 min-h-8",
                                }}
                                variant="bordered"
                              >
                                <SelectItem key="tersedia">Tersedia</SelectItem>
                                <SelectItem key="habis">Habis</SelectItem>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hashtag Multi-select */}
                <Select
                  label="Hashtag"
                  placeholder="Pilih hashtag..."
                  variant="bordered"
                  classNames={{
                    trigger: "border-gray-200 dark:border-zinc-800",
                  }}
                  selectionMode="multiple"
                  selectedKeys={(watch("hashtagIds") || []).map(String)}
                  onSelectionChange={(keys) => {
                    const numericValues = Array.from(keys).map((k) => Number(k));
                    setValue("hashtagIds", numericValues, { shouldValidate: true });
                  }}
                  isInvalid={!!errors.hashtagIds}
                  errorMessage={errors.hashtagIds?.message as string}
                  startContent={<Tag className="w-4 h-4 text-gray-400" />}
                >
                  {hashtags.map((h) => (
                    <SelectItem key={String(h.id)}>#{h.nama}</SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Upload & Save Actions */}
        <div className="space-y-6">
          {/* Card: Media Upload */}
          <div className="bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <ImageUploadField
              field={uploadFieldConfig}
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          </div>

          {/* Action Card for Mobile / Responsive */}
          <div className="sm:hidden flex flex-col gap-2 bg-white dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <Button
              color="primary"
              type="submit"
              isLoading={isLoading}
              startContent={<Save className="w-4 h-4" />}
              className="w-full rounded-xl bg-primary shadow-lg shadow-primary/20"
            >
              {mode === "create" ? "Simpan Produk" : "Perbarui Produk"}
            </Button>
            <Button
              color="default"
              variant="flat"
              onPress={onCancel}
              startContent={<X className="w-4 h-4" />}
              className="w-full rounded-xl"
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductForm;
