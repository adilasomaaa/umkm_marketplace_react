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
  Kategori,
  KategoriCreatePayload,
  KategoriUpdatePayload
} from "@/models";
import { kategoriService } from "@/services/KategoriService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { kategoriSchema, type KategoriSchema } from "@/schemas/KategoriSchema";
import * as LucideIcons from "lucide-react";
import { useFilter } from "@react-aria/i18n";

const renderIconItem = (item: { label: string; value: string | number }) => {
    const IconName = item.value as keyof typeof LucideIcons;
    const IconComponent = LucideIcons[IconName];
    const Icon = IconComponent;

    return (
        <AutocompleteItem key={String(item.value)} textValue={item.label}>
            <div className="flex items-center gap-2">
                {Icon && <Icon size={18} />} 
                {item.label}
            </div>
        </AutocompleteItem>
    );
};

const getFormFields = (mode: "create" | "update"): FormFieldConfig[] => {
  const allFields = {
    nama_kategori: {
      key: "nama_kategori",
      label: "Nama Kategori",
      type: "text",
      placeholder: "Masukkan nama kategori...",
    },
    tipe: {
      key: "tipe",
      label: "Tipe",
      type: "select",
      placeholder: "Pilih Tipe...",
      options: [
        { label: "Produk", value: "produk" },
        { label: "Toko", value: "toko" },
      ],
    },
    icon: {
      key: "icon",
      label: "Ikon",
      type: "autocomplete",
      placeholder: "Pilih ikon...",
      renderItem: renderIconItem
    }
  } as const;

  return [
    allFields.nama_kategori,
    allFields.tipe,
    allFields.icon
  ];
};

const kategoriColumns: Column<Kategori>[] = [
  {
    name: "Nama Kategori",
    uid: "nama_kategori",
    sortable: true,
    defaultVisible: true,
    renderCell: (item: Kategori) => {
        const IconName = item.icon as keyof typeof LucideIcons;
        const IconComponent = IconName ? LucideIcons[IconName] : null;
        const Icon = IconComponent;
      
        return (
          <span className="flex items-center gap-2">
            {Icon && 
              <div className="bg-primary p-2 rounded">
                <Icon size={18} className="text-foreground-100" />
              </div>
            }
            <span>{item.nama_kategori}</span>
          </span>
        );
    },
  },
  {
    uid: "tipe",
    name: "Tipe",
    sortable: true,
    defaultVisible: true,
    renderCell: (item: Kategori) => {
      const tipe = item.tipe;
      const statusColorMap: Record<string, "success" | "warning"> =
        {
          toko: "success",
          produk: "warning"
        };
      return (
        <Chip
          color={statusColorMap[tipe] || "default"}
          size="sm"
          variant="flat"
        >
          {tipe}
        </Chip>
      );
    },
  },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageKategori = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Kategori | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Kategori | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Kategori[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Kategori | null>(null);

  const allIconNames = Object.keys(LucideIcons).filter(name => name.endsWith('Icon'));

  const fullIconOptions = allIconNames.map(name => ({
      label: name,
      value: name,
  }));
    
  const [iconInputValue, setIconInputValue] = useState("");
  const [selectedIconLabel, setSelectedIconLabel] = useState(""); 
  const [filteredIconItems, setFilteredIconItems] = useState(fullIconOptions);
    
  const { startsWith } = useFilter({ sensitivity: "base" });

  const handleOpenDeleteModal = (item: Kategori) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: Kategori) => {
    setEditingItem(item);
    const selectedIcon = fullIconOptions.find(icon => icon.value === item.icon);
    if (selectedIcon) {
        setIconInputValue(selectedIcon.label);
        setSelectedIconLabel(selectedIcon.label);
    } else {
        setIconInputValue("");
        setSelectedIconLabel("");
    }
    setIsModalOpen(true);
  };

  const handleOpenCreateModal = () => {
    reset();
    setIconInputValue("");
    setSelectedIconLabel("");
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
  } = useForm<KategoriSchema>({
    resolver: zodResolver(kategoriSchema),
    mode: 'onChange',
  });

  const handleIconSelectionChange = (key: string | number) => {
      const selectedItem = fullIconOptions.find(item => item.value === key);
      
      if (selectedItem) {
          setIconInputValue(selectedItem.label);
          setSelectedIconLabel(selectedItem.label); // Ini mungkin tidak terpakai, tapi menjaga konsistensi state

          setValue('icon', selectedItem.value, { shouldValidate: true });
      }
  };

  useEffect(() => {
    if (iconInputValue === "") {
        setFilteredIconItems(fullIconOptions);
    } else {
        const filtered = fullIconOptions.filter(item => 
            startsWith(item.label, iconInputValue)
        );
        setFilteredIconItems(filtered);
    }
  }, [iconInputValue, startsWith]);

  useEffect(() => {
    if (editingItem) {
      reset({...editingItem});
    } else {
      reset({
        nama_kategori: "",
        tipe: "toko",
      });
    }
  }, [editingItem, reset]);

  const displayFields: DisplayFieldConfig<Kategori>[] = [
    { key: "nama_kategori", label: "Nama Kategori" },
    {
      key: "tipe",
      label: "Tipe",
      render: (item: Kategori) => {
        const tipe = item.tipe;
        const statusColorMap: Record<string, "success" | "warning"> =
          {
            toko: "success",
            produk: "warning"
          };
        return (
          <Chip
            color={statusColorMap[tipe] || "default"}
            size="sm"
            variant="flat"
          >
            {tipe}
          </Chip>
        );
      },
    }
  ];

  const handleOpenViewModal = (item: Kategori) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingItem(null);
  };

  const formMode = editingItem ? "update" : "create";
  const activeFormFields = getFormFields(formMode);

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
      key: "tipe",
      label: "Tipe",
      type: "dropdown",
      selectionMode: "multiple",
      options: [
        { name: "Produk", uid: "produk" },
        { name: "Toko", uid: "toko" },
      ],
    },
  ];

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const tipeValue =
        filterState.tipe instanceof Set && filterState.tipe.size > 0
          ? Array.from(filterState.tipe).join(",")
          : undefined;
      const response = await kategoriService.index({
        page: paginationInfo.page,
        limit: paginationInfo.limit,
        search: filterValue,
        tipe: tipeValue,
      });
      setItems(response.data);
      setPaginationInfo(response.meta!);
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
      if (editingItem) {
        await kategoriService.update(
          Number(editingItem.id),
          formData as KategoriUpdatePayload
        );
      } else {
        await kategoriService.create(formData as KategoriCreatePayload);
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
      await kategoriService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Kelola Kategori</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={kategoriColumns}
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
          editingItem ? "Edit Kategori" : "Tambah Kategori Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
        autocompleteProps={{
            icon: {
                inputValue: iconInputValue, 
                items: filteredIconItems,
                onInputChange: setIconInputValue,
                onSelectionChange: handleIconSelectionChange,
                selectedKey: watch('icon'),
            }
        }}
      />
      <ShowModal<Kategori>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail Kategori"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.nama_kategori}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageKategori;
