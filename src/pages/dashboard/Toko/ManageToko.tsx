import { useCallback, useEffect, useState } from "react";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import {
  type SortDescriptor,
  type Selection
} from "@heroui/react";
import DataTable, {
  type Column,
  type FilterConfig,
} from "@/components/Dashboard/DataTable";
import type {
  Toko,
  TokoCreatePayload,
  TokoUpdatePayload
} from "@/models";
import { tokoService } from "@/services/TokoService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tokoCreateSchema, tokoUpdateSchema, type TokoCreateSchema, type TokoUpdateSchema } from "@/schemas/TokoSchema";

const getFormFields = (mode: "create" | "update"): FormFieldConfig[] => {
  if(mode === "create") {
    const allFields = {
      nama_pemilik: { key: "nama_pemilik", label: "Nama Pemilik", type: "text", placeholder: "Masukkan nama pemilik..." },
      nama_toko: { key: "nama_toko", label: "Nama Toko", type: "text", placeholder: "Masukkan nama toko..." },
      nib: { key: "nib", label: "Nomor Induk Berusaha (NIB)", type: "text", placeholder: "Masukkan NIB..." },
      email: { key: "email", label: "Email", type: "email", placeholder: "Masukkan email..." },
      status: {
        key: "status",
        label: "Status",
        type: "select",
        placeholder: "Pilih status...",
        options: [
          { label: "aktif", value: "aktif" },
          { label: "nonaktif", value: "nonaktif" },
          { label: "ditangguhkan", value: "ditangguhkan" }
        ],
      },
    } as const;

    return [
      allFields.nama_pemilik,
      allFields.nama_toko,
      allFields.nib,
      allFields.email,
      allFields.status
    ];
  }else {
    const allFields = {
      nama_toko: { key: "nama_toko", label: "Nama Toko", type: "text", placeholder: "Masukkan nama toko..." },
      nib: { key: "nib", label: "Nomor Induk Berusaha (NIB)", type: "text", placeholder: "Masukkan NIB..." },
      status: {
        key: "status",
        label: "Status",
        type: "select",
        placeholder: "Pilih status...",
        options: [
          { label: "aktif", value: "aktif" },
          { label: "nonaktif", value: "nonaktif" },
          { label: "ditangguhkan", value: "ditangguhkan" }
        ],
      },
    } as const;

    return [
      allFields.nama_toko,
      allFields.nib,
      allFields.status,
    ];
  }

};

const tokoColumns: Column<Toko>[] = [
  {
    name: "Nama Toko",
    uid: "nama_toko",
    sortable: true,
    defaultVisible: true,
  },
  { name: "NIB", uid: "nib", sortable: true, defaultVisible: true },
  { name: "Pemilik", uid: "PemilikTokonama", sortable: true, defaultVisible: true, renderCell: (item: Toko) => (
      <div className="flex items-center gap-2">
        {item.PemilikToko
          .filter(pemilik => pemilik.jabatan == 'Owner')
          .map(pemilik => (
            <div key={pemilik.id} className="flex items-center gap-2">
              <span>{pemilik.nama}</span>
            </div>
          ))
        }
      </div>
    )
  },
  { name: "Rating", uid: "rating", sortable: true, defaultVisible: false },
  { name: "Status", uid: "status", sortable: true, defaultVisible: true },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageToko = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Toko | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Toko | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Toko[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Toko | null>(null);

  const handleOpenDeleteModal = (item: Toko) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: Toko) => {
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
  } = useForm<TokoCreateSchema | TokoUpdateSchema>({
    resolver: async (data :any , context, options :any) => {
      if (editingItem) {
        return zodResolver(tokoUpdateSchema)(data, context, options);
      } else {
        return zodResolver(tokoCreateSchema)(data, context, options);
      }
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        nama_toko: editingItem.nama_toko,
        nib: editingItem.nib,
        status: editingItem.status,
      });
    } else {
      reset({
        email: "",
        nama_pemilik: "",
        nama_toko: "",
        nib: "",
      });
    }
  }, [editingItem, reset]);

  const displayFields: DisplayFieldConfig<Toko>[] = [
    { key: "nama_toko", label: "Nama Toko" },
    { key: "nib", label: "nib" },
    { key: "deskripsi", label: "Deskripsi" },
    { key: "nomor_hp", label: "Kontak" },
    { key: "status", label: "Status" },
    {
      key: "PemilikToko",
      label: "Pemilik",
      render: (item: Toko) => (
        <div className="flex items-center gap-2">
        {item.PemilikToko
          .filter(pemilik => pemilik.jabatan == 'Owner') // 1. Saring dulu, ambil Owner saja
          .map(pemilik => ( // 2. Baru di-map (render)
            <div key={pemilik.id} className="flex items-center gap-2">
              <span>{pemilik.nama}</span>
            </div>
          ))
        }
      </div>
      ),
    },
  ];

  const handleOpenViewModal = (item: Toko) => {
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
        { name: "aktif", uid: "aktif" },
        { name: "nonaktif", uid: "nonaktif" },
        { name: "ditangguhkan", uid: "ditangguhkan" },
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
      const response = await tokoService.index({
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
        await tokoService.update(
          Number(editingItem.id),
          formData as TokoUpdatePayload
        );
      } else {
        await tokoService.create(formData as TokoCreatePayload);
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
      await tokoService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Kelola Toko</h1>
        <DataTable
          data={items}
          isLoading={isLoading}
          columns={tokoColumns}
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
      <ShowModal<Toko>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail Toko"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Toko"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.nama_toko}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageToko;
