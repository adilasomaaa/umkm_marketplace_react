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
  User,
  UserUpdatePayload,
} from "@/models";
import { userService } from "@/services/UserService";
import type { DisplayFieldConfig, FormFieldConfig } from "@/types";
import InputModal from "@/components/Dashboard/InputModal";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Role } from "@/models/role";
import { roleService } from "@/services/RoleService";
import { userSchema, type UserSchema } from "@/schemas/UserSchema";

const getFormFields = (mode: "create" | "update", availableRoles: Role[]): FormFieldConfig[] => {
  const allFields = {
    username: { key: "username", label: "Username", type: "text", placeholder: "Masukkan username..." },
    email: { key: "email", label: "Email", type: "email", placeholder: "contoh@email.com" },
    role: {
      key: "roles",
      label: "Role",
      type: "multi-select",
      placeholder: "Pilih status...",
      options: availableRoles.map(role => ({
        label: role.name,
        value: role.id,
      })),
    },
  } as const;

  return [
    allFields.username,
    allFields.email,
    allFields.role
  ];
};

const userColumns: Column<User>[] = [
  { name: "Email",uid: "email",sortable: true,defaultVisible: true  },
  { name: "Username", uid: "username", sortable: true, defaultVisible: true },
  { name: "Role", 
    uid: "roles", 
    sortable: true, 
    defaultVisible: true, 
    renderCell: (item: User) => (
      <div className="flex flex-wrap gap-1">
        {item.userRole.map((role) => (
          <Chip key={role.id} size="sm" variant="flat">
            {role.name}
          </Chip>
        ))}
      </div>
    ) },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageUser = () => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    limit: 10,
    totalData: 0,
    totalPages: 1,
  });
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<User | null>(null);

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await roleService.index();
        setRoles(response.data);
      } catch (error) {
        console.error("Gagal mengambil data roles:", error);
        // Handle error, misalnya dengan menampilkan notifikasi
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue, // 👈 Tambahkan ini
    watch,
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    mode: 'onChange',
  });

  const handleOpenDeleteModal = (item: User) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: User) => {
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
    reset();
  };

  const displayFields: DisplayFieldConfig<User>[] = [
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (item) => item.userRole.map((role) => role.name).join(", ") },
    {
      key: "createdAt",
      label: "Tanggal Bergabung",
      render: (item) =>
        new Date(item.createdAt ?? "").toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
    },
  ];

  const handleOpenViewModal = (item: User) => {
    setViewingItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingItem(null);
  };

  const formMode = editingItem ? "update" : "create";
  const activeFormFields = getFormFields(formMode, roles);

  const [filterValue, setFilterValue] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  });
  const [filterState, setFilterState] = useState<
    Record<string, Selection | string>
  >({});


  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusValue =
        filterState.status instanceof Set && filterState.status.size > 0
          ? Array.from(filterState.status).join(",")
          : undefined;
      const response = await userService.index({
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

  useEffect(() => {
    if (editingItem && roles.length > 0) {
      const roleIds = editingItem.userRole
      .map(roleName => 
        roles.find(role => role.name === roleName.name)?.id
      )
      .filter(id => id !== undefined) as number[];

      reset({...editingItem, roles: roleIds });
    } else {
      reset({
        email: "",
        username: "",
        roles: [],
      });
    }
  }, [editingItem, reset]);

  const onSubmit = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        await userService.update(
          Number(editingItem.id),
          formData as UserUpdatePayload
        );
      } else {
        await userService.create(formData as UserUpdatePayload);
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
      await userService.delete(deletingItem.id);
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
      <h1 className="text-2xl font-semibold my-4">Kelola Pengguna</h1>
      <DataTable
        data={items}
        isLoading={isLoading}
        columns={userColumns}
        paginationInfo={paginationInfo}
        setPaginationInfo={setPaginationInfo}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
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
          editingItem ? "Edit User" : "Tambah User Baru"
        }
        fields={activeFormFields}
        register={register}
        onSubmit={handleSubmit(onSubmit)}
        errors={errors}
        setValue={setValue}
        watch={watch}
        isLoading={isSubmitting}
      />

      <ShowModal<User>
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        title="Detail User"
        data={viewingItem}
        fields={displayFields}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus "${deletingItem?.email}"? Aksi ini tidak dapat dibatalkan.`}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default ManageUser;
