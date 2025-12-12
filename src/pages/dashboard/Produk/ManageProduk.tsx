import React, { useCallback, useEffect, useState } from "react";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import {
  type SortDescriptor,
  type Selection,
  Avatar,
  Chip,
  AutocompleteItem,
} from "@heroui/react";
import DataTable, {
  type Column,
  type FilterConfig,
} from "@/components/Dashboard/DataTable";
import type {
  Cabang,
  Kategori,
  Produk,
  ProdukCreatePayload,
  ProdukUpdatePayload
} from "@/models";
import { produkService } from "@/services/ProdukService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import { env } from "@/lib/env";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cabangService } from "@/services/CabangService";
import { kategoriService } from "@/services/KategoriService";
import { produkSchema, type ProdukSchema } from "@/schemas/ProdukSchema";
import { useAuth } from "@/context/AuthContext";
import { currency_format } from "@/lib/number_format";
import { useFilter } from "@react-aria/i18n";

const renderDefaultCategoryItem = (item: { label: string; value: number }) => {
    return (
        <AutocompleteItem key={String(item.value)} textValue={item.label}>
            {item.label}
        </AutocompleteItem>
    );
};
const getFormFields = (mode: "create" | "update", availableCategory: Kategori[], availableBranch: Cabang[], initialData: Produk | null): FormFieldConfig[] => {
  const allFields = {
    nama_produk: {
      key: "nama_produk",
      label: "Nama Produk",
      type: "text",
      placeholder: "Masukkan nama produk...",
    },
    deskripsi: {
      key: "deskripsi",
      label: "Deskripsi",
      type: "textarea",
      placeholder: "Masukkan deskripsi...",
    },
    harga: {
      key: "harga",
      label: "Harga",
      type: "number",
      placeholder: "Masukkan harga...",
    },
    kategoriId: {
      key: "kategoriId",
      label: "Kategori",
      type: "autocomplete",
      placeholder: "Pilih kategori...",
      options: availableCategory.map(kategori => ({
        label: kategori.nama_kategori,
        value: kategori.id as number,
      })),
      renderItem: renderDefaultCategoryItem
    },
    cabang_ids: {
      key: "cabangIds",
      label: "Cabang",
      type: "multi-select",
      placeholder: "Pilih cabang...",
      options: availableBranch.map(cabang => ({
        label: cabang.nama_cabang,
        value: cabang.id as number,
      })),
    },
    thumbnail: {
      key: "thumbnail",
      label: "Thumbnail",
      type: "upload",
      placeholder: "Pilih file thumbnail (PNG, JPG)",
      maxSize: 5 * 1024 * 1024,
      allowedExtensions: ['.png', '.jpg', '.jpeg'],
      previewUrl: mode === "update" ? env.baseUrl + initialData?.thumbnail : "",
    },
    status: {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "Pilih status...",
      options: [
        { label: "tampilkan", value: "tampilkan" },
        { label: "sembunyikan", value: "sembunyikan" },
      ],
    },
  } as const;

  return [allFields.nama_produk, allFields.deskripsi, allFields.harga, allFields.kategoriId, allFields.cabang_ids, allFields.thumbnail, allFields.status];
};

