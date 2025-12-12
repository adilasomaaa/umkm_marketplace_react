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
  PemilikToko,
  PemilikTokoCreatePayload,
  PemilikTokoUpdatePayload,
  Toko
} from "@/models";
import { pemilikTokoService } from "@/services/PemilikTokoService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pemilikTokoCreateSchema, pemilikTokoUpdateSchema } from "@/schemas/PemilikTokoSchema";
import { tokoService } from "@/services/TokoService";

const getFormFields = (mode: "create" | "update", listToko : Toko[]): FormFieldConfig[] => {
  if(mode === "create") {
    const allFields = {
      nama_pemilik: { key: "nama_pemilik", label: "Nama Pemilik", type: "text", placeholder: "Masukkan nama pemilik..." },
      tokoId: {
        key: "tokoId",
        label: "Toko",
        type: "select",
        placeholder: "Pilih Toko",
        options: listToko.map(toko => ({
          label: toko.nama_toko,
          value: toko.id as number,
        })),
      },
      email: { key: "email", label: "Email", type: "email", placeholder: "Masukkan email..." },
    } as const;    

    return [
      allFields.nama_pemilik,
      allFields.tokoId,
      allFields.email
    ];
  }else {
    const allFields = {
      nama: { key: "nama", label: "Nama Pemilik", type: "text", placeholder: "Masukkan nama pemilik..." },
      email: { key: "email", label: "Email", type: "text", placeholder: "Masukkan Email..." },
      jabatan: { key: "jabatan", label: "Jabatan", type: "text", placeholder: "Masukkan Jabatan..." },
      status: {
        key: "status",
        label: "Status",
        type: "select",
        placeholder: "Pilih status...",
        options: [
          { label: "aktif", value: "aktif" },
          { label: "nonaktif", value: "nonaktif" }
        ],
      },
    } as const;

    return [
      allFields.nama,
      allFields.email,
      allFields.jabatan,
      allFields.status,
    ];
  }

};

const pemilik_tokoColumns: Column<PemilikToko>[] = [
  {
    name: "Nama Pemilik",
    uid: "nama",
    sortable: true,
    defaultVisible: true,
  },
  { name: "Nama Toko", uid: "toko.nama_toko", sortable: true, defaultVisible: true },
  { name: "Jabatan", uid: "jabatan", sortable: true, defaultVisible: false },
  { name: "Email", uid: "user.email", sortable: true, defaultVisible: false },
  { name: "Status", uid: "status", sortable: true, defaultVisible: true },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManagePemilikToko = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PemilikToko | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PemilikToko | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<PemilikToko[]>([]);
  const [toko, setToko] = useState<Toko[]>([]);
  const [isLoadingToko, setIsLoadingToko] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<PemilikToko | null>(null);

  const handleOpenDeleteModal = (item: PemilikToko) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: PemilikToko) => {
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
  } = useForm<PemilikTokoCreatePayload | PemilikTokoUpdatePayload>({
    resolver: async (data :any , context, options :any) => {
      if (editingItem) {
        return zodResolver(pemilikTokoUpdateSchema)(data, context, options);
      } else {
        return zodResolver(pemilikTokoCreateSchema)(data, context, options);
      }
    },
    mode: 'onChange',
  });

  useEffect(() => {
      const fetchToko = async () => {
        try {
          const response = await tokoService.index();
          setToko(response.data);
        } catch (error) {
          console.error("Gagal mengambil data roles:", error);
          // Handle error, misalnya dengan menampilkan notifikasi
        } finally {
          setIsLoadingToko(false);
        }
      };
  
      fetchToko();
    }, []);

  useEffect(() => {
    if (editingItem) {
      reset({
        nama: editingItem.nama,
        email: editingItem.user.email,
        jabatan: editingItem.jabatan,
        photo: editingItem.user.photo,
        status: editingItem.status,
      });
    } else {
      reset({
        nama_pemilik: "",
        toko_id: 0,
        email: "",
      });
    }
  }, [editingItem, reset]);

  const displayFields: DisplayFieldConfig<PemilikToko>[] = [
    { key: "nama", label: "Nama Lengkap" },
    { key: "jabatan", label: "Jabatan" },
    { key: "toko", label: "Toko", render: (item: PemilikToko) => item.toko.nama_toko },
    { key: "user.username", label: "Username" },
    { key: "user.email", label: "Email" },
    {
      key: "status",
      label: "Status",
      render: (item: PemilikToko) => {
        const status = item.status;
        const statusColorMap: Record<string, "success" | "warning" | "danger"> =
          {
            active: "success",
            pending: "warning",
            inactive: "danger",
            banned: "danger",
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
    }
  ];

  const handleOpenViewModal = (item: PemilikToko) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingItem(null);
  };

  const formMode = editingItem ? "update" : "create";
  const activeFormFields = getFormFields(formMode, toko);
  

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
        { name: "Non Aktif", uid: "nonaktif" },
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
      const response = await pemilikTokoService.index({
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
        await pemilikTokoService.update(
          Number(editingItem.id),
          formData as PemilikTokoUpdatePayload
        );
      } else {
        await pemilikTokoService.create(formData as PemilikTokoCreatePayload);
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
      await pemilikTokoService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Kelola Pemilik Toko</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={pemilik_tokoColumns}
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
          editingItem ? "Edit Pemilik Toko" : "Tambah Pemilik Toko Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
      />
      <ShowModal<PemilikToko>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail Pemilik Toko"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Pemilik Toko"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.nama}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManagePemilikToko;
