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
  Faq,
  FaqCreatePayload,
  FaqUpdatePayload
} from "@/models";
import { faqService } from "@/services/FaqService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import { env } from "@/lib/env";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqSchema, type FaqSchema } from "@/schemas/FaqSchema";
import { useAuth } from "@/context/AuthContext";

const getFormFields = (mode: "create" | "update"): FormFieldConfig[] => {
  const allFields = {
    pertanyaan: {
      key: "pertanyaan",
      label: "Pertanyaan",
      type: "textarea",
      placeholder: "Masukkan pertanyaan...",
    },
    jawaban: {
      key: "jawaban",
      label: "Jawaban",
      type: "textarea",
      placeholder: "Masukkan jawaban...",
    },
  } as const;

  return [
    allFields.pertanyaan, 
    allFields.jawaban];
};

const faqColumns: Column<Faq>[] = [
  { name: "Pertanyaan", uid: "pertanyaan", sortable: true, defaultVisible: true },
  { name: "Jawaban", uid: "jawaban", sortable: true, defaultVisible: true },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageFaq = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Faq | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Faq | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<Faq | null>(null);
  const {user}  = useAuth()

  const handleOpenDeleteModal = (item: Faq) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: Faq) => {
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
  } = useForm<FaqSchema>({
    resolver: zodResolver(faqSchema),
    mode: 'onChange',
  });

  useEffect(() => {
    if (editingItem) {
      reset({...editingItem});
    } else {
      reset({
        pertanyaan: "",
        jawaban: "",
      });
    }
  }, [editingItem, reset]);

  const displayFields: DisplayFieldConfig<Faq>[] = [
    { key: "pertanyaan", label: "Pertanyaan" },
    { key: "jawaban", label: "Jawaban" },
    {
      key: "createdAt",
      label: "Tanggal Bergabung",
      render: (item: Faq) =>
        item.createdAt &&
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
  ];

  const handleOpenViewModal = (item: Faq) => {
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
      const response = await faqService.index({
        tokoId: user?.toko?.id,
        page: paginationInfo.page,
        limit: paginationInfo.limit,
        search: filterValue || undefined,
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
        await faqService.update(
          Number(editingItem.id),
          payload as FaqUpdatePayload
        );
      } else {
        await faqService.create(payload as FaqUpdatePayload);
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
      await faqService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Manage Faq</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={faqColumns}
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
          editingItem ? "Edit Faq" : "Tambah Faq Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
      />
      <ShowModal<Faq>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail Faq"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Faq"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.pertanyaan}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageFaq;
