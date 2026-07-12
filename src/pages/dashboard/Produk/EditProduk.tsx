import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "@heroui/react";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import ProductForm from "@/components/Dashboard/ProductForm";
import { produkService } from "@/services/ProdukService";
import type { Produk, ProdukUpdatePayload } from "@/models";
import { useAuth } from "@/context/AuthContext";

const EditProduk: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [produk, setProduk] = useState<Produk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchProduk = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await produkService.show(Number(id));
      setProduk(response.data);
    } catch (error: any) {
      console.error("Gagal memuat produk:", error);
      setErrorMsg("Gagal memuat detail produk. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduk();
  }, [fetchProduk]);

  const handleUpdate = async (formData: Record<string, any>) => {
    if (!id) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        ...formData,
        tokoId: user?.toko?.id,
      };
      await produkService.update(Number(id), payload as ProdukUpdatePayload);
      navigate("/dashboard/manage-product");
    } catch (error: any) {
      console.error("Gagal memperbarui produk:", error);
      setErrorMsg(error?.message || "Gagal memperbarui produk. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <DashboardBreadcrumbs />
      
      {errorMsg && (
        <div className="p-4 mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30">
          {errorMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Spinner size="lg" />
          <span className="text-sm text-gray-500">Memuat detail produk...</span>
        </div>
      ) : (
        <ProductForm
          mode="update"
          initialData={produk}
          onSubmit={handleUpdate}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default EditProduk;
