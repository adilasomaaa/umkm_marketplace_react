import { useCallback, useEffect, useState } from "react";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import {
  type SortDescriptor,
  type Selection,
  Avatar,
  Chip,
  Button,
} from "@heroui/react";
import DataTable, {
  type Column,
  type FilterConfig,
} from "@/components/Dashboard/DataTable";
import type { Produk } from "@/models";
import { produkService } from "@/services/ProdukService";
import type { DisplayFieldConfig } from "@/types";
import { env } from "@/lib/env";
import ShowModal from "@/components/Dashboard/ShowModal";
import DeleteModal from "@/components/Dashboard/DeleteModal";
import { useAuth } from "@/context/AuthContext";
import { currency_format } from "@/lib/number_format";
import { Link, useNavigate } from "react-router-dom";
import ManageHashtagModal from "@/components/Dashboard/ManageHashtagModal";
import { Tag } from "lucide-react";

const produkColumns: Column<Produk>[] = [
  {
    name: "Nama Produk",
    uid: "nama_produk",
    sortable: true,
    defaultVisible: true,
    renderCell: (item: Produk) => (
      <Link to={`/dashboard/manage-product/${item.id}`} className="cursor-pointer">
        <div className="flex items-center gap-4">
          <Avatar src={item.thumbnail && !item.thumbnail.includes('null') && !item.thumbnail.includes('undefined') ? env.baseUrl + item.thumbnail : undefined} />
          <div className="flex flex-col">
            <span className="font-medium text-gray-900 dark:text-white">{item.nama_produk}</span>
            {item.hashtags && item.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.hashtags.map((ph) => (
                  <Chip key={ph.id} size="sm" variant="flat" color="secondary" className="text-[10px] h-4 min-h-4 px-1">
                    #{ph.hashtag?.nama || ""}
                  </Chip>
                ))}
              </div>
            )}
            <span className="text-gray-500 text-xs mt-0.5">{item.totalUlasan} ulasan</span>
          </div>
        </div>
      </Link>
    ),
  },
  { name: "Harga", uid: "harga", sortable: true, defaultVisible: true, renderCell: (item: Produk) => <span>{currency_format(item.harga)}</span> },
  { name: "Kategori", 
    uid: "kategori.nama_kategori", 
    sortable: true, 
    defaultVisible: true, 
    renderCell: (item: Produk) => (
      <div className="flex items-center gap-2">
        <Chip size="sm" color="primary">{item.kategori?.nama_kategori || ""}</Chip>
      </div>
    )
  },
  { name: "Cabang", 
    uid: "produkCabangs[0].nama_cabang", 
    sortable: true, 
    defaultVisible: true, 
    renderCell: (item: Produk) => (
      <div className="flex flex-wrap gap-1.5 max-w-[250px]">
        {item.produkCabangs?.map((pc, index) => {
          const isTersedia = pc.status === "tersedia";
          return (
            <Chip
              size="sm"
              variant="flat"
              key={`${index}-${pc.id}`}
              color={isTersedia ? "success" : "danger"}
              className="text-xs font-medium"
            >
              {pc.cabang?.nama_cabang || "Cabang"} ({isTersedia ? "Tersedia" : "Habis"})
            </Chip>
          );
        })}
      </div>
    )
  },
  { name: "Dibuat pada", 
    uid: "createdAt", 
    sortable: true, 
    defaultVisible: false, 
    renderCell: (item: Produk) => (
      <span>{ item.createdAt && new Date(item.createdAt).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}</span>
    )
  },
  { name: "ACTIONS", uid: "actions", defaultVisible: true },
];

const ManageProduk = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Produk | null>(null);
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
  const [isHashtagModalOpen, setIsHashtagModalOpen] = useState(false);

  const handleOpenDeleteModal = (item: Produk) => {
    setDeletingItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingItem(null);
  };

  const handleOpenEditModal = (item: Produk) => {
    navigate(`/dashboard/manage-product/edit/${item.id}`);
  };

  const handleOpenCreateModal = () => {
    navigate("/dashboard/manage-product/create");
  };

  const displayFields: DisplayFieldConfig<Produk>[] = [
    { key: "nama_produk", label: "Nama Produk" },
    { key: "harga", label: "Harga", render(item) {
      return `${currency_format(item.harga)}`
    }, },
    { key: "kategori.nama_kategori", label: "Nama Kategori" },
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
  }, [paginationInfo.page, paginationInfo.limit, filterValue, filterState, user?.toko?.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [fetchItems]);

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
      <div className="flex justify-between items-center my-4">
        <h1 className="text-2xl font-semibold">Manage Produk</h1>
        <Button
          color="secondary"
          variant="flat"
          startContent={<Tag className="w-4 h-4" />}
          onPress={() => setIsHashtagModalOpen(true)}
          className="shadow-sm font-medium"
        >
          Kelola Hashtag
        </Button>
      </div>
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
      <ManageHashtagModal
        isOpen={isHashtagModalOpen}
        onClose={() => setIsHashtagModalOpen(false)}
        tokoId={user?.toko?.id}
        onHashtagsChanged={fetchItems}
      />
    </div>
  );
};

export default ManageProduk;
