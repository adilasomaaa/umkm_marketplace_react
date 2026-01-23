import React, { useCallback, useEffect, useState } from "react";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import {
  type SortDescriptor,
  type Selection,
  Link,
} from "@heroui/react";
import DataTable, {
  type Column,
  type FilterConfig,
} from "@/components/Dashboard/DataTable";
import type {
  SosialMedia,
  SosialMediaCreatePayload,
  SosialMediaUpdatePayload
} from "@/models";
import { sosialMediaService } from "@/services/SosialMediaService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import { env } from "@/lib/env";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sosialMediaSchema, type SosialMediaSchema } from "@/schemas/SosialMediaSchema";
import { useAuth } from "@/context/AuthContext";

const getFormFields = (mode: "create" | "update"): FormFieldConfig[] => {
  const allFields = {
    nama: {
      key: "nama",
      label: "Nama",
      type: "text",
      placeholder: "Masukkan nama...",
    },
    url: {
      key: "url",
      label: "URL",
      type: "text",
      placeholder: "Masukkan URL...",
    },
    tipe: {
      key: "tipe",
      label: "Tipe",
      type: "select",
      placeholder: "Pilih tipe...",
      options: [
        { label: "Facebook", value: "facebook" },
        { label: "Instagram", value: "instagram" },
        { label: "Twitter", value: "twitter" },
        { label: "Tiktok", value: "tiktok" },
        { label: "Youtube", value: "youtube" },
      ],
    }
  } as const;

  return [allFields.nama, allFields.url, allFields.tipe];
};

const sosialMediaColumns: Column<SosialMedia>[] = [
  { name: "Nama", uid: "nama", sortable: true, defaultVisible: true },
  { name: "Link", uid: "url", sortable: true, defaultVisible: true, renderCell: (sosialMedia) => <Link showAnchorIcon href={sosialMedia.url} target="_blank" rel="noopener noreferrer">{sosialMedia.url}</Link> },
  { name: "Tipe", uid: "tipe", sortable: true, defaultVisible: false },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageSosialMedia = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<SosialMedia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SosialMedia | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<SosialMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<SosialMedia | null>(null);

  const { user } = useAuth();

  const handleOpenDeleteModal = (item: SosialMedia) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: SosialMedia) => {
    setEditingItem(item);
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
  } = useForm<SosialMediaSchema>({
    resolver: zodResolver(sosialMediaSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (editingItem) {
      reset({...editingItem});
    } else {
      reset({
        nama: "",
        url: "",
        tipe: "facebook",
      });
    }
  }, [editingItem, reset]);

  const displayFields: DisplayFieldConfig<SosialMedia>[] = [
    { key: "nama", label: "Nama" },
    { key: "url", label: "Url" },
    { key: "tipe", label: "Tipe" },
    {
      key: "createdAt",
      label: "Tanggal Bergabung",
      render: (item: SosialMedia) =>
        item.createdAt && new Date(item.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
  ];

  const handleOpenViewModal = (item: SosialMedia) => {
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
      const response = await sosialMediaService.index({
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
        await sosialMediaService.update(
          Number(editingItem.id),
          payload as SosialMediaUpdatePayload
        );
      } else {
        await sosialMediaService.create(payload as SosialMediaCreatePayload);
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
      await sosialMediaService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Manage SosialMedia</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={sosialMediaColumns}
        paginationInfo={paginationInfo}
        setPaginationInfo={setPaginationInfo}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filters={filterConfig}
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
          editingItem ? "Edit SosialMedia" : "Tambah SosialMedia Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
      />
      <ShowModal<SosialMedia>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail SosialMedia"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus SosialMedia"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.nama}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageSosialMedia;
