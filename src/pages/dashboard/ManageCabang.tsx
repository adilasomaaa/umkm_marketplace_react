import { useCallback, useEffect, useState } from "react";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import {
  type SortDescriptor,
  type Selection,
  Chip,
} from "@heroui/react";
import DataTable, {
  type Column,
  type FilterConfig,
} from "@/components/Dashboard/DataTable";
import type {
  Cabang,
  CabangCreatePayload,
  CabangUpdatePayload
} from "@/models";
import { cabangService } from "@/services/CabangService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";

import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cabangSchema, type CabangSchema } from "@/schemas/CabangSchema";
import { useAuth } from "@/context/AuthContext";

const getFormFields = (_mode: "create" | "update"): FormFieldConfig[] => {
  const allFields = {
    nama_cabang: {
      key: "nama_cabang",
      label: "Nama Cabang",
      type: "text",
      placeholder: "Masukkan nama cabang...",
    },
    tipe: {
      key: "tipe",
      label: "Tipe",
      type: "select",
      placeholder: "Pilih status...",
      options: [
        { label: "Primer", value: "primer" },
        { label: "Sekunder", value: "sekunder" },
      ],
    },
    alamat: {
      key: "alamat",
      label: "Alamat Cabang",
      type: "textarea",
      placeholder: "Masukkan alamat cabang...",
    },
    status: {
      key: "status",
      label: "Status",
      type: "select",
      placeholder: "Pilih status...",
      options: [
        { label: "Aktif", value: "aktif" },
        { label: "Nonaktif", value: "nonaktif" },
      ],
    },
  } as const;

  return [
    allFields.nama_cabang,
    allFields.tipe,
    allFields.alamat,
    allFields.status
  ];
};

const cabangColumns: Column<Cabang>[] = [
  { name: "Nama Cabang", uid: "nama_cabang", sortable: true, defaultVisible: true },
  { name: "Tipe", uid: "tipe", sortable: true, defaultVisible: false },
  { name: "Alamat", uid: "alamat", sortable: true, defaultVisible: true },
  { name: "Status", uid: "status", sortable: true, defaultVisible: true },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageCabang = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Cabang | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Cabang | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Cabang[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Cabang | null>(null);

  const { user } = useAuth();

  const handleOpenDeleteModal = (item: Cabang) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: Cabang) => {
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
  } = useForm<CabangSchema>({
    resolver: zodResolver(cabangSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (editingItem) {
      reset({...editingItem});
    } else {
      reset({
        nama_cabang: "",
        tipe: "",
        alamat: "",
        status: "aktif",
      });
    }
  }, [editingItem, reset]);

  const displayFields: DisplayFieldConfig<Cabang>[] = [
    { key: "nama_cabang", label: "Nama Cabang" },
    { key: "tipe", label: "tipe" },
    { key: "alamat", label: "alamat" },
    {
      key: "status",
      label: "Status",
      render: (item: Cabang) => {
        const status = item.status;
        const statusColorMap: Record<string, "success" | "warning" | "danger"> =
          {
            aktif: "success",
            nonaktif: "danger",
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
      label: "Tanggal Bergabung",
      render: (item: Cabang) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
          : "",
    },
  ];

  const handleOpenViewModal = (item: Cabang) => {
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
        { name: "Aktif", uid: "aktif" },
        { name: "Nonaktif", uid: "nonaktif" },
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
      const response = await cabangService.index({
        tokoId: user?.toko?.id,
        page: paginationInfo.page,
        limit: paginationInfo.limit,
        search: filterValue || undefined,
        status: statusValue || undefined,
      });
      setItems(response.data);
      setPaginationInfo(response.meta || { page: 1, limit: 10, totalData: 0, totalPages: 1 });
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
        const payload = {
          ...formData,
          tokoId: user?.toko?.id,
        };
        await cabangService.update(
          Number(editingItem.id),
          payload as CabangUpdatePayload
        );
      } else {
        const payload = {
          ...formData,
          tokoId: user?.toko?.id,
        };
        await cabangService.create(payload as CabangCreatePayload);
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
      await cabangService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Manage Cabang</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={cabangColumns}
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
          editingItem ? "Edit Cabang" : "Tambah Cabang Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
      />
      <ShowModal<Cabang>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail Cabang"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Cabang"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.nama_cabang}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageCabang;
