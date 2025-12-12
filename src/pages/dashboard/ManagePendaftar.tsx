import React, { useCallback, useEffect, useState } from "react";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import {
  type SortDescriptor,
  type Selection,
  Avatar,
  Chip,
} from "@heroui/react";
import DataTable, {
  type Column,
  type FilterConfig,
} from "@/components/Dashboard/DataTable";
import type {
  Pendaftar,
  PendaftarCreatePayload,
  PendaftarUpdatePayload
} from "@/models";
import { pendaftarService } from "@/services/PendaftarService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pendaftarSchema, pendaftarUpdateSchema, type PendaftarSchema, type PendaftarUpdateSchema } from "@/schemas/PendaftarSchema";

const getFormFields = (mode: "create" | "update"): FormFieldConfig[] => {
  const allFields = {
    status: {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "Pilih status...",
      options: [
        { label: "menunggu", value: "menunggu" },
        { label: "diterima", value: "diterima" },
        { label: "ditolak", value: "ditolak" },
      ],
    },
  } as const;

  return [allFields.status];
};

const pendaftarColumns: Column<Pendaftar>[] = [
  { name: "NIB", uid: "nib", sortable: true, defaultVisible: true },
  { name: "Nama Pemilik", uid: "nama_pemilik", sortable: true, defaultVisible: true },
  { name: "Nama Toko", uid: "nama_toko", sortable: true, defaultVisible: true },
  { name: "Email", uid: "email", sortable: true, defaultVisible: false },
  { name: "Status", uid: "status", sortable: true, defaultVisible: true },
  { name: "Dibuat", uid: "createdAt", sortable: true, defaultVisible: true, renderCell: (item: Pendaftar) => {
    return new Date(item.createdAt).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }},
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManagePendaftar = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Pendaftar | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Pendaftar | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Pendaftar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Pendaftar | null>(null);

  const handleOpenDeleteModal = (item: Pendaftar) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: Pendaftar) => {
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
  } = useForm<PendaftarUpdateSchema>({
    resolver: zodResolver(pendaftarUpdateSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        status: editingItem.status as "menunggu" | "diterima" | "ditolak",
      });
    } 
  }, [editingItem, reset]);

  const displayFields: DisplayFieldConfig<Pendaftar>[] = [
    { key: "nama_pemilik", label: "Nama Pemilik" },
    { key: "nama_toko", label: "Nama Toko" },
    { key: "nib", label: "Nomor Induk Berusaha" },
    { key: "email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (item: Pendaftar) => {
        const status = item.status;
        const statusColorMap: Record<string, "success" | "warning" | "danger"> =
          {
            diterima: "success",
            menunggu: "warning",
            ditolak: "danger"
          };
        return (
          <Chip
            color={statusColorMap[status] || "default"}
            size="sm"
            variant="flat"
          >
            {status}
          </Chip>
        );
      },
    },
    {
      key: "createdAt",
      label: "Dibuat",
      render: (item: Pendaftar) =>
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
    }
  ];

  const handleOpenViewModal = (item: Pendaftar) => {
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
        { name: "Menunggu", uid: "menunggu" },
        { name: "Diterima", uid: "diterima" },
        { name: "Ditolak", uid: "ditolak" },
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
      const response = await pendaftarService.index({
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
      if (editingItem) {
        await pendaftarService.update(
          Number(editingItem.id),
          formData as PendaftarUpdatePayload
        );
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
      await pendaftarService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Kelola Pendaftar</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={pendaftarColumns}
        paginationInfo={paginationInfo}
        setPaginationInfo={setPaginationInfo}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        filters={filterConfig}
        filterState={filterState}
        setFilterState={setFilterState}
        sortDescriptor={sortDescriptor}
        setSortDescriptor={setSortDescriptor}
        onEditItem={handleOpenEditModal}
        onViewItem={handleOpenViewModal}
        onDeleteItem={handleOpenDeleteModal}
      />
      <InputModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingItem ? "Edit Pendaftar" : "Tambah Pendaftar Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
      />
      <ShowModal<Pendaftar>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail Pendaftar"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Pendaftar"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.nama_toko}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManagePendaftar;
