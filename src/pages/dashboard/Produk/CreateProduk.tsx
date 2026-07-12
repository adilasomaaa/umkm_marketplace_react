import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardBreadcrumbs from "@/components/Dashboard/Breadcrumbs";
import ProductForm from "@/components/Dashboard/ProductForm";
import { produkService } from "@/services/ProdukService";
import type { ProdukCreatePayload } from "@/models";
import { useAuth } from "@/context/AuthContext";

const CreateProduk: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async (formData: Record<string, any>) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        ...formData,
        tokoId: user?.toko?.id,
      };
      await produkService.create(payload as ProdukCreatePayload);
      navigate("/dashboard/manage-product");
    } catch (error: any) {
      console.error("Gagal menyimpan data:", error);
      setErrorMsg(error?.message || "Gagal membuat produk. Silakan coba lagi.");
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
      <ProductForm
        mode="create"
        onSubmit={handleCreate}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default CreateProduk;