const produkColumns: Column<Produk>[] = [
  {
    name: "Nama Produk",
    uid: "nama_produk",
    sortable: true,
    defaultVisible: true,
    renderCell: (item: Produk) => (
      <div className="flex items-center gap-4">
        <Avatar src={env.baseUrl + item.thumbnail} />
        <span>{item.nama_produk}</span>
      </div>
    ),
  },
  { name: "Harga", uid: "harga", sortable: true, defaultVisible: true, renderCell: (item: Produk) => <span>{currency_format(item.harga)}</span> },
  { name: "Kategori", 
    uid: "kategori.nama_kategori", 
    sortable: true, 
    defaultVisible: true, 
    renderCell: (item: Produk) => (
      <div className="flex items-center gap-2">
        <Chip size="sm" color="primary">{item.kategori.nama_kategori}</Chip>
      </div>
    )
  },
  { name: "Cabang", 
    uid: "produkCabangs[0].nama_cabang", 
    sortable: true, 
    defaultVisible: true, 
    renderCell: (item: Produk) => (
      <div className="flex items-center gap-2">
        {item.produkCabangs.map((cabang, index) => (
          <Chip size="sm" variant="dot" key={`${index}-${cabang.id}`} color={index === 0 ? "primary" : "default"}>{cabang.cabang.nama_cabang}</Chip>
        ))}
      </div>
    )
  },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageProduk = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Produk | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Produk | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Produk[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Produk | null>(null);
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [branch, setBranch] = useState<Cabang[]>([]);
  const { user } = useAuth();

  const fullCategoryOptions = React.useMemo(() => {
    return categories.map(kategori => ({
        label: kategori.nama_kategori,
        value: kategori.id as number,
    }));
  }, [categories]);

  const [categoryInputValue, setCategoryInputValue] = useState("");
  const [filteredCategoryItems, setFilteredCategoryItems] = useState(fullCategoryOptions);
  
  const { startsWith } = useFilter({ sensitivity: "base" });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await kategoriService.index({
          limit: 100,
          tipe: "produk"
        });
        setCategories(categories.data);
      } catch (error) {
        console.error("Gagal mengambil kategori:", error);
      }
    }
    const fetchBranchs = async () => {
      try {
        const branchs = await cabangService.index({
          limit: 100,
          tokoId: user?.toko?.id
        });
        setBranch(branchs.data);
      } catch (error) {
        console.error("Gagal mengambil cabang:", error);
      }
    }

    fetchCategories();
    fetchBranchs();
  }, []);

  useEffect(() => {
    setFilteredCategoryItems(fullCategoryOptions);
  }, [fullCategoryOptions]);

  useEffect(() => {
    if (categoryInputValue === "") {
        setFilteredCategoryItems(fullCategoryOptions);
    } else {
        const filtered = fullCategoryOptions.filter(item => 
            startsWith(item.label, categoryInputValue)
        );
        setFilteredCategoryItems(filtered);
    }
  }, [categoryInputValue, startsWith, fullCategoryOptions]);

  const handleOpenDeleteModal = (item: Produk) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: Produk) => {
    const cabangIds = item.produkCabangs.map(pc => pc.cabang.id as number);
    const customItems = {
      cabangIds: cabangIds,
      ...item
    }    
    console.log(customItems);
    
    setEditingItem(customItems);
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    reset();
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProdukSchema>({
    resolver: zodResolver(produkSchema),
    mode: 'onChange',
  });

  const handleCategorySelectionChange = useCallback((key: string | number) => {
      setValue('kategoriId', key, { shouldValidate: true });
      // Setelah memilih, set input value menjadi label terpilih untuk tampilan
      const selectedItem = fullCategoryOptions.find(item => String(item.value) === String(key));
      if (selectedItem) {
        setCategoryInputValue(selectedItem.label);
      }
  }, [setValue, fullCategoryOptions]);

  useEffect(() => {
    if (editingItem) {
      reset({...editingItem, thumbnail: ""});
      // Inisialisasi categoryInputValue saat mode edit
      const selectedCategory = fullCategoryOptions.find(opt => opt.value === editingItem.kategoriId);
      if (selectedCategory) {
          setCategoryInputValue(selectedCategory.label);
      }
    } else {
      reset({
        nama_produk: "",
        harga: "",
        deskripsi: "",
        kategoriId: "",
        cabangIds: [],
        thumbnail: "",
      });
      setCategoryInputValue(""); // Kosongkan saat mode create
    }
  }, [editingItem, reset, fullCategoryOptions]);

  const displayFields: DisplayFieldConfig<Produk>[] = [
    { key: "name", label: "Nama Lengkap" },
    { key: "username", label: "Username" },
    { key: "user.email", label: "Email" },
    
    {
      key: "createdAt",
      label: "Tanggal Bergabung",
      render: (item: Produk) =>
        item.createdAt && new Date(item.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
  ];

  const handleOpenViewModal = (item: Produk) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingItem(null);
  };

  const formMode = editingItem ? "update" : "create";
  const activeFormFields = getFormFields(formMode, categories, branch, editingItem);

  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [filterState, setFilterState] = useState<
    Record<string, Selection | string>
  >({});

  const filterConfig: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      type: "dropdown",
      selectionMode: "multiple",
      options: [
        { name: "Active", uid: "active" },
        { name: "Pending", uid: "pending" },
        { name: "Banned", uid: "banned" },
      ],
    },
  ];

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusValue =
        filterState.status instanceof Set && filterState.status.size > 0
          ? Array.from(filterState.status).join(",")
          : undefined;
      const response = await produkService.index({
        tokoId: user?.toko?.id,
        page: paginationInfo.page,
        limit: paginationInfo.limit,
        search: filterValue || undefined,
        status: statusValue || undefined,
      });
      setItems(response.data);
      setPaginationInfo(response.meta);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [paginationInfo.page, paginationInfo.limit, filterValue, filterState]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchItems]);

  const onSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tokoId: user?.toko?.id,
      }
      if (editingItem) {
        await produkService.update(
          Number(editingItem.id),
          payload as ProdukUpdatePayload
        );
      } else {
        await produkService.create(payload as ProdukCreatePayload);
      }
      handleCloseModal();
      await fetchItems();
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      await produkService.delete(deletingItem.id);
      handleCloseDeleteModal();
      await fetchItems();
    } catch (error) {
      console.error("Gagal menghapus:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <DashboardBreadcrumbs />
      <h1 className="text-2xl font-semibold my-4">Manage Produk</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={produkColumns}
        paginationInfo={paginationInfo}
        setPaginationInfo={setPaginationInfo}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filters={filterConfig}
        filterState={filterState}
        setFilterState={setFilterState}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        onAddNew={handleOpenCreateModal}
        onEditItem={handleOpenEditModal}
        onViewItem={handleOpenViewModal}
        onDeleteItem={handleOpenDeleteModal}
      />
      <InputModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingItem ? "Edit Produk" : "Tambah Produk Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
        autocompleteProps={{ // ✨ Kirim Props untuk Controlled Autocomplete
            kategoriId: {
                inputValue: categoryInputValue, 
                items: filteredCategoryItems,
                onInputChange: setCategoryInputValue,
                onSelectionChange: handleCategorySelectionChange,
                selectedKey: watch('kategoriId'),
            }
        }}
      />
      <ShowModal<Produk>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail Produk"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.nama_produk}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageProduk;
